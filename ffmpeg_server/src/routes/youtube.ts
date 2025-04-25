import { Router } from 'express';
import { createYoutubeService } from '../factory';

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
 *     responses:
 *       200:
 *         description: Video downloaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 url:
 *                   type: string
 *                 format:
 *                   type: string
 *                 size:
 *                   type: number
 *       500:
 *         description: Server error
 */
router.post('/download', async (req, res) => {
  try {
    const result = await youtubeService.downloadVideo(req.body);
    res.json(result);
  } catch (error) {
    console.error('YouTube download error:', error);
    res.status(500).json({ error: 'Failed to download YouTube video' });
  }
});

export default router; 