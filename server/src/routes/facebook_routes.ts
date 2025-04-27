import { Router, RequestHandler } from 'express';
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { v4 as uuidv4 } from 'uuid';
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { 
  getMedia, 
  deleteMedia, 
  listMedia, 
  BUCKETS,
  TABLES,
  ddbDocClient
} from '../utils';
import { createSQSClient } from '../factory';
import { getFfmpegQueueUrl } from '../config';

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
}

const router = Router();
const sqsClient = createSQSClient();

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
const handleDownloadReel: RequestHandler = async (req, res, next) => {
  try {
    const { url, title, uploader, userId } = req.body;
    
    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    // Generate a unique ID for this operation
    const operationId = uuidv4();

    // Save initial metadata to DynamoDB
    const initialMetadata: MediaMetadata = {
      id: operationId,
      status: 'PENDING',
      url,
      title,
      uploader,
      userId: userId || 'anonymous',
      createdAt: new Date().toISOString()
    };

    await ddbDocClient.send(new PutCommand({
      TableName: TABLES.USERS, // Using USERS table for now
      Item: initialMetadata
    }));

    // Send message to SQS
    await sqsClient.send(new SendMessageCommand({
      QueueUrl: getFfmpegQueueUrl(),
      MessageBody: JSON.stringify({
        operationId,
        type: 'FACEBOOK_DOWNLOAD',
        url,
        title,
        uploader,
        userId: userId || 'anonymous'
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
const handleCheckStatus: RequestHandler = async (req, res, next) => {
  try {
    const { operationId } = req.params;
    
    // Get metadata from DynamoDB
    const { Item: metadata } = await ddbDocClient.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { id: operationId }
    }));

    if (!metadata) {
      res.status(404).json({ error: 'Operation not found' });
      return;
    }

    const response: any = {
      status: metadata.status
    };

    // If the video is ready, include the download URL
    if (metadata.status === 'COMPLETED') {
      const { metadata: videoMetadata } = await getMedia(operationId);
      response.videoUrl = `/api/facebook/reels/${operationId}`;
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
const handleGetReel: RequestHandler = async (req, res, next) => {
  try {
    const { metadata } = await getMedia(req.params.id);
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
const handleListReels: RequestHandler = async (_req, res, next) => {
  try {
    const reels = await listMedia(BUCKETS.REELS);
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
const handleDeleteReel: RequestHandler = async (req, res, next) => {
  try {
    await deleteMedia(req.params.id);
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