import { Router, RequestHandler } from 'express';
import multer from 'multer';
import axios from 'axios';
import { saveMedia, getMedia, deleteMedia, listMedia } from '../utils/dynamodb';
import { config } from '../config';
import { BUCKETS } from '../utils';
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/video/videos:
 *   get:
 *     summary: List all videos
 *     description: Returns a list of all videos in the system
 *     tags: [Videos]
 *     responses:
 *       200:
 *         description: List of videos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 videos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       filename:
 *                         type: string
 *                       contentType:
 *                         type: string
 *                       size:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error
 */
const handleListVideos: RequestHandler = async (_req, res, next) => {
  try {
    const videos = await listMedia(BUCKETS.VIDEO);
    res.json({ videos });
  } catch (error) {
    console.error('List videos error:', error);
    res.status(500).json({ error: 'Failed to list videos' });
  }
};

/**
 * @swagger
 * /api/video/videos/{id}:
 *   get:
 *     summary: Get video by ID
 *     description: Retrieves a video's information and URL by its ID
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 filename:
 *                   type: string
 *                 length:
 *                   type: number
 *                 uploadDate:
 *                   type: string
 *                   format: date-time
 *                 contentType:
 *                   type: string
 *                 url:
 *                   type: string
 *       404:
 *         description: Video not found
 *       500:
 *         description: Server error
 */
const handleGetVideo: RequestHandler = async (req, res, next) => {
  try {
    const { metadata, url } = await getMedia(req.params.id, BUCKETS.VIDEO);
    res.json({
      id: metadata.id,
      filename: metadata.filename,
      length: metadata.size,
      uploadDate: metadata.createdAt,
      contentType: metadata.contentType,
      url
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Failed to get video' });
  }
};

/**
 * @swagger
 * /api/video/videos:
 *   post:
 *     summary: Upload a video
 *     description: Uploads a video file to the system
 *     tags: [Videos]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Video uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 videoId:
 *                   type: string
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Server error
 */
const handleUploadVideo: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No video file uploaded' });
      return;
    }

    const id = await saveMedia(req.file, req.body.userId || 'anonymous', {
      contentType: req.file.mimetype,
      uploadDate: new Date().toISOString(),
      ...req.body
    }, BUCKETS.VIDEO);

    res.status(201).json({ videoId: id });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
};

/**
 * @swagger
 * /api/video/videos/{id}:
 *   delete:
 *     summary: Delete a video
 *     description: Deletes a video by its ID
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       404:
 *         description: Video not found
 *       500:
 *         description: Server error
 */
const handleDeleteVideo: RequestHandler = async (req, res, next) => {
  try {
    await deleteMedia(req.params.id, BUCKETS.VIDEO);
    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};

/**
 * @swagger
 * /api/video/youtube:
 *   post:
 *     summary: Download YouTube video
 *     description: Downloads a video from YouTube and saves it to the system
 *     tags: [Videos]
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
 *                 description: YouTube video URL
 *               quality:
 *                 type: string
 *                 default: best
 *                 description: Video quality
 *               title:
 *                 type: string
 *                 description: Custom title for the video
 *               description:
 *                 type: string
 *                 description: Video description
 *               userId:
 *                 type: string
 *                 description: User ID
 *     responses:
 *       201:
 *         description: Video downloaded and saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 videoId:
 *                   type: string
 *       400:
 *         description: YouTube URL is required
 *       500:
 *         description: Server error
 */
const handleDownloadYouTube: RequestHandler = async (req, res, next) => {
  try {
    const { url, quality = 'best', title, description, userId } = req.body;
    
    if (!url) {
      res.status(400).json({ error: 'YouTube URL is required' });
      return;
    }

    const ffmpegServerUrl = `http://${config.ffmpeg.host}:${config.ffmpeg.port}`;

    // Download video from ffmpeg-server
    const downloadResponse = await axios.post(`${ffmpegServerUrl}/youtube/download`, {
      url,
      quality
    }, {
      responseType: 'arraybuffer'
    });

    // Create a file object from the downloaded data
    const file = {
      buffer: Buffer.from(downloadResponse.data),
      originalname: title ? `${title}.mp4` : `youtube_${Date.now()}.mp4`,
      mimetype: 'video/mp4',
      size: downloadResponse.data.length
    };

    // Save to S3 and DynamoDB
    const id = await saveMedia(file as any, userId || 'anonymous', {
      contentType: 'video/mp4',
      uploadDate: new Date().toISOString(),
      source: 'youtube',
      originalUrl: url,
      quality,
      description
    }, BUCKETS.VIDEO);

    res.status(201).json({ videoId: id });
  } catch (error) {
    console.error('YouTube download error:', error);
    res.status(500).json({ error: 'Failed to download YouTube video' });
  }
};

// Register routes
router.get('/videos', handleListVideos);
router.get('/videos/:id', handleGetVideo);
router.post('/videos', upload.single('file'), handleUploadVideo);
router.delete('/videos/:id', handleDeleteVideo);
router.post('/youtube', handleDownloadYouTube);

export default router; 