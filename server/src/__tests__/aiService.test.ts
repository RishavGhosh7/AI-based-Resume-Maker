import axios from 'axios';
import aiService, { AiGenerationRequest, OllamaResponse } from '../services/aiService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('AiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.AI_MOCK_MODE;
  });

  describe('generateResume', () => {
    const mockRequest: AiGenerationRequest = {
      skills: ['JavaScript', 'TypeScript', 'React'],
      experienceHistory: [
        {
          company: 'Tech Corp',
          position: 'Senior Developer',
          startDate: new Date('2022-01-01'),
          endDate: new Date('2023-01-01'),
          description: 'Built amazing applications',
          achievements: ['Increased performance by 50%', 'Led team of 5']
        }
      ],
      jobDescription: 'Looking for a senior developer with React experience',
      templateType: 'senior'
    };

    const mockOllamaResponse: OllamaResponse = {
      model: 'llama2',
      created_at: '2023-01-01T00:00:00.000Z',
      response: JSON.stringify({
        summary: 'Experienced senior developer with expertise in JavaScript, TypeScript, and React.',
        skills: 'Technical Skills: JavaScript, TypeScript, React. Additional Skills: Leadership, Problem-solving',
        experience: 'Senior Developer at Tech Corp: Built amazing applications. Key achievements: Increased performance by 50%, Led team of 5',
        education: 'Bachelor\'s degree in Computer Science with advanced certifications.'
      }),
      done: true
    };

    it('should generate resume content successfully', async () => {
      mockedAxios.mockResolvedValueOnce({
        data: mockOllamaResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      const result = await aiService.generateResume(mockRequest);

      expect(result).toEqual({
        summary: 'Experienced senior developer with expertise in JavaScript, TypeScript, and React.',
        skills: 'Technical Skills: JavaScript, TypeScript, React. Additional Skills: Leadership, Problem-solving',
        experience: 'Senior Developer at Tech Corp: Built amazing applications. Key achievements: Increased performance by 50%, Led team of 5',
        education: 'Bachelor\'s degree in Computer Science with advanced certifications.'
      });

      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'POST',
        url: 'http://localhost:11434/api/generate',
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          model: 'llama2',
          prompt: expect.stringContaining('You are an expert resume writer'),
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2000,
          },
        },
      });
    });

    it('should handle Ollama service unavailable', async () => {
      mockedAxios.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      const result = await aiService.generateResume(mockRequest);

      // Should fall back to mock response
      expect(result.summary).toContain('Experienced');
      expect(result.skills).toContain('JavaScript');
      expect(mockedAxios).toHaveBeenCalledTimes(3); // 3 retries
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('ETIMEDOUT');
      timeoutError.name = 'TimeoutError';
      mockedAxios.mockRejectedValue(timeoutError);

      const result = await aiService.generateResume(mockRequest);

      expect(result.summary).toContain('Experienced');
      expect(mockedAxios).toHaveBeenCalledTimes(3);
    });

    it('should handle malformed JSON response', async () => {
      mockedAxios.mockResolvedValueOnce({
        data: {
          ...mockOllamaResponse,
          response: 'This is not valid JSON'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      const result = await aiService.generateResume(mockRequest);

      // Should fall back to mock response
      expect(result.summary).toContain('Experienced');
    });

    it('should work in mock mode', async () => {
      process.env.AI_MOCK_MODE = 'true';

      const result = await aiService.generateResume(mockRequest);

      expect(result.summary).toContain('Experienced');
      expect(result.skills).toContain('JavaScript');
      expect(result.education).toContain('Advanced degree');
      expect(mockedAxios).not.toHaveBeenCalled();
    });

    it('should handle fresher template type', async () => {
      process.env.AI_MOCK_MODE = 'true';
      const fresherRequest: AiGenerationRequest = {
        skills: ['Python', 'Machine Learning'],
        templateType: 'fresher'
      };

      const result = await aiService.generateResume(fresherRequest);

      expect(result.summary).toContain('Motivated and enthusiastic');
      expect(result.education).toContain('Bachelor\'s degree');
      expect(result.experience).toContain('Entry-level position');
    });

    it('should handle mid-level template type', async () => {
      process.env.AI_MOCK_MODE = 'true';
      const midRequest: AiGenerationRequest = {
        skills: ['Java', 'Spring Boot'],
        templateType: 'mid'
      };

      const result = await aiService.generateResume(midRequest);

      expect(result.summary).toContain('Experienced');
      expect(result.education).toContain('Bachelor\'s degree');
      expect(result.education).toContain('professional certifications');
    });

    it('should handle empty experience history', async () => {
      process.env.AI_MOCK_MODE = 'true';
      const requestWithoutExp: AiGenerationRequest = {
        skills: ['HTML', 'CSS'],
        templateType: 'senior'
      };

      const result = await aiService.generateResume(requestWithoutExp);

      expect(result.experience).toContain('strong background');
    });
  });

  describe('checkHealth', () => {
    it('should return true when Ollama is healthy', async () => {
      mockedAxios.mockResolvedValueOnce({
        data: { models: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      const result = await aiService.checkHealth();

      expect(result).toBe(true);
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'http://localhost:11434/api/tags',
        timeout: 5000
      });
    });

    it('should return false when Ollama is unhealthy', async () => {
      mockedAxios.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await aiService.checkHealth();

      expect(result).toBe(false);
    });

    it('should return true in mock mode', async () => {
      process.env.AI_MOCK_MODE = 'true';

      const result = await aiService.checkHealth();

      expect(result).toBe(true);
      expect(mockedAxios).not.toHaveBeenCalled();
    });
  });

  describe('isMockMode', () => {
    it('should return false when AI_MOCK_MODE is not set', () => {
      expect(aiService.isMockMode()).toBe(false);
    });

    it('should return false when AI_MOCK_MODE is false', () => {
      process.env.AI_MOCK_MODE = 'false';
      expect(aiService.isMockMode()).toBe(false);
    });

    it('should return true when AI_MOCK_MODE is true', () => {
      process.env.AI_MOCK_MODE = 'true';
      expect(aiService.isMockMode()).toBe(true);
    });
  });

  describe('prompt generation', () => {
    it('should include all required information in prompt', async () => {
      process.env.AI_MOCK_MODE = 'false';
      mockedAxios.mockResolvedValueOnce({
        data: {
          model: 'llama2',
          created_at: '2023-01-01T00:00:00.000Z',
          response: JSON.stringify({
            summary: 'Test summary',
            skills: 'Test skills',
            experience: 'Test experience',
            education: 'Test education'
          }),
          done: true
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await aiService.generateResume(mockRequest);

      const callArgs = mockedAxios.mock.calls[0][0];
      const prompt = callArgs.data.prompt;

      expect(prompt).toContain('You are an expert resume writer');
      expect(prompt).toContain('JavaScript, TypeScript, React');
      expect(prompt).toContain('Tech Corp');
      expect(prompt).toContain('Senior Developer');
      expect(prompt).toContain('Built amazing applications');
      expect(prompt).toContain('Increased performance by 50%');
      expect(prompt).toContain('Looking for a senior developer with React experience');
      expect(prompt).toContain('senior');
      expect(prompt).toContain('Professional Summary');
      expect(prompt).toContain('Skills Section');
      expect(prompt).toContain('Experience Section');
      expect(prompt).toContain('Education Section');
    });
  });

  describe('response parsing', () => {
    it('should extract JSON from response with extra text', async () => {
      mockedAxios.mockResolvedValueOnce({
        data: {
          model: 'llama2',
          created_at: '2023-01-01T00:00:00.000Z',
          response: 'Here is the generated resume:\n{"summary": "Test summary", "skills": "Test skills", "experience": "Test experience", "education": "Test education"}\nEnd of response.',
          done: true
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      const result = await aiService.generateResume(mockRequest);

      expect(result).toEqual({
        summary: 'Test summary',
        skills: 'Test skills',
        experience: 'Test experience',
        education: 'Test education'
      });
    });

    it('should handle partial JSON response', async () => {
      mockedAxios.mockResolvedValueOnce({
        data: {
          model: 'llama2',
          created_at: '2023-01-01T00:00:00.000Z',
          response: '{"summary": "Test summary", "skills": "Test skills"}',
          done: true
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      const result = await aiService.generateResume(mockRequest);

      expect(result).toEqual({
        summary: 'Test summary',
        skills: 'Test skills',
        experience: '',
        education: ''
      });
    });
  });

  describe('retry mechanism', () => {
    it('should retry on failure', async () => {
      mockedAxios
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce({
          data: mockOllamaResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any
        });

      const result = await aiService.generateResume(mockRequest);

      expect(result.summary).toContain('Experienced senior developer');
      expect(mockedAxios).toHaveBeenCalledTimes(3);
    });

    it('should use exponential backoff', async () => {
      mockedAxios.mockRejectedValue(new Error('Always fails'));

      const startTime = Date.now();
      await aiService.generateResume(mockRequest);
      const endTime = Date.now();

      // Should take at least 1 + 2 + 4 = 7 seconds for retries (with some tolerance)
      expect(endTime - startTime).toBeGreaterThan(6000);
      expect(mockedAxios).toHaveBeenCalledTimes(3);
    });
  });
});