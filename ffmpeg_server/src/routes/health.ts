import { Router } from 'express';
import { config } from '../config';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the ffmpeg server and configuration in development mode
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-04-23T19:53:18.000Z"
 *                 config:
 *                   type: object
 *                   description: "Configuration object (only in development mode)"
 */
router.get('/', (req, res) => {
  const response: any = {
    status: 'healthy',
    timestamp: new Date().toISOString()
  };

  // Add configuration in development mode
  if (config.environment === 'development') {
    // Create a safe copy of config without sensitive data
    const safeConfig = {
      ...config,
      aws: {
        ...config.aws,
        credentials: {
          accessKeyId: config.aws.credentials.accessKeyId ? '***' : undefined,
          secretAccessKey: config.aws.credentials.secretAccessKey ? '***' : undefined
        }
      }
    };
    response.config = safeConfig;
  }

  res.json(response);
});

export default router; 