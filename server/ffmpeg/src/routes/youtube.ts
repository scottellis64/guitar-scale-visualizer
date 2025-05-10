import { Router } from 'express';
import { createYoutubeService } from '../factory';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const youtubeService = createYoutubeService();

/**
 * @swagger
 * /api/youtube/download:
 *   post:
 *     summary: Download a YouTube video
 *     description: Downloads a video from YouTube and processes it
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
 *                 description: The YouTube video URL
 *               format:
 *                 type: string
 *                 description: "Optional output format (default: mp4)"
 *               quality:
 *                 type: string
 *                 description: "Optional video quality"
 *               audioOnly:
 *                 type: boolean
 *                 description: "Whether to download audio only"
 *               userId:
 *                 type: string
 *                 description: Optional user ID
 *     responses:
 *       200:
 *         description: Video download initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 operationId:
 *                   type: string
 *                 status:
 *                   type: string
 *                 s3File:
 *                   type: object
 *                   properties:
 *                     bucket:
 *                       type: string
 *                     key:
 *                       type: string
 *                     contentType:
 *                       type: string
 *       500:
 *         description: Server error
 */
router.post('/download', async (req, res) => {
  try {
    const operationId = uuidv4();
    const result = await youtubeService.downloadVideo({
      ...req.body,
      operationId
    });
    res.json({
      operationId,
      status: 'PROCESSING',
      s3File: result.s3File
    });
  } catch (error) {
    console.error('YouTube download error:', error);
    res.status(500).json({ error: 'Failed to download YouTube video' });
  }
});

export default router; 