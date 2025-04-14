import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import crypto from 'crypto';

const execAsync = promisify(exec);
const router = Router();

router.post('/download', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const downloadsDir = '/app/data/downloads';

        const timestamp = Date.now();
        const randomString = crypto.randomBytes(4).toString('hex');
        const reelDownloadFile = `reel_${timestamp}_${randomString}.mp4`;
        const reelDownloadFileWithPath = `${downloadsDir}/${reelDownloadFile}`;
        const downloadOptions = `-f "worst[ext=mp4]" --merge-output-format mp4 --no-playlist --no-warnings -o "` + reelDownloadFileWithPath + `"`;
        
        // Execute yt-dlp command to download the Facebook Reel with specific format options
        const command = `docker exec yt-dlp yt-dlp ${downloadOptions} "${url}"`;

        try {
            await execAsync(command);
        } catch (execError: any) {
            // Clean up any partial download
            try {
                await fs.promises.unlink(reelDownloadFileWithPath);
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
        const videoBuffer = await fs.promises.readFile(reelDownloadFileWithPath);

        // Clean up
        await fs.promises.unlink(reelDownloadFileWithPath);

        // Send the video
        res.set('Content-Type', 'video/mp4');
        res.send(videoBuffer);

    } catch (error) {
        console.error('Error in Facebook download route:', error);
        res.status(500).json({ 
            error: 'Failed to download video',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

export default router; 