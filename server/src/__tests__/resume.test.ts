import request from 'supertest';
import app from '../app';
import config from '../config';
import { resumeService } from '../services/resumeService';
import { v4 as uuidv4 } from 'uuid';
import '../middleware/sessionHandler';

describe('Resume Endpoints', () => {
  beforeEach(async () => {
    await resumeService.clearResumes();
  });

  const createAgent = () => request.agent(app);

  const validResumePayload = {
    title: 'My Resume',
    content: {
      summary: 'A summary of my experience',
      sections: {
        education: 'Bachelor in Computer Science',
      },
    },
    skills: ['JavaScript', 'TypeScript', 'React'],
    experience: '5 years in software development',
    jobDescription: 'Senior Software Engineer position',
    templateType: 'modern',
  };

  describe('POST /api/v1/resumes - Create Resume', () => {
    it('should create a resume with valid payload', async () => {
      const response = await createAgent()
        .post(`${config.server.apiPrefix}/resumes`)
        .send(validResumePayload)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Resume created successfully');

      const data = response.body.data;
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('title', validResumePayload.title);
      expect(data).toHaveProperty('skills', validResumePayload.skills);
      expect(data).toHaveProperty('experience', validResumePayload.experience);
      expect(data).toHaveProperty('jobDescription', validResumePayload.jobDescription);
      expect(data).toHaveProperty('templateType', validResumePayload.templateType);
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('updatedAt');
    });

    it('should return 400 when missing required fields', async () => {
      const invalidPayload = {
        title: 'My Resume',
      };

      const response = await createAgent()
        .post(`${config.server.apiPrefix}/resumes`)
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should return 400 when skills array is empty', async () => {
      const invalidPayload = {
        ...validResumePayload,
        skills: [],
      };

      const response = await createAgent()
        .post(`${config.server.apiPrefix}/resumes`)
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should return 400 when title exceeds max length', async () => {
      const invalidPayload = {
        ...validResumePayload,
        title: 'a'.repeat(101),
      };

      const response = await createAgent()
        .post(`${config.server.apiPrefix}/resumes`)
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/resumes - List Resumes', () => {
    it('should return empty list when no resumes exist', async () => {
      const response = await createAgent()
        .get(`${config.server.apiPrefix}/resumes`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('data', []);
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination).toHaveProperty('total', 0);
    });

    it('should return list of resumes for session', async () => {
      const agent = createAgent();

      await agent
        .post(`${config.server.apiPrefix}/resumes`)
        .send(validResumePayload)
        .expect(201);

      const response = await agent
        .get(`${config.server.apiPrefix}/resumes`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.pagination).toHaveProperty('total', 1);
      expect(response.body.data.pagination).toHaveProperty('page', 1);
      expect(response.body.data.pagination).toHaveProperty('limit', 10);
    });

    it('should support pagination', async () => {
      const agent = createAgent();

      for (let i = 0; i < 15; i++) {
        await agent
          .post(`${config.server.apiPrefix}/resumes`)
          .send({
            ...validResumePayload,
            title: `Resume ${i + 1}`,
          })
          .expect(201);
      }

      const page1 = await agent
        .get(`${config.server.apiPrefix}/resumes?page=1&limit=10`)
        .expect(200);

      expect(page1.body.data.data).toHaveLength(10);
      expect(page1.body.data.pagination).toHaveProperty('total', 15);
      expect(page1.body.data.pagination).toHaveProperty('hasNext', true);
      expect(page1.body.data.pagination).toHaveProperty('hasPrev', false);

      const page2 = await agent
        .get(`${config.server.apiPrefix}/resumes?page=2&limit=10`)
        .expect(200);

      expect(page2.body.data.data).toHaveLength(5);
      expect(page2.body.data.pagination).toHaveProperty('hasNext', false);
      expect(page2.body.data.pagination).toHaveProperty('hasPrev', true);
    });
  });

  describe('GET /api/v1/resumes/:id - Get Resume by ID', () => {
    it('should retrieve a resume by id', async () => {
      const agent = createAgent();

      const createResponse = await agent
        .post(`${config.server.apiPrefix}/resumes`)
        .send(validResumePayload)
        .expect(201);

      const resumeId = createResponse.body.data.id;

      const response = await agent
        .get(`${config.server.apiPrefix}/resumes/${resumeId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', resumeId);
      expect(response.body.data).toHaveProperty('title', validResumePayload.title);
    });

    it('should return 404 for non-existent resume', async () => {
      const fakeId = uuidv4();

      const response = await createAgent()
        .get(`${config.server.apiPrefix}/resumes/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'RESUME_NOT_FOUND');
    });

    it('should return 400 for invalid uuid format', async () => {
      const response = await createAgent()
        .get(`${config.server.apiPrefix}/resumes/invalid-id`)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'PARAM_VALIDATION_ERROR');
    });
  });

  describe('PUT /api/v1/resumes/:id - Update Resume', () => {
    it('should update resume title', async () => {
      const agent = createAgent();

      const createResponse = await agent
        .post(`${config.server.apiPrefix}/resumes`)
        .send(validResumePayload)
        .expect(201);

      const resumeId = createResponse.body.data.id;
      const updatedTitle = 'Updated Resume Title';

      const response = await agent
        .put(`${config.server.apiPrefix}/resumes/${resumeId}`)
        .send({ title: updatedTitle })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('title', updatedTitle);
      expect(response.body.data).toHaveProperty(
        'updatedAt'
      );
    });

    it('should update resume content', async () => {
      const agent = createAgent();

      const createResponse = await agent
        .post(`${config.server.apiPrefix}/resumes`)
        .send(validResumePayload)
        .expect(201);

      const resumeId = createResponse.body.data.id;
      const updatedContent = { summary: 'Updated summary' };

      const response = await agent
        .put(`${config.server.apiPrefix}/resumes/${resumeId}`)
        .send({ content: updatedContent })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.content).toHaveProperty('summary', 'Updated summary');
    });

    it('should update resume template', async () => {
      const agent = createAgent();

      const createResponse = await agent
        .post(`${config.server.apiPrefix}/resumes`)
        .send(validResumePayload)
        .expect(201);

      const resumeId = createResponse.body.data.id;

      const response = await agent
        .put(`${config.server.apiPrefix}/resumes/${resumeId}`)
        .send({ template: 'classic' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('template', 'classic');
    });

    it('should return 400 for empty update payload', async () => {
      const agent = createAgent();

      const createResponse = await agent
        .post(`${config.server.apiPrefix}/resumes`)
        .send(validResumePayload)
        .expect(201);

      const resumeId = createResponse.body.data.id;

      const response = await agent
        .put(`${config.server.apiPrefix}/resumes/${resumeId}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should return 404 for non-existent resume update', async () => {
      const fakeId = uuidv4();

      const response = await createAgent()
        .put(`${config.server.apiPrefix}/resumes/${fakeId}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'RESUME_NOT_FOUND');
    });
  });

  describe('DELETE /api/v1/resumes/:id - Delete Resume', () => {
    it('should delete a resume', async () => {
      const agent = createAgent();

      const createResponse = await agent
        .post(`${config.server.apiPrefix}/resumes`)
        .send(validResumePayload)
        .expect(201);

      const resumeId = createResponse.body.data.id;

      const response = await agent
        .delete(`${config.server.apiPrefix}/resumes/${resumeId}`)
        .expect(204);

      // 204 No Content typically has an empty body, but our implementation may include it
      if (Object.keys(response.body).length > 0) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Resume deleted successfully');
      }
    });

    it('should return 404 when deleting non-existent resume', async () => {
      const fakeId = uuidv4();

      const response = await createAgent()
        .delete(`${config.server.apiPrefix}/resumes/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'RESUME_NOT_FOUND');
    });

    it('should not retrieve deleted resume', async () => {
      const agent = createAgent();

      const createResponse = await agent
        .post(`${config.server.apiPrefix}/resumes`)
        .send(validResumePayload)
        .expect(201);

      const resumeId = createResponse.body.data.id;

      await agent
        .delete(`${config.server.apiPrefix}/resumes/${resumeId}`)
        .expect(204);

      const response = await agent
        .get(`${config.server.apiPrefix}/resumes/${resumeId}`)
        .expect(404);

      expect(response.body.error).toHaveProperty('code', 'RESUME_NOT_FOUND');
    });
  });

  describe('Session Isolation', () => {
    it('should isolate resumes between different sessions', async () => {
      const agent1 = request.agent(app);
      const agent2 = request.agent(app);

      // Create resume in session 1
      const response1 = await agent1
        .post(`${config.server.apiPrefix}/resumes`)
        .send({
          ...validResumePayload,
          title: 'Session 1 Resume',
        })
        .expect(201);

      const resumeId1 = response1.body.data.id;

      // Create resume in session 2
      const response2 = await agent2
        .post(`${config.server.apiPrefix}/resumes`)
        .send({
          ...validResumePayload,
          title: 'Session 2 Resume',
        })
        .expect(201);

      const resumeId2 = response2.body.data.id;

      // Session 1 should not see session 2's resume
      const list1 = await agent1
        .get(`${config.server.apiPrefix}/resumes`)
        .expect(200);

      expect(list1.body.data.data).toHaveLength(1);
      expect(list1.body.data.data[0]).toHaveProperty('title', 'Session 1 Resume');

      // Session 2 should not see session 1's resume
      const list2 = await agent2
        .get(`${config.server.apiPrefix}/resumes`)
        .expect(200);

      expect(list2.body.data.data).toHaveLength(1);
      expect(list2.body.data.data[0]).toHaveProperty('title', 'Session 2 Resume');

      // Session 1 should not be able to access session 2's resume
      const access = await agent1
        .get(`${config.server.apiPrefix}/resumes/${resumeId2}`)
        .expect(404);

      expect(access.body.error).toHaveProperty('code', 'RESUME_NOT_FOUND');
    });
  });

  describe('Resume Response Structure', () => {
    it('should include all required metadata in response', async () => {
      const response = await createAgent()
        .post(`${config.server.apiPrefix}/resumes`)
        .send(validResumePayload)
        .expect(201);

      const data = response.body.data;

      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('sessionId');
      expect(data).toHaveProperty('title');
      expect(data).toHaveProperty('content');
      expect(data).toHaveProperty('template');
      expect(data).toHaveProperty('skills');
      expect(data).toHaveProperty('experience');
      expect(data).toHaveProperty('jobDescription');
      expect(data).toHaveProperty('templateType');
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('updatedAt');
    });
  });
});
