export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'AI Resume Maker API',
    description: 'Resume generation and management API',
    version: '1.0.0',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Development server',
    },
  ],
  paths: {
    '/resumes': {
      get: {
        summary: 'List resumes',
        description: 'Get all resumes for the current session with pagination support',
        tags: ['Resumes'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
            description: 'Page number (1-indexed)',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            description: 'Items per page',
          },
        ],
        responses: {
          '200': {
            description: 'List of resumes retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Resume' },
                        },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                    message: { type: 'string', example: 'Resumes retrieved successfully' },
                    timestamp: { type: 'string', format: 'date-time' },
                    path: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a new resume',
        description: 'Create a new resume with AI-generated content and user details',
        tags: ['Resumes'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateResumeRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Resume created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Resume' },
                    message: { type: 'string', example: 'Resume created successfully' },
                    timestamp: { type: 'string', format: 'date-time' },
                    path: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/resumes/{id}': {
      get: {
        summary: 'Get resume by ID',
        description: 'Retrieve a specific resume by its ID',
        tags: ['Resumes'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Resume ID',
          },
        ],
        responses: {
          '200': {
            description: 'Resume retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Resume' },
                    message: { type: 'string', example: 'Resume retrieved successfully' },
                    timestamp: { type: 'string', format: 'date-time' },
                    path: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid ID format',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Resume not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        summary: 'Update resume',
        description: 'Update resume content, template, or title',
        tags: ['Resumes'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Resume ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateResumeRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Resume updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Resume' },
                    message: { type: 'string', example: 'Resume updated successfully' },
                    timestamp: { type: 'string', format: 'date-time' },
                    path: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid input or empty update payload',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Resume not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete resume',
        description: 'Delete a resume by ID',
        tags: ['Resumes'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Resume ID',
          },
        ],
        responses: {
          '204': {
            description: 'Resume deleted successfully',
          },
          '400': {
            description: 'Invalid ID format',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Resume not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Resume: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Resume ID' },
          sessionId: { type: 'string', format: 'uuid', description: 'Session ID' },
          title: { type: 'string', description: 'Resume title', example: 'My Resume' },
          content: {
            type: 'object',
            description: 'Resume content with sections',
            example: {
              summary: 'Professional software engineer with 5 years experience',
              sections: {
                education: 'Bachelor in Computer Science',
                experience: 'Senior Software Engineer at Tech Corp',
              },
            },
          },
          template: { type: 'string', description: 'Template type', example: 'modern' },
          skills: {
            type: 'array',
            items: { type: 'string' },
            example: ['JavaScript', 'TypeScript', 'React'],
          },
          experience: {
            type: 'string',
            description: 'Experience summary',
            example: '5 years in software development',
          },
          jobDescription: {
            type: 'string',
            description: 'Target job description',
            example: 'Senior Software Engineer position',
          },
          templateType: {
            type: 'string',
            description: 'Template style',
            example: 'modern',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: [
          'id',
          'sessionId',
          'title',
          'content',
          'template',
          'skills',
          'experience',
          'jobDescription',
          'templateType',
          'createdAt',
          'updatedAt',
        ],
      },
      CreateResumeRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 100, example: 'My Resume' },
          content: {
            type: 'object',
            description: 'Resume content',
            example: { summary: 'Professional summary' },
          },
          skills: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
            minItems: 1,
            example: ['JavaScript', 'TypeScript'],
          },
          experience: { type: 'string', minLength: 1, example: '5 years experience' },
          jobDescription: {
            type: 'string',
            minLength: 1,
            example: 'Senior Software Engineer',
          },
          templateType: { type: 'string', minLength: 1, example: 'modern' },
        },
        required: ['title', 'content', 'skills', 'experience', 'jobDescription', 'templateType'],
      },
      UpdateResumeRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 100 },
          content: { type: 'object' },
          template: { type: 'string', minLength: 1 },
        },
        minProperties: 1,
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 42 },
          totalPages: { type: 'integer', example: 5 },
          hasNext: { type: 'boolean', example: true },
          hasPrev: { type: 'boolean', example: false },
        },
        required: ['page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrev'],
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Validation failed' },
              details: { type: 'string', description: 'Error details (development only)' },
            },
            required: ['code', 'message'],
          },
          timestamp: { type: 'string', format: 'date-time' },
          path: { type: 'string' },
        },
        required: ['success', 'error', 'timestamp', 'path'],
      },
    },
  },
};
