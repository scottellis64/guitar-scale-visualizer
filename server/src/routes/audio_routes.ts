import { Router, Request, Response } from 'express';
import { Db, GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get audio file information
router.get('/info/:id', async (req: Request, res: Response) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const db = mongoose.connection.db as Db;
        const bucket = new GridFSBucket(db, { bucketName: 'audio' });
        const id = new mongoose.Types.ObjectId(req.params.id);

        const file = await bucket.find({ _id: id }).next();
        if (!file) {
            return res.status(404).json({ error: 'Audio file not found' });
        }

        res.json({
            id: file._id.toString(),
            filename: file.filename,
            contentType: file.metadata?.contentType,
            uploadDate: file.metadata?.uploadDate,
            title: file.metadata?.title,
            artist: file.metadata?.artist,
            duration: file.metadata?.duration,
            size: file.length
        });
    } catch (error) {
        console.error('Audio info error:', error);
        res.status(500).json({ error: 'Failed to get audio information' });
    }
});

// Get audio content directly
router.get('/:id', async (req: Request, res: Response) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const db = mongoose.connection.db as Db;
        const bucket = new GridFSBucket(db, { bucketName: 'audio' });
        const id = new mongoose.Types.ObjectId(req.params.id);

        const file = await bucket.find({ _id: id }).next();
        if (!file) {
            return res.status(404).json({ error: 'Audio file not found' });
        }

        res.set('Content-Type', file.metadata?.contentType || 'audio/mpeg');
        res.set('Content-Length', file.length.toString());
        res.set('Accept-Ranges', 'bytes');

        const downloadStream = bucket.openDownloadStream(id);
        downloadStream.pipe(res);

        downloadStream.on('error', (error) => {
            console.error('Stream error:', error);
            res.status(500).json({ error: 'Failed to stream audio' });
        });
    } catch (error) {
        console.error('Audio download error:', error);
        res.status(500).json({ error: 'Failed to download audio file' });
    }
});

// Stream audio with speed control
router.get('/stream/:id', async (req: Request, res: Response) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const db = mongoose.connection.db as Db;
        const bucket = new GridFSBucket(db, { bucketName: 'audio' });
        const id = new mongoose.Types.ObjectId(req.params.id);

        const file = await bucket.find({ _id: id }).next();
        if (!file) {
            return res.status(404).json({ error: 'Audio file not found' });
        }

        const speed = parseFloat(req.query.speed as string) || 1.0;
        const passThrough = new PassThrough();

        res.set('Content-Type', 'audio/mpeg');
        res.set('Accept-Ranges', 'bytes');

        const downloadStream = bucket.openDownloadStream(id);

        ffmpeg(downloadStream)
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
});

// List all audio files
router.get('/', async (_req: Request, res: Response) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const db = mongoose.connection.db as Db;
        const bucket = new GridFSBucket(db, { bucketName: 'audio' });
        const cursor = bucket.find({});
        const files = await cursor.toArray();
        
        const audioFiles = files.map(file => ({
            id: file._id.toString(),
            filename: file.filename,
            length: file.length,
            uploadDate: file.uploadDate,
            contentType: file.metadata?.contentType,
            duration: file.metadata?.duration,
            title: file.metadata?.title,
            artist: file.metadata?.artist
        }));

        res.json({ audioFiles });
    } catch (error) {
        console.error('List audio error:', error);
        res.status(500).json({ error: 'Failed to list audio files' });
    }
});

// Upload audio file
router.post('/', (req: any, res: any) => {
    const uploadMiddleware = upload.single('file');
    
    uploadMiddleware(req as any, res as any, async (err: any) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ error: err.message });
        }
        
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No audio file uploaded' });
            }

            if (!mongoose.connection.readyState) {
                return res.status(503).json({ error: 'Database not ready' });
            }

            const db = mongoose.connection.db as Db;
            const bucket = new GridFSBucket(db, {
                bucketName: 'audio'
            });

            const { title, artist } = req.body;

            const getDuration = new Promise<number>((resolve, reject) => {
                ffmpeg.ffprobe(req.file.buffer, (err, metadata) => {
                    if (err) {
                        console.error('FFprobe error:', err);
                        resolve(0);
                    } else {
                        resolve(metadata.format.duration || 0);
                    }
                });
            });

            const duration = await getDuration;

            const uploadStream = bucket.openUploadStream(req.file.originalname, {
                metadata: {
                    contentType: req.file.mimetype,
                    uploadDate: new Date(),
                    duration,
                    title: title || req.file.originalname,
                    artist: artist || 'Unknown'
                }
            });

            uploadStream.end(req.file.buffer);

            uploadStream.on('finish', () => {
                res.status(201).json({ 
                    audioId: uploadStream.id.toString(),
                    filename: req.file.originalname,
                    duration,
                    title: title || req.file.originalname,
                    artist: artist || 'Unknown'
                });
            });

            uploadStream.on('error', (error) => {
                console.error('Audio upload error:', error);
                res.status(500).json({ error: 'Failed to upload audio file' });
            });
        } catch (error) {
            console.error('Audio upload error:', error);
            res.status(500).json({ error: 'Failed to upload audio file' });
        }
    });
});

// Delete audio
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const db = mongoose.connection.db as Db;
        const bucket = new GridFSBucket(db, { bucketName: 'audio' });
        const id = new mongoose.Types.ObjectId(req.params.id);

        const file = await bucket.find({ _id: id }).next();
        if (!file) {
            return res.status(404).json({ error: 'Audio file not found' });
        }

        await bucket.delete(id);
        res.status(200).json({ message: 'Audio file deleted successfully' });
    } catch (error) {
        console.error('Delete audio error:', error);
        res.status(500).json({ error: 'Failed to delete audio file' });
    }
});

export default router; 