import { Router, RequestHandler } from 'express';
import { config } from '../config';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the server and configuration details in development mode
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 config:
 *                   type: object
 *                   description: Server configuration (only in development mode)
 */
const handleHealthCheck: RequestHandler = (_req, res) => {
  const response: any = {
    status: 'healthy',
  };

  // Only include configuration in development mode
  if (config.environment === 'development') {
    response.config = {
      server: {
        ...config.server,
        url: `http://${config.server.host}:${config.server.port}`,
        swaggerUrl: `http://${config.server.host}:${config.server.port}${config.server.swaggerPath}`,
      },
      aws: {
        ...config.aws,
        dynamodb: {
          ...config.aws.dynamodb,
          url: config.aws.dynamodb.endpoint,
        },
        sqs: {
          ...config.aws.sqs,
          url: config.aws.sqs.endpoint,
        },
        s3: {
          ...config.aws.s3,
          url: config.aws.s3.endpoint,
        },
      },
      consul: {
        ...config.consul,
        url: `http://${config.consul.host}:${config.consul.port}`,
      },
      ffmpeg: {
        ...config.ffmpeg,
        url: `http://${config.ffmpeg.host}:${config.ffmpeg.port}`,
        swaggerUrl: `http://${config.ffmpeg.host}:${config.ffmpeg.port}/api-docs`,
      },
    };
  }

  res.json(response);
};

router.get('/', handleHealthCheck);

export default router; 