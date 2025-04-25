import { Router, Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';
import { validateRequest } from '../middleware';
import { saveMedia, getMedia, deleteMedia, listMedia, BUCKETS } from '../utils/dynamodb';
import { downloadSchema } from '../schemas';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/audio/{id}/info:
 *   get:
 *     summary: Get audio file information
 *     description: Retrieves metadata and information about a specific audio file
 *     tags: [Audio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the audio file
 *     responses:
 *       200:
 *         description: Audio file information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 filename:
 *                   type: string
 *                 contentType:
 *                   type: string
 *                 uploadDate:
 *                   type: string
 *                   format: date-time
 *                 title:
 *                   type: string
 *                 artist:
 *                   type: string
 *                 duration:
 *                   type: number
 *                 size:
 *                   type: number
 *       404:
 *         description: Audio file not found
 *       500:
 *         description: Server error
 */
const handleGetInfo: RequestHandler = async (req, res, next) => {
  try {
    const { metadata } = await getMedia(req.params.id, BUCKETS.AUDIO);
    res.json({
      id: metadata.id,
      filename: metadata.filename,
      contentType: metadata.contentType,
      uploadDate: metadata.createdAt,
      title: metadata.title,
      artist: metadata.artist,
      duration: metadata.duration,
      size: metadata.size
    });
  } catch (error) {
    console.error('Audio info error:', error);
    res.status(500).json({ error: 'Failed to get audio information' });
  }
};

/**
 * @swagger
 * /api/audio/{id}:
 *   get:
 *     summary: Get audio content
 *     description: Retrieves the audio file content directly
 *     tags: [Audio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the audio file
 *     responses:
 *       200:
 *         description: Audio file content
 *         content:
 *           audio/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Audio file not found
 *       500:
 *         description: Server error
 */
const handleGetAudio: RequestHandler = async (req, res, next) => {
  try {
    const { url } = await getMedia(req.params.id, BUCKETS.AUDIO);
    res.redirect(url);
  } catch (error) {
    console.error('Audio download error:', error);
    res.status(500).json({ error: 'Failed to download audio file' });
  }
};

/**
 * @swagger
 * /api/audio/{id}/stream:
 *   get:
 *     summary: Stream audio with speed control
 *     description: Streams the audio file with adjustable playback speed
 *     tags: [Audio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the audio file
 *       - in: query
 *         name: speed
 *         schema:
 *           type: number
 *           default: 1.0
 *         description: Playback speed multiplier
 *     responses:
 *       200:
 *         description: Audio stream
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Audio file not found
 *       500:
 *         description: Server error
 */
const handleStreamAudio: RequestHandler = async (req, res, next) => {
  try {
    const { url } = await getMedia(req.params.id, BUCKETS.AUDIO);
    const speed = parseFloat(req.query.speed as string) || 1.0;
    const passThrough = new PassThrough();

    res.set('Content-Type', 'audio/mpeg');
    res.set('Accept-Ranges', 'bytes');

    ffmpeg(url)
      .audioFilters(`atempo=${speed}`)
      .format('mp3')
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to process audio' });
        }
      })
      .pipe(passThrough);

    passThrough.pipe(res);

    req.on('close', () => {
      passThrough.destroy();
    });
  } catch (error) {
    console.error('Audio stream error:', error);
    res.status(500).json({ error: 'Failed to stream audio' });
  }
};

/**
 * @swagger
 * /api/audio:
 *   get:
 *     summary: List all audio files
 *     description: Retrieves a list of all available audio files
 *     tags: [Audio]
 *     responses:
 *       200:
 *         description: List of audio files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 audioFiles:
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
 *                       uploadDate:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error
 */
const handleListAudio: RequestHandler = async (_req, res, next) => {
  try {
    const audioFiles = await listMedia(BUCKETS.AUDIO);
    res.json({ audioFiles });
  } catch (error) {
    console.error('List audio error:', error);
    res.status(500).json({ error: 'Failed to list audio files' });
  }
};

/**
 * @swagger
 * /api/audio/{id}:
 *   delete:
 *     summary: Delete audio file
 *     description: Deletes a specific audio file
 *     tags: [Audio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the audio file
 *     responses:
 *       200:
 *         description: Audio file deleted successfully
 *       404:
 *         description: Audio file not found
 *       500:
 *         description: Server error
 */
const handleDeleteAudio: RequestHandler = async (req, res, next) => {
  try {
    await deleteMedia(req.params.id, BUCKETS.AUDIO);
    res.status(200).json({ message: 'Audio file deleted successfully' });
  } catch (error) {
    console.error('Delete audio error:', error);
    res.status(500).json({ error: 'Failed to delete audio file' });
  }
};

// Register routes
router.get('/audio/:id/info', handleGetInfo);
router.get('/audio/:id', handleGetAudio);
router.get('/audio/:id/stream', handleStreamAudio);
router.get('/audio', handleListAudio);
router.delete('/audio/:id', handleDeleteAudio);

export default router; 