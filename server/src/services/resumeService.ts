import { ResumeModel, IResume, IExperienceHistory, IGeneratedSections } from '../models/Resume';

export interface CreateResumeData {
  userId?: string;
  sessionId?: string;
  templateType?: 'fresher' | 'mid' | 'senior';
  skills: string[];
  experienceHistory?: IExperienceHistory[];
  jobDescription?: string;
  generatedSections?: IGeneratedSections;
}

export interface UpdateResumeData {
  templateType?: 'fresher' | 'mid' | 'senior';
  skills?: string[];
  experienceHistory?: IExperienceHistory[];
  jobDescription?: string;
  generatedSections?: IGeneratedSections;
  isEditable?: boolean;
}

export interface ResumeQuery {
  userId?: string;
  sessionId?: string;
  templateType?: 'fresher' | 'mid' | 'senior';
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'templateType';
  sortOrder?: 'asc' | 'desc';
}

class ResumeService {
  async createResume(data: CreateResumeData): Promise<IResume> {
    try {
      const resume = new ResumeModel({
        ...data,
        metadata: {
          isEditable: true,
          version: 1
        }
      });
      
      const savedResume = await resume.save();
      return savedResume.toJSON() as unknown as IResume;
    } catch (error) {
      throw new Error(`Failed to create resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getResumeById(id: string): Promise<IResume | null> {
    try {
      const resume = await ResumeModel.findById(id);
      return resume ? resume.toJSON() as unknown as IResume : null;
    } catch (error) {
      throw new Error(`Failed to get resume by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getResumes(query: ResumeQuery = {}): Promise<{
    resumes: IResume[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const {
        userId,
        sessionId,
        templateType,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = query;

      // Build filter
      const filter: any = {};
      if (userId) filter.userId = userId;
      if (sessionId) filter.sessionId = sessionId;
      if (templateType) filter.templateType = templateType;

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query
      const [resumeDocs, total] = await Promise.all([
        ResumeModel.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit),
        ResumeModel.countDocuments(filter)
      ]);

      const resumes = resumeDocs.map(doc => doc.toJSON() as unknown as IResume);

      const totalPages = Math.ceil(total / limit);

      return {
        resumes,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      throw new Error(`Failed to get resumes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateResume(id: string, data: UpdateResumeData): Promise<IResume | null> {
    try {
      const updateData: any = { ...data };
      
      if (data.isEditable !== undefined) {
        updateData['metadata.isEditable'] = data.isEditable;
        delete updateData.isEditable;
      }

      const resume = await ResumeModel.findByIdAndUpdate(
        id,
        {
          $set: updateData,
          $inc: { 'metadata.version': 1 }
        },
        { new: true, runValidators: true }
      );

      return resume ? resume.toJSON() as unknown as IResume : null;
    } catch (error) {
      throw new Error(`Failed to update resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteResume(id: string): Promise<boolean> {
    try {
      const result = await ResumeModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error(`Failed to delete resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getResumesByUserId(userId: string): Promise<IResume[]> {
    try {
      const resumeDocs = await ResumeModel.find({ userId })
        .sort({ createdAt: -1 });
      return resumeDocs.map(doc => doc.toJSON() as unknown as IResume);
    } catch (error) {
      throw new Error(`Failed to get resumes by user ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getResumesBySessionId(sessionId: string): Promise<IResume[]> {
    try {
      const resumeDocs = await ResumeModel.find({ sessionId })
        .sort({ createdAt: -1 });
      return resumeDocs.map(doc => doc.toJSON() as unknown as IResume);
    } catch (error) {
      throw new Error(`Failed to get resumes by session ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new ResumeService();