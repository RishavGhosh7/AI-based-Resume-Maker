import { Request } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  path: string;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  uptime: number;
  timestamp: string;
  version: string;
  environment: string;
  services: {
    ollama: 'connected' | 'disconnected';
    database: 'connected' | 'disconnected';
  };
}

export interface RequestWithUser extends Request {
  user?: unknown;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ResumeDto {
  id: string;
  userId?: string;
  sessionId?: string;
  templateType: 'fresher' | 'mid' | 'senior';
  skills: string[];
  experienceHistory: ExperienceHistoryDto[];
  jobDescription?: string;
  generatedSections: GeneratedSectionsDto;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: number;
    isEditable: boolean;
  };
}

export interface ExperienceHistoryDto {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  achievements?: string[];
}

export interface GeneratedSectionsDto {
  summary?: string;
  skills?: string;
  experience?: string;
  education?: string;
}

export interface CreateResumeRequest {
  userId?: string;
  sessionId?: string;
  templateType?: 'fresher' | 'mid' | 'senior';
  skills: string[];
  experienceHistory?: ExperienceHistoryDto[];
  jobDescription?: string;
  generatedSections?: GeneratedSectionsDto;
}

export interface UpdateResumeRequest {
  templateType?: 'fresher' | 'mid' | 'senior';
  skills?: string[];
  experienceHistory?: ExperienceHistoryDto[];
  jobDescription?: string;
  generatedSections?: GeneratedSectionsDto;
  isEditable?: boolean;
}