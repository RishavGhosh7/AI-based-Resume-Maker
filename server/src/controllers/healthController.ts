import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import { HealthResponse } from '../types';
import config from '../config';
import DatabaseConnection from '../config/database';

export const getHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check Ollama service (basic connectivity check)
    let ollamaStatus: 'connected' | 'disconnected' = 'disconnected';
    try {
      const ollamaResponse = await fetch(`${config.ollama.baseUrl}/api/tags`);
      if (ollamaResponse.ok) {
        ollamaStatus = 'connected';
      }
    } catch (error) {
      // Ollama is not available
    }

    // Check database status
    const databaseStatus = DatabaseConnection.getInstance().getConnectionHealth();

    const isHealthy = ollamaStatus === 'connected' || databaseStatus === 'connected';

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