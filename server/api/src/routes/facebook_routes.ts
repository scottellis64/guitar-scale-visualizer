import { Router, RequestHandler, Response, NextFunction } from 'express';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { getMedia, deleteMedia, createOperation, createVideoUserAssociation, getVideoUserAssociations, hasVideoAccess, deleteVideoUserAssociation } from '../db';
import { BUCKETS } from '../utils';
import { createSQSClient } from '@fretstop/shared';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { config, getFfmpegQueueUrl, TABLES } from '../config';
import { DBManagerService } from '../services';

interface MediaMetadata {
  id: string;
  title?: string;
  uploader?: string;
  description?: string;
  duration?: number;
  viewCount?: number;
  thumbnail?: string;
  url?: string;
  status: string;
  userId?: string;
  createdAt?: string;
  s3Key?: string;
}

const router = Router();
const sqsClient = createSQSClient(config);
const ddbDocClient = DBManagerService.getInstance().getDDBDocClient();
router.use(authenticateJWT as RequestHandler);

/**
 * @swagger
 * /api/facebook/download:
 *   post:
 *     summary: Download Facebook reel
 *     description: Initiates a download of a Facebook reel
 *     tags: [Facebook]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 description: Facebook reel URL
 *               title:
 *                 type: string
 *                 description: Custom title for the reel
 *               uploader:
 *                 type: string
 *                 description: Name of the uploader
 *               userId:
 *                 type: string
 *                 description: User ID
 *     responses:
 *       202:
 *         description: Download request accepted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 operationId:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: URL is required
 *       500:
 *         description: Server error
 */
const handleDownloadReel: RequestHandler = async (req: AuthenticatedRequest, res, next) => {
  try {
    const { url, title, uploader } = req.body;
    const userId = req.user?.id || 'anonymous';
    
    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    // Create an operation to track the download
    const operationId = await createOperation(
      userId,
      'FACEBOOK_DOWNLOAD',
      {
        url,
        title,
        uploader,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }
    );

    // Send message to SQS
    await sqsClient.send(new SendMessageCommand({
      QueueUrl: getFfmpegQueueUrl(),
      MessageBody: JSON.stringify({
        operationId,
        type: 'FACEBOOK_DOWNLOAD',
        url,
        title,
        uploader,
        userId
      })
    }));

    res.status(202).json({ 
      message: 'Download request accepted',
      operationId,
      status: 'PENDING'
    });
  } catch (error) {
    console.error('Facebook download error:', error);
    res.status(500).json({ error: 'Failed to process download request' });
  }
};

/**
 * @swagger
 * /api/facebook/status/{operationId}:
 *   get:
 *     summary: Check download status
 *     description: Checks the status of a Facebook reel download
 *     tags: [Facebook]
 *     parameters:
 *       - in: path
 *         name: operationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The operation ID returned from the download request
 *     responses:
 *       200:
 *         description: Download status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [PENDING, PROCESSING, COMPLETED, FAILED]
 *                 videoUrl:
 *                   type: string
 *                   description: URL to download the video (only if status is COMPLETED)
 *       404:
 *         description: Operation not found
 *       500:
 *         description: Server error
 */
