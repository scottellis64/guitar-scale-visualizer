import { Router, Request, Response } from 'express';
import axios from 'axios';
import { DownloadedReel } from '../models/DownloadedReel';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { Db } from 'mongodb';

const router = Router();

// Initialize GridFS bucket
const conn = mongoose.connection;
let gfsBucket: GridFSBucket;

conn.once('open', () => {
    if (!conn.db) {
        throw new Error('Database connection not established');
    }
    gfsBucket = new GridFSBucket(conn.db, {
        bucketName: 'reels'
    });
});

// List all Facebook reels with pagination
router.get('/list', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const sortBy = req.query.sortBy as string || 'uploadDate';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        const skip = (page - 1) * limit;

        // Get total count
        const total = await DownloadedReel.countDocuments();

        // Get paginated reels
        const reels = await DownloadedReel.find()
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .select('-__v'); // Exclude version field

        // Get additional metadata from GridFS
        const reelsWithMetadata = await Promise.all(
            reels.map(async (reel) => {
                const file = await gfsBucket.find({ _id: reel.gridfsId }).next();
                return {
                    ...reel.toObject(),
                    size: file?.length,
                    contentType: file?.metadata?.contentType,
                    uploadDate: file?.metadata?.uploadDate
                };
            })
        );

        res.json({
            data: reelsWithMetadata,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error listing Facebook reels:', error);
        res.status(500).json({
            error: 'Failed to list Facebook reels',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

router.post('/download', async (req: Request, res: Response) => {
    try {
        const { url, title, uploader } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const ffmpegServerUrl = `http://${process.env.FFMPEG_HOST}:${process.env.FFMPEG_PORT}`;
        
        // Get metadata first
        const metadataResponse = await axios.get(`${ffmpegServerUrl}/facebook/metadata`, {
            params: { url }
        });
        const metadata = metadataResponse.data;
        
        // Call ffmpeg server to download the reel
        const downloadResponse = await axios.post(`${ffmpegServerUrl}/facebook/download`, {
            url
        }, {
            responseType: 'arraybuffer'
        });

        // Use metadata for filename and title if not provided
        const finalTitle = title || metadata.title;
        const finalUploader = uploader || metadata.uploader;
        const filename = `${finalTitle}_${Date.now()}.mp4`;

        // Save to MongoDB GridFS
        const db = mongoose.connection.db as Db;
        const bucket = new GridFSBucket(db, {
            bucketName: 'reels'
        });

        const uploadStream = bucket.openUploadStream(filename, {
            metadata: {
                contentType: 'video/mp4',
                uploadDate: metadata.uploadDate,
                source: 'facebook',
                originalUrl: url,
                title: finalTitle,
                uploader: finalUploader,
                description: metadata.description,
                duration: metadata.duration,
                viewCount: metadata.viewCount,
                thumbnail: metadata.thumbnail
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

        // Save to MongoDB
        const downloadedReel = new DownloadedReel({
            title: finalTitle,
            uploader: finalUploader,
            description: metadata.description,
            duration: metadata.duration,
            viewCount: metadata.viewCount,
            originalUrl: url,
            filename,
            path: `reels/${videoFile._id}`,
            gridfsId: uploadStream.id,
            thumbnail: metadata.thumbnail
        });

        await downloadedReel.save();

        // Return success response with URLs
        res.status(201).json({
            id: videoFile._id.toString(),
            filename: videoFile.filename,
            title: finalTitle,
            uploader: finalUploader,
            description: metadata.description,
            duration: metadata.duration,
            viewCount: metadata.viewCount,
            contentType: videoFile.metadata?.contentType,
            uploadDate: videoFile.metadata?.uploadDate,
            size: videoFile.length,
            thumbnail: metadata.thumbnail,
            urls: {
                download: `/api/reels/${videoFile._id}`,
                stream: `/api/reels/${videoFile._id}/stream`
            }
        });

    } catch (error) {
        console.error('Error downloading Facebook reel:', error);
        if (axios.isAxiosError(error) && error.response) {
            // If the error came from ffmpeg-server, include its error details
            res.status(error.response.status).json({
                error: 'Failed to download Facebook reel',
                details: error.response.data
            });
        } else {
            res.status(500).json({
                error: 'Failed to download Facebook reel',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
});

export default router; 