import { Router } from 'express';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = Router();

router.post('/convert', (req, res) => {
    const { file } = req.body;
    res.contentType('audio/mp3');
    res.attachment('myfile.mp3');

    const convertFileFQPN: string = `/app/data/inbound/${file}`;
    
    ffmpeg(convertFileFQPN)
        .toFormat('mp3')
        .on('end', () => {
            console.log('Audio conversion completed successfully');
        })
        .on('error', (err: Error) => {
            console.error('Error during audio conversion:', err.message);
        })
        .pipe(res, { end: true });
});

router.get('/files', async (_req, res) => {
    const inboundDir = '/app/data/inbound';
    try {
        const files = await fs.readdir(inboundDir);
        res.json({ files });
    } catch (err) {
        console.error('Error reading directory:', err);
        res.status(500).json({ error: 'Failed to read directory' });
    }
});

router.get('/ffmpeg', async (_req, res) => {
    try {
        // Execute a simple ffmpeg command to get version info
        const { stdout } = await execAsync('ffmpeg -version');
        res.json({
            success: true,
            message: 'FFmpeg is accessible',
            version: stdout.split('\n')[0] // Get the first line which contains version info
        });
    } catch (err: any) {
        console.error('Error testing ffmpeg:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to access ffmpeg',
            details: err.message
        });
    }
});

router.post('/half-speed', async (req, res) => {
    const { file } = req.body;
    
    if (!file) {
        return res.status(400).json({ error: 'File name is required' });
    }

    const inputFile: string = `/app/data/inbound/${file}`;
    res.contentType('audio/mp3');
    res.attachment('half-speed.mp3');

    try {
        // Check if file exists
        await fs.access(inputFile);
        
        ffmpeg(inputFile)
            .audioFilters('atempo=0.5') // Set playback speed to 0.5x while maintaining pitch
            .toFormat('mp3')
            .on('end', () => {
                console.log('Half-speed conversion completed successfully');
            })
            .on('error', (err: Error) => {
                console.error('Error during half-speed conversion:', err.message);
                res.status(500).json({ error: 'Conversion failed', details: err.message });
            })
            .pipe(res, { end: true });
    } catch (err: any) {
        console.error('Error accessing file:', err);
        res.status(404).json({ error: 'File not found', details: err.message });
    }
});

export default router; 