import { Router, Request, Response } from 'express';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = Router();

// Quality presets for different video sizes
const QUALITY_PRESETS = {
    'low': 'worst[ext=mp4]',
    'medium': 'best[height<=720][ext=mp4]',
    'high': 'best[height<=1080][ext=mp4]',
    'best': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
} as const;

type QualityOption = keyof typeof QUALITY_PRESETS;

router.post('/download', async (req: Request, res: Response) => {
    try {
        const { url, quality = 'best' } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'YouTube URL is required' });
        }

        // Validate quality option
        if (!(quality in QUALITY_PRESETS)) {
            return res.status(400).json({ 
                error: 'Invalid quality option',
                details: `Quality must be one of: ${Object.keys(QUALITY_PRESETS).join(', ')}`
            });
        }

        // Create a temporary filename
        const tempFilename = `video_${Date.now()}.mp4`;
        const outputPath = `/app/data/youtube/${tempFilename}`;

        try {
            // Execute yt-dlp command in the container with selected quality
            const formatOption = QUALITY_PRESETS[quality as QualityOption];
            await execAsync(`docker exec yt-dlp yt-dlp -f "${formatOption}" --merge-output-format mp4 --no-playlist -o "${outputPath}" "${url}"`);
        } catch (execError: any) {
            // Clean up any partial download
            try {
                await fs.unlink(outputPath);
            } catch (unlinkError) {
                console.error('Error cleaning up partial download:', unlinkError);
            }
            
            // Include stderr in the error response
            return res.status(500).json({ 
                error: 'Failed to download video',
                details: execError.stderr || execError.message
            });
        }

        // Read the downloaded file
        const videoBuffer = await fs.readFile(outputPath);

        // Clean up
        await fs.unlink(outputPath);

        // Send the video
        res.set('Content-Type', 'video/mp4');
        res.send(videoBuffer);

    } catch (error) {
        console.error('YouTube download error:', error);
        res.status(500).json({ 
            error: 'Failed to download video',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

export default router; 