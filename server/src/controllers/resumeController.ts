import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import resumeService from '../services/resumeService';
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
    }))
  };
  
  const resume = await resumeService.createResume(processedData);
  
  sendSuccess(res, resume, 'Resume created successfully');
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