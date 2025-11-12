import request from 'supertest';
import app from '../app';
import config from '../config';
import { resumeService } from '../services/resumeService';
import '../middleware/sessionHandler';

describe('Resume Controller - Validation & Error Handling', () => {
  beforeEach(async () => {
    await resumeService.clearResumes();
  });

  const createAgent = () => request.agent(app);

  describe('Input Validation', () => {
    it('should reject title with empty string', async () => {
      const response = await createAgent()
        .post(`${config.server.apiPrefix}/resumes`)
        .send({
          title: '',
          content: { summary: 'test' },
          skills: ['JavaScript'],
          experience: 'test',
          jobDescription: 'test',
          templateType: 'modern',
        })
        .expect(400);

      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should reject experience with empty string', async () => {
      const response = await createAgent()
        .post(`${config.server.apiPrefix}/resumes`)
        .send({
          title: 'Resume',
          content: { summary: 'test' },
          skills: ['JavaScript'],
          experience: '',
          jobDescription: 'test',
          templateType: 'modern',
        })
        .expect(400);

      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should reject jobDescription with empty string', async () => {
      const response = await createAgent()
        .post(`${config.server.apiPrefix}/resumes`)
        .send({
          title: 'Resume',
          content: { summary: 'test' },
          skills: ['JavaScript'],
          experience: 'test',
          jobDescription: '',
          templateType: 'modern',
        })
        .expect(400);

      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should reject skill with empty string in array', async () => {
      const response = await createAgent()
        .post(`${config.server.apiPrefix}/resumes`)
        .send({
          title: 'Resume',
          content: { summary: 'test' },
          skills: ['JavaScript', ''],
          experience: 'test',
          jobDescription: 'test',
          templateType: 'modern',
        })
        .expect(400);

      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should accept content with unknown fields', async () => {
      const response = await createAgent()
        .post(`${config.server.apiPrefix}/resumes`)
        .send({
          title: 'Resume',
          content: {
            summary: 'test',
            customField: 'value',
            anotherField: 123,
          },
          skills: ['JavaScript'],
          experience: 'test',
          jobDescription: 'test',
          templateType: 'modern',
        })
        .expect(201);

      expect(response.body.data.content).toHaveProperty('customField', 'value');
    });

    it('should strip unknown top-level fields', async () => {
      const response = await createAgent()
        .post(`${config.server.apiPrefix}/resumes`)
        .send({
          title: 'Resume',
          content: { summary: 'test' },
          skills: ['JavaScript'],
          experience: 'test',
          jobDescription: 'test',
          templateType: 'modern',
          unknownField: 'should be removed',
        })
        .expect(201);

      expect(response.body.data).not.toHaveProperty('unknownField');
    });
  });

  describe('Update Validation', () => {
    it('should allow updating only some fields', async () => {
      const agent = createAgent();

      const createResponse = await agent
        .post(`${config.server.apiPrefix}/resumes`)
        .send({
          title: 'Original',
          content: { summary: 'original' },
          skills: ['JavaScript'],
          experience: 'test',
          jobDescription: 'test',
          templateType: 'modern',
        })
        .expect(201);

      const resumeId = createResponse.body.data.id;

      const updateResponse = await agent
        .put(`${config.server.apiPrefix}/resumes/${resumeId}`)
        .send({ title: 'Updated' })
        .expect(200);

      expect(updateResponse.body.data).toHaveProperty('title', 'Updated');
      expect(updateResponse.body.data.content).toHaveProperty('summary', 'original');
    });

    it('should reject invalid title in update', async () => {
      const agent = createAgent();

      const createResponse = await agent
        .post(`${config.server.apiPrefix}/resumes`)
        .send({
          title: 'Original',
          content: { summary: 'original' },
          skills: ['JavaScript'],
          experience: 'test',
          jobDescription: 'test',
          templateType: 'modern',
        })
        .expect(201);

      const resumeId = createResponse.body.data.id;

      const response = await agent
        .put(`${config.server.apiPrefix}/resumes/${resumeId}`)
        .send({ title: 'a'.repeat(101) })
        .expect(400);

      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('HTTP Status Codes', () => {
    it('should return 201 for successful creation', async () => {
      const response = await createAgent()
        .post(`${config.server.apiPrefix}/resumes`)
        .send({
          title: 'Test',
          content: { summary: 'test' },
          skills: ['JavaScript'],
          experience: 'test',
          jobDescription: 'test',
          templateType: 'modern',
        });

      expect(response.status).toBe(201);
    });

    it('should return 200 for successful GET list', async () => {
      const response = await createAgent()
        .get(`${config.server.apiPrefix}/resumes`);

      expect(response.status).toBe(200);
    });

    it('should return 200 for successful GET by id', async () => {
      const agent = createAgent();

      const createResponse = await agent
        .post(`${config.server.apiPrefix}/resumes`)
        .send({
          title: 'Test',
          content: { summary: 'test' },
          skills: ['JavaScript'],
          experience: 'test',
          jobDescription: 'test',
          templateType: 'modern',
        })
        .expect(201);

      const resumeId = createResponse.body.data.id;
      const response = await agent
        .get(`${config.server.apiPrefix}/resumes/${resumeId}`);

      expect(response.status).toBe(200);
    });

    it('should return 200 for successful PUT', async () => {
      const agent = createAgent();

      const createResponse = await agent
        .post(`${config.server.apiPrefix}/resumes`)
        .send({
          title: 'Test',
          content: { summary: 'test' },
          skills: ['JavaScript'],
          experience: 'test',
          jobDescription: 'test',
          templateType: 'modern',
        })
        .expect(201);

      const resumeId = createResponse.body.data.id;
      const response = await agent
        .put(`${config.server.apiPrefix}/resumes/${resumeId}`)
        .send({ title: 'Updated' });

      expect(response.status).toBe(200);
    });

    it('should return 204 for successful DELETE', async () => {
      const agent = createAgent();

      const createResponse = await agent
        .post(`${config.server.apiPrefix}/resumes`)
        .send({
          title: 'Test',
          content: { summary: 'test' },
          skills: ['JavaScript'],
          experience: 'test',
          jobDescription: 'test',
          templateType: 'modern',
        })
        .expect(201);

      const resumeId = createResponse.body.data.id;
      const response = await agent
        .delete(`${config.server.apiPrefix}/resumes/${resumeId}`);

      expect(response.status).toBe(204);
    });

    it('should return 400 for validation errors', async () => {
      const response = await createAgent()
        .post(`${config.server.apiPrefix}/resumes`)
        .send({ title: 'Test' });

      expect(response.status).toBe(400);
    });

    it('should return 404 for not found errors', async () => {
      const response = await createAgent()
        .get(`${config.server.apiPrefix}/resumes/00000000-0000-0000-0000-000000000000`);

      expect(response.status).toBe(404);
    });
  });

  describe('Error Response Structure', () => {
    it('should include error code and message for 400', async () => {
      const response = await createAgent()
        .post(`${config.server.apiPrefix}/resumes`)
        .send({});

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
    });

    it('should include error code and message for 404', async () => {
      const response = await createAgent()
        .get(`${config.server.apiPrefix}/resumes/00000000-0000-0000-0000-000000000000`);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'RESUME_NOT_FOUND');
      expect(response.body.error).toHaveProperty('message');
    });
  });

  describe('Pagination', () => {
    it('should use default pagination values', async () => {
      const response = await createAgent()
        .get(`${config.server.apiPrefix}/resumes`)
        .expect(200);

      expect(response.body.data.pagination).toHaveProperty('page', 1);
      expect(response.body.data.pagination).toHaveProperty('limit', 10);
    });

    it('should respect custom page and limit', async () => {
      const agent = createAgent();

      for (let i = 0; i < 25; i++) {
        await agent
          .post(`${config.server.apiPrefix}/resumes`)
          .send({
            title: `Resume ${i}`,
            content: { summary: 'test' },
            skills: ['JavaScript'],
            experience: 'test',
            jobDescription: 'test',
            templateType: 'modern',
          })
          .expect(201);
      }

      const response = await agent
        .get(`${config.server.apiPrefix}/resumes?page=2&limit=5`)
        .expect(200);

      expect(response.body.data.pagination).toHaveProperty('page', 2);
      expect(response.body.data.pagination).toHaveProperty('limit', 5);
      expect(response.body.data.data).toHaveLength(5);
    });
  });
});
