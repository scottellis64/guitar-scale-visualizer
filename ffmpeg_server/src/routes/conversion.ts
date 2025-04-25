import { Router } from 'express';
import { createConversionService } from '../factory';

const router = Router();
const conversionService = createConversionService();

/**
 * @swagger
 * /api/conversion/convert:
 *   post:
 *     summary: Convert media file
 *     description: Converts a media file to a different format
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inputBuffer
 *               - inputFormat
 *               - outputFormat
 *             properties:
 *               inputBuffer:
 *                 type: string
 *                 format: binary
 *                 description: The input media file as a base64 string
 *               inputFormat:
 *                 type: string
 *                 description: The input format (e.g., mp4, avi)
 *               outputFormat:
 *                 type: string
 *                 description: The desired output format
 *               videoCodec:
 *                 type: string
 *                 description: Optional video codec
 *               audioCodec:
 *                 type: string
 *                 description: Optional audio codec
 *     responses:
 *       200:
 *         description: Media converted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 outputBuffer:
 *                   type: string
 *                   format: binary
 *                 format:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post('/convert', async (req, res) => {
  try {
    const result = await conversionService.convertMedia(req.body);
    res.json(result);
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Failed to convert media' });
  }
});

/**
 * @swagger
 * /api/conversion/extract:
 *   post:
 *     summary: Extract audio from media file
 *     description: Extracts audio from a media file
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inputBuffer
 *               - inputFormat
 *               - outputFormat
 *             properties:
 *               inputBuffer:
 *                 type: string
 *                 format: binary
 *                 description: The input media file as a base64 string
 *               inputFormat:
 *                 type: string
 *                 description: The input format (e.g., mp4, avi)
 *               outputFormat:
 *                 type: string
 *                 description: The desired audio output format (e.g., mp3, wav)
 *               audioCodec:
 *                 type: string
 *                 description: Optional audio codec
 *     responses:
 *       200:
 *         description: Audio extracted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 outputBuffer:
 *                   type: string
 *                   format: binary
 *                 format:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post('/extract', async (req, res) => {
  try {
    const result = await conversionService.extractAudio(req.body);
    res.json(result);
  } catch (error) {
    console.error('Audio extraction error:', error);
    res.status(500).json({ error: 'Failed to extract audio' });
  }
});

export default router; 