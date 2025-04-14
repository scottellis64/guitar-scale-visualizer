import { useState, useEffect } from 'react';
import { API_CONFIG } from 'src/config';
import { Video } from '@guitar-app/shared';

export const useVideoApi = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_CONFIG.SERVER.BASE_URL}${API_CONFIG.SERVER.ENDPOINTS.VIDEOS}/videos`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data.videos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch videos');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const convertVideo = async (file: File, format: string) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', format);

      const response = await fetch(
        `${API_CONFIG.FFMPEG.BASE_URL}${API_CONFIG.FFMPEG.ENDPOINTS.CONVERSIONS}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to convert video file');
      }

      const blob = await response.blob();
      return blob;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during video conversion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return {
    videos,
    loading,
    error,
    fetchVideos,
    convertVideo,
  };
}; 