# AI Resume Maker - Server Backend

This is the backend server for the AI-based Resume Maker application. It provides a RESTful API with versioned endpoints, comprehensive error handling, and modern TypeScript support.

## Features

- **Express.js** with TypeScript
- **Centralized Error Handling** with consistent JSON responses
- **Request Logging** with Morgan and custom middleware
- **Body Parsing** with size limits
- **CORS** support with configurable origins
- **Security** with Helmet middleware
- **Configuration Management** with dotenv
- **Validation** with Joi schemas
- **Health Check** endpoint with service status
- **Unit Testing** with Jest and Supertest
- **Versioned API** with `/api/v1` prefix

## Project Structure

```
server/
├── src/
│   ├── app.ts                    # Express app configuration
│   ├── server.ts                 # Server entry point
│   ├── config/
│   │   └── index.ts              # Configuration management
│   ├── controllers/
│   │   ├── healthController.ts   # Health endpoint logic
│   │   └── resumeController.ts   # Resume CRUD operations
│   ├── middleware/
│   │   ├── errorHandler.ts      # Global error handling
│   │   ├── logger.ts            # Request logging
│   │   └── validation.ts        # Request validation
│   ├── routes/
│   │   ├── index.ts             # Route aggregation
│   │   ├── healthRoutes.ts      # Health endpoints
│   │   └── resumeRoutes.ts      # Resume endpoints
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── utils/
│   │   └── response.ts          # Response utilities
│   └── __tests__/
│       ├── health.test.ts       # Health endpoint tests
│       └── errorHandling.test.ts # Error handling tests
├── dist/                        # Compiled JavaScript output
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.js
├── .env.example                 # Environment variables template
└── .env                        # Environment variables (git-ignored)
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration.

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix

## API Endpoints

### Health Check
- `GET /api/v1/health` - Returns service health status

### Resume Management (Placeholder)
- `GET /api/v1/resumes` - List all resumes
- `POST /api/v1/resumes` - Create a new resume
- `GET /api/v1/resumes/:id` - Get a specific resume
- `PUT /api/v1/resumes/:id` - Update a resume
- `DELETE /api/v1/resumes/:id` - Delete a resume

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `API_PREFIX` | API version prefix | `/api/v1` |
| `OLLAMA_BASE_URL` | Ollama service URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | Default Ollama model | `llama2` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## Error Response Format

All errors follow a consistent JSON structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (development only)"
  },
  "timestamp": "2023-11-12T18:52:19.637Z",
  "path": "/api/v1/endpoint"
}
```

## Success Response Format

All successful responses follow this structure:

```json
{
  "success": true,
  "data": {},
  "message": "Optional success message",
  "timestamp": "2023-11-12T18:52:19.637Z",
  "path": "/api/v1/endpoint"
}
```

## Development

The server uses TypeScript for type safety and modern JavaScript features. All code follows ESLint configuration for consistent style.

## Testing

Unit tests are written with Jest and Supertest. They cover:
- Health endpoint functionality
- Error handling middleware
- Request validation
- CORS and security headers

Run tests with:
```bash
npm test
```

## Health Check Response

The health endpoint returns service status including:
- Server uptime
- Environment information
- Service connectivity (Ollama, Database)
- Version information

Example response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 123.45,
    "timestamp": "2023-11-12T18:52:19.637Z",
    "version": "1.0.0",
    "environment": "development",
    "services": {
      "ollama": "connected",
      "database": "disconnected"
    }
  }
}
```