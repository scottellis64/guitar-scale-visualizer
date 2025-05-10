// Load environment variables first
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import { initializeLocalStack } from './utils/initLocalstack';
import { config } from './config';
import { swaggerMiddleware, swaggerUiHandler } from './swagger';
import { createServiceDiscoveryService, ServiceConfig, ConsulConfig, createS3Client } from '@fretstop/shared';
import { DBManagerService } from './services';

// Import the centralized router
import router from './routes';

// Load environment variables
dotenv.config();

const app = express();
const serviceDiscovery = createServiceDiscoveryService(config as ServiceConfig<any>);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API documentation
app.use(config.service.swaggerPath, swaggerMiddleware, swaggerUiHandler);

// Routes
app.use('/api', router);

// Initialize AWS Clients
const s3Client = createS3Client(config.aws);

// Make clients available globally
app.locals.s3Client = s3Client;

// Start server
const startServer = async () => {
  try {
    // Initialize LocalStack resources in development
    if (config.environment === 'development') {
      await initializeLocalStack();
    } else {
      // Initialize database in non-development environments
      await DBManagerService.getInstance().init();
    }

    const {
      host,
      port,
      name,
      tags,
      check
    } = config.serviceDiscovery as ConsulConfig;

    // Register with service discovery
    await serviceDiscovery.registerService({
      name,
      host,
      port,
      tags,
      check,
    });
    
    // Start server
    app.listen(config.service.port, config.service.host, () => {
      console.log(`Server is running on port ${config.service.port}`);
      console.log(`Swagger UI is available at http://${config.service.host}:${config.service.port}${config.service.swaggerPath}`);
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