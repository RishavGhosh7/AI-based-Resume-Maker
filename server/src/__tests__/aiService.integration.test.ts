import aiService from '../services/aiService';

async function testAiService() {
  console.log('Testing AI Service...');
  
  // Test mock mode
  process.env.AI_MOCK_MODE = 'true';
  
  const testRequest = {
    skills: ['JavaScript', 'TypeScript', 'React'],
    experienceHistory: [
      {
        company: 'Tech Corp',
        position: 'Senior Developer',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-01-01'),
        description: 'Built amazing applications',
        achievements: ['Increased performance by 50%', 'Led team of 5']
      }
    ],
    jobDescription: 'Looking for a senior developer with React experience',
    templateType: 'senior' as const
  };

  try {
    console.log('Testing mock mode generation...');
    const result = await aiService.generateResume(testRequest);
    console.log('Mock generation successful:', JSON.stringify(result, null, 2));
    
    console.log('Testing health check...');
    const isHealthy = await aiService.checkHealth();
    console.log('Health check result:', isHealthy);
    
    console.log('Testing mock mode flag...');
    const isMockMode = aiService.isMockMode();
    console.log('Mock mode:', isMockMode);
    
    console.log('✅ All AI service tests passed!');
  } catch (error) {
    console.error('❌ AI service test failed:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testAiService();
}

export default testAiService;