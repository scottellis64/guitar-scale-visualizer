import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { getFfmpegInQueueUrl } from './config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FFmpeg Server API',
      version: '1.0.0',
      description: 'API documentation for FFmpeg Server',
    },
    servers: [
      {
        url: getFfmpegInQueueUrl(),
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

console.log(options);

const specs = swaggerJsdoc(options);

export const swaggerMiddleware = swaggerUi.serve;
export const swaggerUiHandler = swaggerUi.setup(specs); 