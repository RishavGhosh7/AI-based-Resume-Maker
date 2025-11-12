import { Request, Response } from 'express';
import { sendSuccess, sendPaginatedResponse } from '../utils/response';
import { resumeService } from '../services/resumeService';
import { CreateResumePayload, UpdateResumePayload } from '../types';
import { AppError } from '../middleware/errorHandler';

export const getResumes = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.sessionId;
  if (!sessionId) {
    throw new AppError('Session not found', 401, 'SESSION_ERROR');
  }

  const page = (req.query.page as unknown as number) || 1;
  const limit = (req.query.limit as unknown as number) || 10;

  const { resumes, total } = await resumeService.getResumesBySession(
    sessionId,
    page,
    limit
  );

  sendPaginatedResponse(
    res,
    resumes,
    page,
    limit,
    total,
    'Resumes retrieved successfully'
  );
};

export const createResume = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.sessionId;
  if (!sessionId) {
    throw new AppError('Session not found', 401, 'SESSION_ERROR');
  }

  const payload = req.body as CreateResumePayload;

  const resume = await resumeService.createResume(sessionId, payload);

  sendSuccess(res, resume, 'Resume created successfully', 201);
};

export const getResumeById = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.sessionId;
  if (!sessionId) {
    throw new AppError('Session not found', 401, 'SESSION_ERROR');
  }

  const resumeId = req.params.id as string;

  const resume = await resumeService.getResumeById(resumeId, sessionId);

  sendSuccess(res, resume, 'Resume retrieved successfully');
};

export const updateResume = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.sessionId;
  if (!sessionId) {
    throw new AppError('Session not found', 401, 'SESSION_ERROR');
  }

  const resumeId = req.params.id as string;
  const payload = req.body as UpdateResumePayload;

  const resume = await resumeService.updateResume(resumeId, sessionId, payload);

  sendSuccess(res, resume, 'Resume updated successfully');
};

export const deleteResume = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.sessionId;
  if (!sessionId) {
    throw new AppError('Session not found', 401, 'SESSION_ERROR');
  }

  const resumeId = req.params.id as string;

  await resumeService.deleteResume(resumeId, sessionId);

  sendSuccess(res, null, 'Resume deleted successfully', 204);
};