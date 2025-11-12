import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import config from '../config';
import { IGeneratedSections } from '../models/Resume';

export interface AiGenerationRequest {
  skills: string[];
  experienceHistory?: Array<{
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    description?: string;
    achievements?: string[];
  }>;
  jobDescription?: string;
  templateType: 'fresher' | 'mid' | 'senior';
}

export interface AiGenerationResponse {
  summary?: string;
  skills?: string;
  experience?: string;
  education?: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  sample_count?: number;
  sample_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

class AiService {
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private readonly mockMode: boolean;

  constructor() {
    this.baseUrl = config.ollama.baseUrl;
    this.model = config.ollama.model;
    this.timeout = 60000; // 60 seconds
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.mockMode = process.env.AI_MOCK_MODE === 'true';
  }

  private buildPrompt(request: AiGenerationRequest): string {
    const { skills, experienceHistory, jobDescription, templateType } = request;

    const experienceText = experienceHistory && experienceHistory.length > 0
      ? experienceHistory.map(exp => 
          `- ${exp.position} at ${exp.company}${exp.description ? ': ' + exp.description : ''}${exp.achievements && exp.achievements.length > 0 ? '. Achievements: ' + exp.achievements.join(', ') : ''}`
        ).join('\n')
      : 'No experience provided';

    const prompt = `You are an expert resume writer. Generate a professional resume based on the following information:

Template Type: ${templateType}
Skills: ${skills.join(', ')}

Experience History:
${experienceText}

Job Description: ${jobDescription || 'Not provided'}

Please generate a comprehensive resume with the following sections:
1. Professional Summary - A compelling 2-3 sentence summary highlighting key qualifications
2. Skills Section - Enhanced skills description that incorporates the provided skills
3. Experience Section - Professional experience description if applicable
4. Education Section - Suggested education content based on the experience level

IMPORTANT: Respond with a valid JSON object only, containing these exact keys:
{
  "summary": "Professional summary text here",
  "skills": "Enhanced skills description here", 
  "experience": "Experience description here (or empty string for fresher)",
  "education": "Education content here"
}

Do not include any explanations, markdown formatting, or text outside the JSON object. Ensure the JSON is properly formatted and valid.`;

    return prompt;
  }

  private async callOllama(prompt: string): Promise<string> {
    const requestConfig: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/api/generate`,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        model: this.model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 2000,
        },
      },
    };

    try {
      const response: AxiosResponse<OllamaResponse> = await axios(requestConfig);
      return response.data.response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Ollama service is not available. Please ensure Ollama is running.');
        } else if (error.code === 'ETIMEDOUT') {
          throw new Error('Ollama request timed out. Please try again.');
        } else if (error.response) {
          throw new Error(`Ollama API error: ${error.response.status} - ${error.response.statusText}`);
        } else {
          throw new Error(`Network error when calling Ollama: ${error.message}`);
        }
      }
      throw new Error(`Unexpected error calling Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async callWithRetry(prompt: string): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.callOllama(prompt);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < this.maxRetries) {
          // Wait before retrying with exponential backoff
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Failed to call Ollama after retries');
  }

  private parseAiResponse(responseText: string): AiGenerationResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const jsonString = jsonMatch[0];
      const parsed = JSON.parse(jsonString);

      // Validate the structure
      const result: AiGenerationResponse = {
        summary: parsed.summary || '',
        skills: parsed.skills || '',
        experience: parsed.experience || '',
        education: parsed.education || '',
      };

      return result;
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateMockResponse(request: AiGenerationRequest): AiGenerationResponse {
    const { skills, experienceHistory, templateType } = request;

    const hasExperience = experienceHistory && experienceHistory.length > 0;
    
    return {
      summary: templateType === 'fresher' 
        ? `Motivated and enthusiastic ${skills[0] || 'professional'} with strong academic background and keen interest in learning new technologies. Seeking to apply technical skills and passion for innovation in a challenging role.`
        : `Experienced ${skills[0] || 'professional'} with ${hasExperience ? 'proven track record' : 'strong background'} in ${skills.slice(0, 3).join(', ')}. Committed to delivering high-quality results and driving organizational success through expertise and dedication.`,
      
      skills: `Technical Skills: ${skills.join(', ')}\nAdditional Skills: Problem-solving, Communication, Teamwork, Time Management, Critical Thinking${templateType === 'senior' ? ', Leadership, Project Management, Strategic Planning' : ''}`,
      
      experience: hasExperience 
        ? experienceHistory!.map(exp => 
            `${exp.position} at ${exp.company}${exp.description ? ': ' + exp.description : ''}${exp.achievements && exp.achievements.length > 0 ? '. Key achievements: ' + exp.achievements.join(', ') : ''}`
          ).join('\n\n')
        : templateType === 'fresher' 
          ? 'Entry-level position seeking opportunities to apply academic knowledge and develop professional experience.'
          : 'Professional experience with progressive responsibilities and consistent achievement of objectives.',
      
      education: templateType === 'fresher'
        ? 'Bachelor\'s degree in relevant field with strong academic performance. Coursework and projects demonstrate practical application of theoretical concepts.'
        : templateType === 'mid'
          ? 'Bachelor\'s degree in relevant field complemented by professional certifications and continuous learning initiatives.'
          : 'Advanced degree with specialized focus. Continuous professional development through industry certifications and executive education programs.'
    };
  }

  async generateResume(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    // Use mock mode if enabled
    if (this.mockMode) {
      return this.generateMockResponse(request);
    }

    try {
      const prompt = this.buildPrompt(request);
      const responseText = await this.callWithRetry(prompt);
      const parsedResponse = this.parseAiResponse(responseText);
      return parsedResponse;
    } catch (error) {
      // If AI generation fails, provide a basic fallback
      console.error('AI generation failed, using fallback:', error);
      return this.generateMockResponse(request);
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      if (this.mockMode) {
        return true;
      }

      const response = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  isMockMode(): boolean {
    return this.mockMode;
  }
}

export default new AiService();