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
  sessionId?: string;
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

export interface ResumeContent {
  summary?: string;
  sections?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface Resume {
  id: string;
  sessionId: string;
  title: string;
  content: ResumeContent;
  template: string;
  skills: string[];
  experience: string;
  jobDescription: string;
  templateType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateResumePayload {
  title: string;
  content: ResumeContent;
  skills: string[];
  experience: string;
  jobDescription: string;
  templateType: string;
}

export interface UpdateResumePayload {
  title?: string;
  content?: ResumeContent;
  template?: string;
}
