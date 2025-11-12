# AI Integration with Ollama

This document describes the AI integration implemented for generating resume content using Ollama.

## Overview

The application integrates with Ollama to generate AI-powered resume sections including:
- Professional Summary
- Skills Section  
- Experience Section
- Education Section

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# AI Configuration
AI_MOCK_MODE=false
```

### Dependencies

The following packages are required:
- `axios` - For HTTP requests to Ollama API
- `@types/axios` - TypeScript definitions

## Usage

### Mock Mode (Development/Testing)

Set `AI_MOCK_MODE=true` to use mock responses instead of calling Ollama:

```bash
AI_MOCK_MODE=true
```

This is useful for:
- Development without Ollama running
- Automated testing
- CI/CD pipelines

### Production Mode

Set `AI_MOCK_MODE=false` and ensure Ollama is running:

```bash
# Start Ollama (if not already running)
ollama serve

# Pull the required model
ollama pull llama2

# Set environment
AI_MOCK_MODE=false
```

## API Integration

### POST /api/v1/resumes

When creating a resume, the AI service is automatically called to generate content based on:

- **skills**: Array of user skills
- **experienceHistory**: Work experience details
- **jobDescription**: Target job description (optional)
- **templateType**: 'fresher', 'mid', or 'senior'

Example Request:

```json
{
  "userId": "user123",
  "templateType": "senior",
  "skills": ["JavaScript", "TypeScript", "React"],
  "experienceHistory": [
    {
      "company": "Tech Corp",
      "position": "Senior Developer", 
      "startDate": "2022-01-01",
      "endDate": "2023-01-01",
      "description": "Built scalable applications",
      "achievements": ["Increased performance by 50%"]
    }
  ],
  "jobDescription": "Looking for a senior React developer"
}
```

Example Response:

```json
{
  "success": true,
  "data": {
    "id": "64a1b2c3d4e5f6789012345",
    "generatedSections": {
      "summary": "Experienced senior developer with expertise in JavaScript, TypeScript, and React...",
      "skills": "Technical Skills: JavaScript, TypeScript, React. Additional Skills: Leadership, Problem-solving...",
      "experience": "Senior Developer at Tech Corp: Built scalable applications. Key achievements: Increased performance by 50%...",
      "education": "Advanced degree with specialized focus..."
    }
  }
}
```

## Error Handling

The AI service includes comprehensive error handling:

### Connection Errors
- **503 Service Unavailable**: When Ollama is not running
- **504 Gateway Timeout**: When Ollama request times out

### Retry Logic
- Automatic retries (3 attempts) with exponential backoff
- Graceful degradation to mock responses on persistent failures

### Fallback Content
If AI generation fails, the service provides basic fallback content to ensure the resume creation process continues.

## Health Check

The health endpoint includes AI service status:

```bash
GET /api/v1/health
```

Response includes:

```json
{
  "services": {
    "ollama": "connected" | "disconnected"
  }
}
```

## Prompt Engineering

The AI service uses structured prompts that:

1. Include all relevant user input (skills, experience, job description)
2. Specify the exact JSON response format required
3. Provide clear instructions for each resume section
4. Adapt content based on template type (fresher/mid/senior)

## Testing

### Unit Tests
- Mock Ollama API responses
- Test prompt generation
- Test response parsing
- Test error scenarios
- Test retry logic

### Integration Tests  
- Test end-to-end resume creation with AI
- Test mock mode functionality
- Test graceful degradation

Run tests:

```bash
# Run all tests
npm test

# Run AI service tests only
npm test -- aiService.test.ts

# Run integration tests
npm test -- resume.api.test.ts
```

## Development Workflow

1. **Development**: Use `AI_MOCK_MODE=true` for faster development
2. **Testing**: Tests automatically use mock mode
3. **Staging**: Test with real Ollama instance
4. **Production**: Use real Ollama with proper monitoring

## Monitoring

Monitor the following:
- AI service response times
- Error rates for AI generation
- Ollama service availability
- Fallback usage frequency

## Troubleshooting

### Common Issues

1. **Ollama Connection Refused**
   - Ensure Ollama is running: `ollama serve`
   - Check OLLAMA_BASE_URL configuration

2. **Model Not Found**
   - Pull the required model: `ollama pull llama2`
   - Verify OLLAMA_MODEL configuration

3. **Timeout Errors**
   - Increase timeout in aiService.ts if needed
   - Check Ollama performance and system resources

4. **Poor Quality Responses**
   - Review and adjust prompt templates
   - Consider using different models (e.g., llama2:13b)

### Debug Mode

Enable debug logging:

```bash
DEBUG=ai:* npm run dev
```

## Future Enhancements

Potential improvements:
- Support for multiple AI models
- Custom prompt templates per user
- Response quality scoring
- A/B testing for prompts
- Caching of AI responses
- Streaming responses for better UX