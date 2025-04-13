import { Router, Request, Response } from 'express';
import { Db, GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';
import multer from 'multer';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// List all videos
router.get('/videos', async (_req: Request, res: Response) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const db = mongoose.connection.db as Db;
        const bucket = new GridFSBucket(db, { bucketName: 'videos' });
        const cursor = bucket.find({});
        const files = await cursor.toArray();
        
        const videos = files.map(file => ({
            id: file._id.toString(),
            filename: file.filename,
            length: file.length,
            uploadDate: file.uploadDate,
            contentType: file.metadata?.contentType
        }));

        res.json({ videos });
    } catch (error) {
        console.error('List videos error:', error);
        res.status(500).json({ error: 'Failed to list videos' });
    }
});

// Stream video by ID
router.get('/videos/:id', async (req: Request, res: Response) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const db = mongoose.connection.db as Db;
        const bucket = new GridFSBucket(db, { bucketName: 'videos' });
        const id = new mongoose.Types.ObjectId(req.params.id);

        const file = await bucket.find({ _id: id }).next();
        if (!file) {
            return res.status(404).json({ error: 'Video not found' });
        }

        res.set('Content-Type', file.metadata?.contentType || 'video/mp4');
        res.set('Content-Length', file.length.toString());
        res.set('Accept-Ranges', 'bytes');

        const downloadStream = bucket.openDownloadStream(id);
        downloadStream.pipe(res);

        downloadStream.on('error', (error) => {
            console.error('Stream error:', error);
            res.status(500).json({ error: 'Failed to stream video' });
        });
    } catch (error) {
        console.error('Stream video error:', error);
        res.status(500).json({ error: 'Failed to stream video' });
    }
});

// Upload video using GridFS
router.post('/videos', (req, res) => {
    const uploadMiddleware = upload.single('file');
    
    uploadMiddleware(req as any, res as any, async (err: any) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ error: err.message });
        }
        
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No video file uploaded' });
            }

            if (!mongoose.connection.readyState) {
                return res.status(503).json({ error: 'Database not ready' });
            }

            const db = mongoose.connection.db as Db;
            const bucket = new GridFSBucket(db, {
                bucketName: 'videos'
            });

            const uploadStream = bucket.openUploadStream(req.file.originalname, {
                metadata: {
                    contentType: req.file.mimetype,
                    uploadDate: new Date()
                }
            });

            uploadStream.end(req.file.buffer);

            uploadStream.on('finish', () => {
                res.status(201).json({ videoId: uploadStream.id.toString() });
            });

            uploadStream.on('error', (error) => {
                console.error('Upload error:', error);
                res.status(500).json({ error: 'Failed to upload video' });
            });
        } catch (error) {
            console.error('Video upload error:', error);
            res.status(500).json({ error: 'Failed to upload video' });
        }
    });
});

// Delete video
router.delete('/videos/:id', async (req: Request, res: Response) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const db = mongoose.connection.db as Db;
        const bucket = new GridFSBucket(db, { bucketName: 'videos' });
        const id = new mongoose.Types.ObjectId(req.params.id);

        const file = await bucket.find({ _id: id }).next();
        if (!file) {
            return res.status(404).json({ error: 'Video not found' });
        }

        await bucket.delete(id);
        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Delete video error:', error);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});

// Track conversion progress
interface ConversionProgress {
    videoId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    error?: string;
    audioId?: string;
}

const conversionProgress = new Map<string, ConversionProgress>();

// Convert video to MP3 and save to audio bucket
router.post('/videos/:id/convert', async (req: Request, res: Response) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const db = mongoose.connection.db as Db;
        const videoBucket = new GridFSBucket(db, { bucketName: 'videos' });
        const audioBucket = new GridFSBucket(db, { bucketName: 'audio' });
        const id = new mongoose.Types.ObjectId(req.params.id);

        // Get the video file
        const videoFile = await videoBucket.find({ _id: id }).next();
        if (!videoFile) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Get conversion options from query
        const bitrate = parseInt(req.body.bitrate as string) || 192;
        const saveToBucket = req.body.save === 'true';
        const title = req.body.title as string || videoFile.filename.replace(/\.[^/.]+$/, '');
        const artist = req.body.artist as string || 'Unknown';

        // Initialize progress tracking
        const progressId = id.toString();
        conversionProgress.set(progressId, {
            videoId: progressId,
            status: 'processing',
            progress: 0
        });

        // Create a temporary file for the video
        const tempVideoPath = `/tmp/${id.toString()}_input.mp4`;
        const writeStream = fs.createWriteStream(tempVideoPath);
        const videoStream = videoBucket.openDownloadStream(id);
        videoStream.pipe(writeStream);

        // Wait for the video to be written to disk
        await new Promise<void>((resolve, reject) => {
            writeStream.on('finish', () => resolve());
            writeStream.on('error', reject);
        });

        // Create form data for the ffmpeg server
        const formData = new FormData();
        formData.append('file', fs.createReadStream(tempVideoPath), {
            filename: videoFile.filename,
            contentType: videoFile.contentType
        });

        // Call ffmpeg server for conversion
        const ffmpegResponse = await axios.post('http://localhost:8080/convert', formData, {
            headers: formData.getHeaders(),
            responseType: 'arraybuffer'
        });

        // Clean up temporary video file
        fs.unlinkSync(tempVideoPath);

        if (saveToBucket) {
            // Save to audio bucket
            const uploadStream = audioBucket.openUploadStream(`${title}.mp3`, {
                metadata: {
                    contentType: 'audio/mpeg',
                    uploadDate: new Date(),
                    title,
                    artist,
                    sourceVideoId: id.toString()
                }
            });

            // Write the converted audio to GridFS
            uploadStream.end(Buffer.from(ffmpegResponse.data));

            // Wait for upload to complete
            await new Promise<void>((resolve, reject) => {
                uploadStream.on('finish', () => resolve());
                uploadStream.on('error', reject);
            });

            // Get the audio file info
            const audioFile = await audioBucket.find({ _id: uploadStream.id }).next();
            if (!audioFile) {
                throw new Error('Failed to retrieve audio file after upload');
            }

            // Update progress
            const currentProgress = conversionProgress.get(progressId);
            if (currentProgress) {
                currentProgress.status = 'completed';
                currentProgress.audioId = uploadStream.id.toString();
            }

            res.status(200).json({
                id: audioFile._id.toString(),
                filename: audioFile.filename,
                contentType: audioFile.metadata?.contentType,
                uploadDate: audioFile.metadata?.uploadDate,
                title: audioFile.metadata?.title,
                artist: audioFile.metadata?.artist,
                size: audioFile.length
            });
        } else {
            // Stream directly to client
            res.set('Content-Type', 'audio/mpeg');
            res.set('Accept-Ranges', 'bytes');
            res.send(Buffer.from(ffmpegResponse.data));
        }

    } catch (error) {
        console.error('Video conversion error:', error);
        const currentProgress = conversionProgress.get(req.params.id);
        if (currentProgress) {
            currentProgress.status = 'failed';
            currentProgress.error = error instanceof Error ? error.message : 'Unknown error';
        }
        res.status(500).json({ error: 'Failed to convert video to audio' });
    }
});

