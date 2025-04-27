import express from 'express';
import cors from 'cors';
import { swaggerMiddleware, swaggerUiHandler } from './swagger';
import { config } from './config';
import routes from './routes';
import { createWorkerService, createServiceDiscoveryService } from './factory';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log(config.server.swaggerPath);

// API documentation
app.use(config.server.swaggerPath, swaggerMiddleware, swaggerUiHandler);

// Routes
app.use('/api', routes);

// Initialize worker service
const worker = createWorkerService();
const serviceDiscovery = createServiceDiscoveryService();

// Start server and worker
app.listen(config.server.port, config.server.host, async () => {
  console.log(`FFmpeg server is running on port ${config.server.port}`);
  console.log(`API documentation available at http://${config.server.host}:${config.server.port}/api-docs`);
  
  await serviceDiscovery.registerService({
    name: 'ffmpeg',
    port: config.server.port,
    address: config.server.host,
    tags: ['ffmpeg', 'video-processing'],
    check: {
      http: `http://${config.server.host}:${config.server.port}/api/health`,
      interval: '10s',
      timeout: '5s',
    },
  });

  console.log('Starting worker service...');
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