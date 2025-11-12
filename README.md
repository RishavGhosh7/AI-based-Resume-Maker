# AI-based-Resume-Maker

A modern web application for creating AI-powered resumes with a Node.js/Express backend and React frontend.

## Project Structure

This is a monorepo with separate workspaces for the client and server:

```
ai-based-resume-maker/
├── client/                 # React frontend application
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.ts     # Vite configuration
│   └── .env.example       # Environment variables template
├── server/                # Node.js/Express backend API
│   ├── src/               # Backend source code
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── package.json      # Backend dependencies
│   ├── tsconfig.json      # TypeScript configuration
│   └── .env.example       # Environment variables template
├── .gitignore            # Git ignore rules
├── .editorconfig         # Editor configuration
├── .prettierrc           # Prettier formatting rules
├── package.json          # Root package.json with workspaces
└── README.md             # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+ (or yarn/pnpm)
- MongoDB (for the backend database)
- Ollama (for AI functionality)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ai-based-resume-maker
   ```

2. Install dependencies for all workspaces:
   ```bash
   npm run install:all
   ```

3. Set up environment variables:
   ```bash
   # Copy environment templates
   cp .env.example .env
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

4. Start both applications in development mode:
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend development server on http://localhost:3000

### Individual Workspace Commands

#### Backend (server/)
```bash
cd server
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run linting
```

#### Frontend (client/)
```bash
cd client
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linting
```

## API Endpoints

- Health Check: `GET /api/v1/health`
- Resume operations: `GET /api/v1/resumes`

## Development Guidelines

### Code Style

- Uses Prettier for code formatting
- ESLint for linting with TypeScript support
- EditorConfig for consistent editor settings
- 2-space indentation
- Single quotes for strings

### Environment Variables

#### Server (.env)
- `PORT`: Server port (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `OLLAMA_BASE_URL`: Ollama API endpoint
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGIN`: Allowed CORS origins

#### Client (.env)
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Application version

### Testing

The project includes test setups for both frontend and backend. Run tests with:

```bash
# Backend tests
npm run test --workspace=server

# Frontend tests (when configured)
npm run test --workspace=client
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

## License

[Add your license information here]