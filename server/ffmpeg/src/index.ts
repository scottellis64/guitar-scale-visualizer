import express from 'express';
import cors from 'cors';
import { swaggerMiddleware, swaggerUiHandler } from './swagger';
import { config } from './config';
import routes from './routes';
import { createServiceDiscoveryService } from '@fretstop/shared';
import { createSQSListenerService } from './factory';
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log(config.service.swaggerPath);

// API documentation
app.use(config.service.swaggerPath!, swaggerMiddleware, swaggerUiHandler);

// Routes
app.use('/api', routes);

// Initialize worker service
const sqsListenerService = createSQSListenerService();
const serviceDiscoveryService = createServiceDiscoveryService(config);


// Start server and worker
app.listen(config.service.port, config.service.host, async () => {
  console.log(`FFmpeg server is running on port ${config.service.port}`);
  console.log(`API documentation available at http://${config.service.host}:${config.service.port}/api-docs`);
  
  await serviceDiscoveryService.registerService({
    name: 'ffmpeg',
    port: config.service.port,
    host: config.service.host,
    tags: ['ffmpeg', 'video-processing'],
    check: {
      http: `http://${config.service.host}:${config.service.port}/api/health`,
      interval: '10s',
      timeout: '5s',
    },
  });

  console.log('Starting worker service...');
  await sqsListenerService.start();
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  try {
    console.log('Shutting down FFmpeg server...');
    await sqsListenerService.shutdown();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}); 