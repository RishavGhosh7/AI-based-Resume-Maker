import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import resumeService from '../services/resumeService';
import aiService from '../services/aiService';
import { CreateResumeRequest, UpdateResumeRequest } from '../types';
import { CreateResumeData, UpdateResumeData } from '../services/resumeService';

export const getResumes = async (req: Request, res: Response): Promise<void> => {
  const { userId, sessionId, templateType, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const result = await resumeService.getResumes({
    userId: userId as string,
    sessionId: sessionId as string,
    templateType: templateType as 'fresher' | 'mid' | 'senior',
    page: Number(page),
    limit: Number(limit),
    sortBy: sortBy as 'createdAt' | 'updatedAt' | 'templateType',
    sortOrder: sortOrder as 'asc' | 'desc'
  });

  sendSuccess(res, {
    resumes: result.resumes,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNext: result.page < result.totalPages,
      hasPrev: result.page > 1
    }
  }, 'Resumes retrieved successfully');
};

export const createResume = async (req: Request, res: Response): Promise<void> => {
  const resumeData: CreateResumeRequest = req.body;
  
  try {
    // Generate AI-powered resume sections
    const aiRequest = {
      skills: resumeData.skills,
      experienceHistory: resumeData.experienceHistory?.map(exp => ({
        ...exp,
        startDate: new Date(exp.startDate),
        ...(exp.endDate && { endDate: new Date(exp.endDate) })
      })),
      jobDescription: resumeData.jobDescription,
      templateType: resumeData.templateType || 'fresher'
    };

    let generatedSections;
    try {
      generatedSections = await aiService.generateResume(aiRequest);
    } catch (aiError) {
      // Log AI error but don't fail the entire request
      console.error('AI generation failed, proceeding without AI content:', aiError);
      
      // Provide basic fallback sections
      generatedSections = {
        summary: resumeData.templateType === 'fresher' 
          ? 'Motivated individual eager to apply skills and learn in a professional environment.'
          : 'Experienced professional seeking to leverage expertise in a challenging role.',
        skills: resumeData.skills.join(', '),
        experience: resumeData.experienceHistory && resumeData.experienceHistory.length > 0
          ? 'Professional experience with relevant skills and achievements.'
          : '',
        education: resumeData.templateType === 'fresher'
          ? 'Recent graduate with strong academic foundation.'
          : 'Educational background complemented by professional experience.'
      };
    }
    
    // Convert date strings to Date objects and cast to proper type
    const processedData: CreateResumeData = {
      ...resumeData,
      experienceHistory: resumeData.experienceHistory?.map(exp => ({
        company: exp.company,
        position: exp.position,
        startDate: new Date(exp.startDate),
        ...(exp.endDate && { endDate: new Date(exp.endDate) }),
        ...(exp.description && { description: exp.description }),
        ...(exp.achievements && { achievements: exp.achievements })
      })),
      generatedSections
    };
    
    const resume = await resumeService.createResume(processedData);
    
    sendSuccess(res, resume, 'Resume created successfully');
  } catch (error) {
    // Handle different types of errors appropriately
    if (error instanceof Error) {
      if (error.message.includes('Ollama service is not available')) {
        res.status(503).json({
          success: false,
          message: 'AI service temporarily unavailable',
          error: {
            code: 'AI_SERVICE_UNAVAILABLE',
            message: 'The AI generation service is currently unavailable. Please try again later.'
          }
        });
        return;
      } else if (error.message.includes('timed out')) {
        res.status(504).json({
          success: false,
          message: 'AI service timeout',
          error: {
            code: 'AI_SERVICE_TIMEOUT',
            message: 'The AI generation service timed out. Please try again.'
          }
        });
        return;
      }
    }
    
    // Re-throw the error to be handled by the global error handler
    throw error;
  }
};

export const getResumeById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!id) {
    sendSuccess(res, null, 'Resume ID is required', 400);
    return;
  }
  
  const resume = await resumeService.getResumeById(id);
  
  if (!resume) {
    sendSuccess(res, null, 'Resume not found', 404);
    return;
  }
  
  sendSuccess(res, resume, 'Resume retrieved successfully');
};

export const updateResume = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData: UpdateResumeRequest = req.body;
  
  if (!id) {
    sendSuccess(res, null, 'Resume ID is required', 400);
    return;
  }
  
  // Convert date strings to Date objects and cast to proper type
  const processedData: UpdateResumeData = {
    ...updateData,
    experienceHistory: updateData.experienceHistory?.map(exp => ({
      company: exp.company,
      position: exp.position,
      startDate: new Date(exp.startDate),
      ...(exp.endDate && { endDate: new Date(exp.endDate) }),
      ...(exp.description && { description: exp.description }),
      ...(exp.achievements && { achievements: exp.achievements })
    }))
  };
  
  const resume = await resumeService.updateResume(id, processedData);
  
  if (!resume) {
    sendSuccess(res, null, 'Resume not found', 404);
    return;
  }
  
  sendSuccess(res, resume, 'Resume updated successfully');
};

export const deleteResume = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!id) {
    sendSuccess(res, null, 'Resume ID is required', 400);
    return;
  }
  
  const deleted = await resumeService.deleteResume(id);
  
  if (!deleted) {
    sendSuccess(res, null, 'Resume not found', 404);
    return;
  }
  
  sendSuccess(res, null, 'Resume deleted successfully');
};