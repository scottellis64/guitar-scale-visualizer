import { Router, Request, Response } from 'express';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import multer from 'multer';
import { PassThrough, Readable } from 'stream';

const execAsync = promisify(exec);
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Define a custom request type
type CustomRequest = Request & {
    file?: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
    };
};

// Handle file upload and conversion
const uploadMiddleware = upload.single('file');

router.post('/convert', (req: CustomRequest, res: Response) => {
    uploadMiddleware(req as any, res as any, async (err: any) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            // Create temporary file paths
            const tempInputPath = `/app/data/tmp/${Date.now()}_input.mp4`;
            const tempOutputPath = `/app/data/tmp/${Date.now()}_output.mp3`;

            // Ensure the directory exists
            await fs.mkdir('/app/data/tmp', { recursive: true });

            // Write input file
            await fs.writeFile(tempInputPath, req.file.buffer);

            // Verify the file was written correctly
            const stats = await fs.stat(tempInputPath);
            if (stats.size === 0) {
                throw new Error('Input file is empty');
            }

            // Set response headers
            res.set('Content-Type', 'audio/mpeg');
            res.set('Accept-Ranges', 'bytes');

            // Process the video with ffmpeg
            ffmpeg(tempInputPath)
                .noVideo()
                .audioCodec('libmp3lame')
                .audioBitrate(192)
                .format('mp3')
                .output(tempOutputPath)
                .on('start', (commandLine) => {
                    console.log('Started FFmpeg with command:', commandLine);
                })
                .on('progress', (progress) => {
                    console.log('Processing: ', progress.percent, '% done');
                })
                .on('end', async () => {
                    console.log('FFmpeg processing finished');
                    try {
                        // Verify output file exists and has content
                        const outputStats = await fs.stat(tempOutputPath);
                        if (outputStats.size === 0) {
                            throw new Error('Output file is empty');
                        }

                        // Read and stream the output file
                        const outputBuffer = await fs.readFile(tempOutputPath);
                        res.send(outputBuffer);
                        
                        // Clean up temporary files
                        await fs.unlink(tempInputPath);
                        await fs.unlink(tempOutputPath);
                    } catch (error) {
                        console.error('Error handling output file:', error);
                        res.status(500).json({ error: 'Failed to process output file' });
                    }
                })
                .on('error', async (err) => {
                    console.error('FFmpeg conversion error:', err);
                    try {
                        // Clean up temporary files
                        await fs.unlink(tempInputPath);
                        await fs.unlink(tempOutputPath).catch(() => {});
                    } catch (error) {
                        console.error('Error cleaning up temp files:', error);
                    }
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Failed to convert video to audio' });
                    }
                })
                .run();

            // Handle client disconnect
            req.on('close', async () => {
                try {
                    // Clean up temporary files
                    await fs.unlink(tempInputPath);
                    await fs.unlink(tempOutputPath).catch(() => {});
                } catch (error) {
                    console.error('Error cleaning up temp files:', error);
                }
            });

        } catch (error) {
            console.error('Video conversion error:', error);
            res.status(500).json({ error: 'Failed to convert video to audio' });
        }
    });
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