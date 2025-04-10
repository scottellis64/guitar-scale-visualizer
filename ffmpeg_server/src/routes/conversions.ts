import { Router } from 'express';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';

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

export default router; 