import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createFacebookService } from '../factory';

const execAsync = promisify(exec);
const router = Router();
const facebookService = createFacebookService();

/**
 * @swagger
 * /api/facebook/metadata:
 *   get:
 *     summary: Get metadata for a Facebook reel
 *     description: Retrieves metadata information for a Facebook reel URL
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: The Facebook reel URL
 *     responses:
 *       200:
 *         description: Metadata retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *                 uploadDate:
 *                   type: string
 *                   format: date-time
 *                 thumbnail:
 *                   type: string
 *       400:
 *         description: URL is required
 *       500:
 *         description: Server error
 */
router.get('/metadata', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const command = `yt-dlp --dump-json --no-download "${url}"`;
        const { stdout } = await execAsync(command);
        const metadata = JSON.parse(stdout);
        
        res.json({
            title: metadata.title || 'Untitled Reel',
            uploader: metadata.uploader || 'Unknown',
            description: metadata.description || '',
            duration: metadata.duration || 0,
            viewCount: metadata.view_count || 0,
            uploadDate: metadata.upload_date ? new Date(metadata.upload_date) : new Date(),
            thumbnail: metadata.thumbnail || ''
        });
    } catch (error) {
        console.error('Error getting reel metadata:', error);
        res.status(500).json({ 
            error: 'Failed to get reel metadata',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

/**
 * @swagger
 * /api/facebook/download:
 *   post:
 *     summary: Download a Facebook video
 *     description: Downloads a video from Facebook and processes it
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
 *                 description: The Facebook video URL
 *               title:
 *                 type: string
 *                 description: Optional title for the video
 *               uploader:
 *                 type: string
 *                 description: Optional uploader name
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
 *       500:
 *         description: Server error
 */
router.post('/download', async (req, res) => {
    try {
        const result = await facebookService.downloadVideo(req.body);
        res.json(result);
    } catch (error) {
        console.error('Facebook download error:', error);
        res.status(500).json({ error: 'Failed to download Facebook video' });
    }
});

export default router; 