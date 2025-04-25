import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { config, getFfmpegQueueUrl } from './config';
import routes from './routes';
import { createWorkerService } from './factory';
import { registerService } from './serviceDiscovery';

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FFmpeg Server API',
      version: '1.0.0',
      description: 'API documentation for FFmpeg Server',
    },
    servers: [
      {
        url: getFfmpegQueueUrl(),
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());

// Register API routes
app.use('/api', routes);

// Swagger UI
app.use('/api-docs', (swaggerUi as any).serve);
app.get('/api-docs', (swaggerUi as any).setup(swaggerSpec));

// Initialize worker service
const worker = createWorkerService();

// Start server and worker
app.listen(config.server.port, config.server.host, async () => {
  console.log(`FFmpeg server is running on port ${config.server.port}`);
  console.log(`API documentation available at http://${config.server.host}:${config.server.port}/api-docs`);
  
  await registerService('ffmpeg');
  await worker.start();
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  try {
    console.log('Shutting down FFmpeg server...');
    await worker.shutdown();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}); 