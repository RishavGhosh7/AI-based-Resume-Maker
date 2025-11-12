import { v4 as uuidv4 } from 'uuid';
import { Resume, CreateResumePayload, UpdateResumePayload } from '../types';
import { AppError } from '../middleware/errorHandler';

class ResumeService {
  private resumes: Resume[] = [];

  async createResume(
    sessionId: string,
    payload: CreateResumePayload
  ): Promise<Resume> {
    const resume: Resume = {
      id: uuidv4(),
      sessionId,
      title: payload.title,
      content: payload.content,
      template: payload.templateType,
      skills: payload.skills,
      experience: payload.experience,
      jobDescription: payload.jobDescription,
      templateType: payload.templateType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.resumes.push(resume);
    return resume;
  }

  async getResumeById(resumeId: string, sessionId: string): Promise<Resume> {
    const resume = this.resumes.find(
      (r) => r.id === resumeId && r.sessionId === sessionId
    );

    if (!resume) {
      throw new AppError(
        'Resume not found or access denied',
        404,
        'RESUME_NOT_FOUND'
      );
    }

    return resume;
  }

  async getResumesBySession(
    sessionId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ resumes: Resume[]; total: number }> {
    const filtered = this.resumes.filter((r) => r.sessionId === sessionId);
    const total = filtered.length;
    const start = (page - 1) * limit;
    const resumes = filtered.slice(start, start + limit);

    return { resumes, total };
  }

  async updateResume(
    resumeId: string,
    sessionId: string,
    payload: UpdateResumePayload
  ): Promise<Resume> {
    const resume = this.resumes.find(
      (r) => r.id === resumeId && r.sessionId === sessionId
    );

    if (!resume) {
      throw new AppError(
        'Resume not found or access denied',
        404,
        'RESUME_NOT_FOUND'
      );
    }

    if (payload.title !== undefined) {
      resume.title = payload.title;
    }

    if (payload.content !== undefined) {
      resume.content = payload.content;
    }

    if (payload.template !== undefined) {
      resume.template = payload.template;
    }

    resume.updatedAt = new Date();

    return resume;
  }

  async deleteResume(resumeId: string, sessionId: string): Promise<void> {
    const index = this.resumes.findIndex(
      (r) => r.id === resumeId && r.sessionId === sessionId
    );

    if (index === -1) {
      throw new AppError(
        'Resume not found or access denied',
        404,
        'RESUME_NOT_FOUND'
      );
    }

    this.resumes.splice(index, 1);
  }

  async getAllResumes(): Promise<Resume[]> {
    return this.resumes;
  }

  async clearResumes(): Promise<void> {
    this.resumes = [];
  }
}

export const resumeService = new ResumeService();
