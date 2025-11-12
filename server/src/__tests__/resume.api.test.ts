import request from 'supertest';
import app from '../app';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import config from '../config';

describe('Resume API Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let originalMongoUri: string;

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Store original URI and update config
    originalMongoUri = process.env.MONGO_URI || '';
    process.env.MONGO_URI = mongoUri;
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Disconnect and stop the in-memory server
    await mongoose.disconnect();
    await mongoServer.stop();
    
    // Restore original URI
    process.env.MONGO_URI = originalMongoUri;
  });

  beforeEach(async () => {
    // Clear all collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      if (collection) {
        await collection.deleteMany({});
      }
    }
  });

  describe('POST /api/v1/resumes', () => {
    it('should create a new resume', async () => {
      const resumeData = {
        userId: 'user123',
        templateType: 'fresher',
        skills: ['JavaScript', 'TypeScript'],
        experienceHistory: [
          {
            company: 'Tech Corp',
            position: 'Developer',
            startDate: '2022-01-01T00:00:00.000Z',
            description: 'Web development'
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/resumes')
        .send(resumeData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.userId).toBe(resumeData.userId);
      expect(response.body.data.templateType).toBe(resumeData.templateType);
      expect(response.body.data.skills).toEqual(resumeData.skills);
      expect(response.body.data.id).toBeDefined();
    });

    it('should validate required fields', async () => {
      const invalidData = {
        templateType: 'invalid'
      };

      const response = await request(app)
        .post('/api/v1/resumes')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/resumes', () => {
    beforeEach(async () => {
      // Create test data
      const db = mongoose.connection.db;
      if (db) {
        const resumeModel = db.collection('resumes');
        await resumeModel.insertMany([
          {
            userId: 'user123',
            templateType: 'fresher',
            skills: ['JavaScript'],
            metadata: {
              createdAt: new Date(),
              updatedAt: new Date(),
              version: 1,
              isEditable: true
            }
          },
          {
            userId: 'user123',
            templateType: 'mid',
            skills: ['TypeScript'],
            metadata: {
              createdAt: new Date(),
              updatedAt: new Date(),
              version: 1,
              isEditable: true
            }
          }
        ]);
      }
    });

    it('should get all resumes', async () => {
      const response = await request(app)
        .get('/api/v1/resumes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resumes).toBeDefined();
      expect(response.body.data.resumes).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter resumes by userId', async () => {
      const response = await request(app)
        .get('/api/v1/resumes?userId=user123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resumes).toHaveLength(2);
      expect(response.body.data.resumes[0].userId).toBe('user123');
    });

    it('should filter resumes by templateType', async () => {
      const response = await request(app)
        .get('/api/v1/resumes?templateType=fresher')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resumes).toHaveLength(1);
      expect(response.body.data.resumes[0].templateType).toBe('fresher');
    });
  });

  describe('GET /api/v1/resumes/:id', () => {
    let resumeId: string;

    beforeEach(async () => {
      const db = mongoose.connection.db;
      if (db) {
        const resumeModel = db.collection('resumes');
        const result = await resumeModel.insertOne({
          userId: 'user123',
          templateType: 'fresher',
          skills: ['JavaScript'],
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            isEditable: true
          }
        });
        resumeId = result.insertedId.toString();
      }
    });

    it('should get a resume by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/resumes/${resumeId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(resumeId);
      expect(response.body.data.userId).toBe('user123');
    });

    it('should return 404 for non-existent resume', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/v1/resumes/${fakeId}`)
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Resume not found');
    });
  });

  describe('PUT /api/v1/resumes/:id', () => {
    let resumeId: string;

    beforeEach(async () => {
      const db = mongoose.connection.db;
      if (db) {
        const resumeModel = db.collection('resumes');
        const result = await resumeModel.insertOne({
          userId: 'user123',
          templateType: 'fresher',
          skills: ['JavaScript'],
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            isEditable: true
          }
        });
        resumeId = result.insertedId.toString();
      }
    });

    it('should update a resume', async () => {
      const updateData = {
        templateType: 'senior',
        skills: ['JavaScript', 'TypeScript', 'React']
      };

      const response = await request(app)
        .put(`/api/v1/resumes/${resumeId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.templateType).toBe('senior');
      expect(response.body.data.skills).toEqual(['JavaScript', 'TypeScript', 'React']);
      expect(response.body.data.metadata.version).toBe(2);
    });
  });

  describe('DELETE /api/v1/resumes/:id', () => {
    let resumeId: string;

    beforeEach(async () => {
      const db = mongoose.connection.db;
      if (db) {
        const resumeModel = db.collection('resumes');
        const result = await resumeModel.insertOne({
          userId: 'user123',
          templateType: 'fresher',
          skills: ['JavaScript'],
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            isEditable: true
          }
        });
        resumeId = result.insertedId.toString();
      }
    });

    it('should delete a resume', async () => {
      const response = await request(app)
        .delete(`/api/v1/resumes/${resumeId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Resume deleted successfully');
    });
  });
});