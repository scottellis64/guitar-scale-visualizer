import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import crypto from 'crypto';

const execAsync = promisify(exec);
const router = Router();

// Get metadata for a Facebook reel
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
        
        // Updated command without cookies option
        const downloadOptions = `-f "best[ext=mp4]/best[ext=webm]/best" --merge-output-format mp4 --no-playlist --no-warnings --extractor-args "facebook:skip_dash_manifest" --add-header "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" -o "` + reelDownloadFileWithPath + `"`;
        
        // Execute yt-dlp command directly
        const command = `yt-dlp ${downloadOptions} "${url}"`;

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