import { Router, RequestHandler } from 'express';
import { createFacebookService } from '../factory';
import { v4 as uuidv4 } from 'uuid';

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
const metadataHandler: RequestHandler = async (req, res): Promise<void> => {
    try {
        const { url } = req.query;
        
        if (!url) {
            res.status(400).json({ error: 'URL is required' });
            return;
        }

        const metadata = await facebookService.getMetadata(url as string);
        res.json(metadata);
    } catch (error) {
        console.error('Error getting reel metadata:', error);
        res.status(500).json({ 
            error: 'Failed to get reel metadata',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};

router.get('/metadata', metadataHandler);

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
 *       500:
 *         description: Server error
 */
router.post('/download', async (req, res) => {
    try {
        const operationId = uuidv4();
        const result = await facebookService.downloadVideo({
            ...req.body,
            operationId
        });
        res.json({
            operationId,
            status: 'PROCESSING',
            s3File: result.s3File
        });
    } catch (error) {
        console.error('Facebook download error:', error);
        res.status(500).json({ error: 'Failed to download Facebook video' });
    }
});

export default router; 