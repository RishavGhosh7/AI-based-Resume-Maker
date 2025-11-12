import request from 'supertest';
import app from '../app';
import config from '../config';

describe('Error Handling', () => {
  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get(`${config.server.apiPrefix}/nonexistent`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');

      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.message).toContain('Route');
      expect(response.body.error.message).toContain('not found');
    });
  });

  describe('Validation Errors', () => {
    it('should return validation error for invalid resume creation', async () => {
      const response = await request(app)
        .post(`${config.server.apiPrefix}/resumes`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should return 200 for valid resumes route (empty array)', async () => {
      const response = await request(app)
        .get(`${config.server.apiPrefix}/resumes/`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get(`${config.server.apiPrefix}/health`)
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get(`${config.server.apiPrefix}/health`)
        .expect(200);

      // Helmet should add security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });
});