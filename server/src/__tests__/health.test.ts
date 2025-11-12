import request from 'supertest';
import app from '../app';
import config from '../config';

describe('Health Endpoint', () => {
  describe('GET /api/v1/health', () => {
    it('should return health status with correct structure', async () => {
      const response = await request(app)
        .get(`${config.server.apiPrefix}/health`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');

      const healthData = response.body.data;
      expect(healthData).toHaveProperty('status');
      expect(healthData).toHaveProperty('uptime');
      expect(healthData).toHaveProperty('timestamp');
      expect(healthData).toHaveProperty('version');
      expect(healthData).toHaveProperty('environment');
      expect(healthData).toHaveProperty('services');
      
      expect(healthData.services).toHaveProperty('ollama');
      expect(healthData.services).toHaveProperty('database');
      
      expect(['healthy', 'unhealthy']).toContain(healthData.status);
      expect(['connected', 'disconnected']).toContain(healthData.services.ollama);
      expect(['connected', 'disconnected']).toContain(healthData.services.database);
    });

    it('should return uptime as a number', async () => {
      const response = await request(app)
        .get(`${config.server.apiPrefix}/health`)
        .expect(200);

      expect(typeof response.body.data.uptime).toBe('number');
      expect(response.body.data.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return valid timestamp', async () => {
      const response = await request(app)
        .get(`${config.server.apiPrefix}/health`)
        .expect(200);

      const timestamp = response.body.data.timestamp;
      expect(() => new Date(timestamp)).not.toThrow();
    });
  });
});