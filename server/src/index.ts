// Load environment variables first
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import { appRouter, facebookRouter, audioRouter, videoRouter } from './routes';
import { registerService } from './utils';
import { initializeLocalStack } from './utils/initLocalstack';
import { config } from './config';
import { swaggerMiddleware, swaggerUiHandler } from './swagger';
import { createDynamoDBDocumentClient, createS3Client } from './factory';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', appRouter);
app.use('/api/facebook', facebookRouter);
app.use('/api/audio', audioRouter);
app.use('/api/video', videoRouter);

// Add Swagger UI to the main server
app.use(config.server.swaggerPath, swaggerMiddleware, swaggerUiHandler);

// Initialize AWS Clients
const s3Client = createS3Client();
const ddbDocClient = createDynamoDBDocumentClient();

// Make clients available globally
app.locals.ddbDocClient = ddbDocClient;
app.locals.s3Client = s3Client;

// Start server
const startServer = async () => {
  try {
    // Initialize LocalStack resources in development
    if (config.environment === 'development') {
      await initializeLocalStack();
    }

    // Register with Consul
    await registerService({
      name: 'server',
      port: config.server.port,
      address: config.server.host,
      tags: ['api', 'rest'],
    });
    
    // Start server
    app.listen(config.server.port, config.server.host, () => {
      console.log(`Server is running on port ${config.server.port}`);
      console.log(`Swagger UI is available at http://${config.server.host}:${config.server.port}${config.server.swaggerPath}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  try {
    console.log('Shutting down server...');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}); 