import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import { HealthResponse } from '../types';
import config from '../config';
import DatabaseConnection from '../config/database';
import aiService from '../services/aiService';

export const getHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check AI service health
    let ollamaStatus: 'connected' | 'disconnected' = 'disconnected';
    try {
      const isAiHealthy = await aiService.checkHealth();
      ollamaStatus = isAiHealthy ? 'connected' : 'disconnected';
    } catch (error) {
      // AI service is not available
      ollamaStatus = 'disconnected';
    }

    // Check database status
    const databaseStatus = DatabaseConnection.getInstance().getConnectionHealth();

    // Consider service healthy if at least one critical service is available
    // or if we're in mock mode (which means AI service is intentionally mocked)
    const isHealthy = (ollamaStatus === 'connected' || databaseStatus === 'connected') || aiService.isMockMode();

    const healthData: HealthResponse = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.server.env,
      services: {
        ollama: ollamaStatus,
        database: databaseStatus,
      },
    };

    sendSuccess(res, healthData, 'Service health check completed');
  } catch (error) {
    const healthData: HealthResponse = {
      status: 'unhealthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.server.env,
      services: {
        ollama: 'disconnected',
        database: 'disconnected',
      },
    };

    sendSuccess(res, healthData, 'Service health check completed');
  }
};