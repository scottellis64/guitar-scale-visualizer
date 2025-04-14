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

router.post('/download', async (req: Request, res: Response) => {
    try {
        const { url, title } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const ffmpegServerUrl = process.env.FFMPEG_SERVER_URL || 'http://localhost:8080';
        
        // Call ffmpeg server to download the reel
        const downloadResponse = await axios.post(`${ffmpegServerUrl}/facebook/download`, {
            url
        }, {
            responseType: 'arraybuffer'
        });

        // Generate a filename if not provided
        const filename = title ? `${title}.mp4` : `facebook_${Date.now()}.mp4`;

        // Save to MongoDB GridFS
        const db = mongoose.connection.db as Db;
        const bucket = new GridFSBucket(db, {
            bucketName: 'reels'
        });

        const uploadStream = bucket.openUploadStream(filename, {
            metadata: {
                contentType: 'video/mp4',
                uploadDate: new Date(),
                source: 'facebook',
                originalUrl: url,
                title: title || 'Untitled Reel'
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
            title: title || 'Untitled Reel',
            originalUrl: url,
            filename,
            path: `reels/${videoFile._id}`,
            gridfsId: uploadStream.id
        });

        await downloadedReel.save();

        // Return success response with URLs
        res.status(201).json({
            id: videoFile._id.toString(),
            filename: videoFile.filename,
            contentType: videoFile.metadata?.contentType,
            uploadDate: videoFile.metadata?.uploadDate,
            size: videoFile.length,
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