const handleCheckStatus = async (
  req: AuthenticatedRequest<{ operationId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { operationId } = req.params;
    const userId = req.user?.id;
    
    // Get operation from DynamoDB
    const { Item: operation } = await ddbDocClient.send(new GetCommand({
      TableName: TABLES.OPERATIONS,
      Key: { id: operationId }
    }));

    if (!operation) {
      res.status(404).json({ error: 'Operation not found' });
      return;
    }

    // Verify the user has permission to access this operation
    if (operation.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized access to operation' });
      return;
    }

    const response: any = {
      status: operation.status
    };

    // If the video is ready, include the download URL and create association
    if (operation.status === 'COMPLETED') {
      const { metadata: videoMetadata } = await getMedia(operationId, BUCKETS.REELS);
      response.videoUrl = `/api/facebook/reels/${operationId}`;

      // Create association between video and user if not already associated
      if (operation.userId && operation.userId !== 'anonymous') {
        await createVideoUserAssociation(operationId, operation.userId, {
          type: 'FACEBOOK_REEL',
          s3Key: videoMetadata.s3Key,
          createdAt: new Date().toISOString()
        });
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
};

/**
 * @swagger
 * /api/facebook/reels/{id}:
 *   get:
 *     summary: Get reel by ID
 *     description: Retrieves information about a specific Facebook reel
 *     tags: [Facebook]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the reel
 *     responses:
 *       200:
 *         description: Reel information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 uploader:
 *                   type: string
 *                 description:
 *                   type: string
 *                 duration:
 *                   type: number
 *                 viewCount:
 *                   type: number
 *                 thumbnail:
 *                   type: string
 *                 status:
 *                   type: string
 *                 url:
 *                   type: string
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Server error
 */
const handleGetReel = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get the video to verify ownership
    const { metadata } = await getMedia(id, BUCKETS.REELS);
    if (!metadata) {
      res.status(404).json({ error: 'Reel not found' });
      return;
    }

    // Verify the user has permission to access this reel
    const hasAccess = await hasVideoAccess(userId, id);
    if (!hasAccess) {
      res.status(403).json({ error: 'Unauthorized to access this reel' });
      return;
    }

    const mediaMetadata = metadata as unknown as MediaMetadata;
    res.json({
      id: mediaMetadata.id,
      title: mediaMetadata.title,
      uploader: mediaMetadata.uploader,
      description: mediaMetadata.description,
      duration: mediaMetadata.duration,
      viewCount: mediaMetadata.viewCount,
      thumbnail: mediaMetadata.thumbnail,
      status: mediaMetadata.status,
      url: mediaMetadata.url
    });
  } catch (error) {
    console.error('Get reel error:', error);
    res.status(500).json({ error: 'Failed to get reel' });
  }
};

/**
 * @swagger
 * /api/facebook/reels:
 *   get:
 *     summary: List all reels
 *     description: Retrieves a list of all available Facebook reels
 *     tags: [Facebook]
 *     responses:
 *       200:
 *         description: List of reels
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reels:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       uploader:
 *                         type: string
 *                       status:
 *                         type: string
 *       500:
 *         description: Server error
 */
const handleListReels = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req;

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userId = (user as any).userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get all video-user associations for this user
    const associations = await getVideoUserAssociations(userId);
    
    // Get details for each associated reel
    const reels = await Promise.all(
      associations.map(async (association) => {
        const { metadata } = await getMedia(association.videoId, BUCKETS.REELS);
        return {
          id: metadata.id,
          title: metadata.title,
          uploader: metadata.uploader,
          status: metadata.status,
          createdAt: metadata.createdAt
        };
      })
    );

    res.json({ reels });
  } catch (error) {
    console.error('List reels error:', error);
    res.status(500).json({ error: 'Failed to list reels' });
  }
};

/**
 * @swagger
 * /api/facebook/reels/{id}:
 *   delete:
 *     summary: Delete reel
 *     description: Deletes a specific Facebook reel
 *     tags: [Facebook]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the reel
 *     responses:
 *       200:
 *         description: Reel deleted successfully
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Server error
 */
const handleDeleteReel = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get the video to verify ownership
    const { metadata } = await getMedia(id, BUCKETS.REELS);
    if (!metadata) {
      res.status(404).json({ error: 'Reel not found' });
      return;
    }

    // Verify the user has permission to delete this reel
    const hasAccess = await hasVideoAccess(userId, id);
    if (!hasAccess) {
      res.status(403).json({ error: 'Unauthorized to delete this reel' });
      return;
    }

    // Delete the video and its association
    await Promise.all([
      deleteMedia(id, BUCKETS.REELS),
      deleteVideoUserAssociation(userId, id)
    ]);

    res.status(200).json({ message: 'Reel deleted successfully' });
  } catch (error) {
    console.error('Delete reel error:', error);
    res.status(500).json({ error: 'Failed to delete reel' });
  }
};

// Register routes
router.post('/download', handleDownloadReel);
router.get('/status/:operationId', handleCheckStatus);
router.get('/reels/:id', handleGetReel);
router.get('/reels', handleListReels);
router.delete('/reels/:id', handleDeleteReel);

export default router; 