// Get conversion status
router.get('/conversions/:id', (req: Request, res: Response) => {
    const progress = conversionProgress.get(req.params.id);
    if (!progress) {
        return res.status(404).json({ error: 'Conversion not found' });
    }
    res.json(progress);
});

// Stream converted audio
router.get('/conversions/:id/audio', async (req: Request, res: Response) => {
    try {
        const progress = conversionProgress.get(req.params.id);
        if (!progress || progress.status !== 'completed' || !progress.audioId) {
            return res.status(404).json({ error: 'Audio not available' });
        }

        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const db = mongoose.connection.db as Db;
        const audioBucket = new GridFSBucket(db, { bucketName: 'audio' });
        const id = new mongoose.Types.ObjectId(progress.audioId);

        const file = await audioBucket.find({ _id: id }).next();
        if (!file) {
            return res.status(404).json({ error: 'Audio file not found' });
        }

        res.set('Content-Type', 'audio/mpeg');
        res.set('Accept-Ranges', 'bytes');

        const downloadStream = audioBucket.openDownloadStream(id);
        downloadStream.pipe(res);

        downloadStream.on('error', (error) => {
            console.error('Stream error:', error);
            res.status(500).json({ error: 'Failed to stream audio' });
        });

    } catch (error) {
        console.error('Audio stream error:', error);
        res.status(500).json({ error: 'Failed to stream audio' });
    }
});

// Download YouTube video and save to MongoDB
router.post('/youtube', async (req: Request, res: Response) => {
    try {
        const { url, quality = 'best', title, description } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'YouTube URL is required' });
        }

        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        // Download video from ffmpeg-server
        const downloadResponse = await axios.post(`${process.env.FFMPEG_SERVER_URL}/youtube/download`, {
            url,
            quality
        }, {
            responseType: 'arraybuffer'
        });

        // Generate a filename if not provided
        const filename = title ? `${title}.mp4` : `youtube_${Date.now()}.mp4`;

        // Save to MongoDB GridFS
        const db = mongoose.connection.db as Db;
        const bucket = new GridFSBucket(db, {
            bucketName: 'videos'
        });

        const uploadStream = bucket.openUploadStream(filename, {
            metadata: {
                contentType: 'video/mp4',
                uploadDate: new Date(),
                source: 'youtube',
                originalUrl: url,
                quality,
                description
            }
        });

        // Write the video to GridFS
        uploadStream.end(Buffer.from(downloadResponse.data));

        // Wait for upload to complete
        await new Promise<void>((resolve, reject) => {
            uploadStream.on('finish', () => resolve());
            uploadStream.on('error', reject);
        });

        // Get the video file info
        const videoFile = await bucket.find({ _id: uploadStream.id }).next();
        if (!videoFile) {
            throw new Error('Failed to retrieve video file after upload');
        }

        // Return success response with URLs
        res.status(201).json({
            id: videoFile._id.toString(),
            filename: videoFile.filename,
            contentType: videoFile.metadata?.contentType,
            uploadDate: videoFile.metadata?.uploadDate,
            size: videoFile.length,
            urls: {
                download: `/api/videos/${videoFile._id}`,
                stream: `/api/videos/${videoFile._id}/stream`
            }
        });

    } catch (error) {
        console.error('YouTube download error:', error);
        if (axios.isAxiosError(error) && error.response) {
            // If the error came from ffmpeg-server, include its error details
            res.status(error.response.status).json({
                error: 'Failed to download YouTube video',
                details: error.response.data
            });
        } else {
            res.status(500).json({
                error: 'Failed to download YouTube video',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
});

export default router; 