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
      service: {
        ...config.service,
        url: `http://${config.service.host}:${config.service.port}`,
        swaggerUrl: `http://${config.service.host}:${config.service.port}${config.service.swaggerPath}`,
      },
      aws: {
        ...config.aws,
        dynamodb: {
          ...config.dynamoDB,
          url: config.aws.endpoint,
        },
        sqs: {
          ...config.sqs,
          url: config.aws.endpoint,
        },
        s3: {
          ...config.s3,
          url: config.aws.endpoint,
        },
      }
    };
  }

  res.json(response);
};

router.get('/', handleHealthCheck);

export default router; 