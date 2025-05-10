import { Router, Response } from 'express';
import multer from 'multer';
import axios from 'axios';
import { saveMedia, getMedia, deleteMedia, listMedia, createOperation, updateOperationStatus, getOperation } from '../db';
import { config } from '../config';
import { BUCKETS, OPERATION_STATUS } from '../utils';
import { authenticateJWT, AuthenticatedRequest } from '../middleware';
import { RequestHandler } from 'express';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Apply authentication middleware to all routes
router.use(authenticateJWT as RequestHandler);

// Define interfaces for request parameters and bodies
interface GetVideoParams {
  id: string;
}

interface DeleteVideoParams {
  id: string;
}

interface OperationParams {
  operationId: string;
}

interface UploadVideoBody {
  title?: string;
  description?: string;
}

interface DownloadYouTubeBody {
  url: string;
  quality?: string;
  title?: string;
  description?: string;
}

// List all videos
const handleListVideos = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id || 'anonymous';
    const videos = await listMedia(BUCKETS.VIDEO, userId);
    res.json(videos);
  } catch (error) {
    console.error('List videos error:', error);
    res.status(500).json({ error: 'Failed to list videos' });
  }
};

// Get a specific video
const handleGetVideo = async (
  req: AuthenticatedRequest<GetVideoParams>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'anonymous';
    const video = await getMedia(id, BUCKETS.VIDEO);
    
    if (!video) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }
    
    res.json(video);
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Failed to get video' });
  }
};

// Upload a video
const handleUploadVideo = async (
  req: AuthenticatedRequest<{}, any, UploadVideoBody>,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const userId = req.user?.id || 'anonymous';
    const { title, description } = req.body;
    
    const video = await saveMedia(
      req.file,
      userId,
      { title, description },
      BUCKETS.VIDEO
    );
    
    res.status(201).json(video);
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
};

// Delete a video
const handleDeleteVideo = async (
  req: AuthenticatedRequest<DeleteVideoParams>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'anonymous';
    
    await deleteMedia(id, BUCKETS.VIDEO);
    res.status(204).send();
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};

// Download from YouTube
const handleYouTubeDownload = async (
  req: AuthenticatedRequest<{}, any, DownloadYouTubeBody>,
  res: Response
): Promise<void> => {
  try {
    const { url, quality, title, description } = req.body;
    
    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    const userId = req.user?.id || 'anonymous';

    // Create an operation to track the download
    const operationId = await createOperation(
      userId,
      'youtube_download',
      {
        url,
        quality,
        title,
        description
      }
    );

    // Start the download process
    // This should be handled by a background worker in production
    axios.post(`${config.service.config.ffmpeg.host}:${config.service.config.ffmpeg.port}/youtube/download`, {
      operationId,
      url,
      quality,
      title,
      description,
      userId
    }).catch(error => {
      console.error('Failed to start download:', error);
      updateOperationStatus(operationId, OPERATION_STATUS.FAILED, { error: error.message });
    });

    res.status(202).json({ operationId });
  } catch (error) {
    console.error('YouTube download error:', error);
    res.status(500).json({ error: 'Failed to start YouTube download' });
  }
};

// Add endpoint to check operation status
const handleCheckOperationStatus = async (
  req: AuthenticatedRequest<OperationParams>,
  res: Response
): Promise<void> => {
  try {
    const { operationId } = req.params;
    const operation = await getOperation(operationId);
    
    if (!operation) {
      res.status(404).json({ error: 'Operation not found' });
      return;
    }
    
    res.json(operation);
  } catch (error) {
    console.error('Check operation status error:', error);
    res.status(500).json({ error: 'Failed to check operation status' });
  }
};

// Register routes
router.get('/', handleListVideos);
router.get('/:id', handleGetVideo);
router.post('/', upload.single('video'), handleUploadVideo);
router.delete('/:id', handleDeleteVideo);
router.post('/youtube/download', handleYouTubeDownload);
router.get('/operations/:operationId', handleCheckOperationStatus);

export default router; 