import app from './app';
import config from './config';

const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}${config.server.apiPrefix}/health`);
  console.log(`🌍 Environment: ${config.server.env}`);
});