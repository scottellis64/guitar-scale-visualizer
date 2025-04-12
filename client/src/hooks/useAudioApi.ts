import { useState, useEffect } from 'react';
import { API_CONFIG } from 'src/config';
import { Audio } from '@guitar-app/shared';

export const useAudioApi = () => {
  const [audioFiles, setAudioFiles] = useState<Audio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAudioFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_CONFIG.SERVER.BASE_URL}${API_CONFIG.SERVER.ENDPOINTS.APP}/audio`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch audio files');
      }

      const data = await response.json();
      setAudioFiles(data.audioFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const convertAudio = async (file: File, format: string) => {
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
        throw new Error('Failed to convert audio file');
      }

      const blob = await response.blob();
      return blob;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during audio conversion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudioFiles();
  }, []);

  return {
    audioFiles,
    loading,
    error,
    fetchAudioFiles,
    convertAudio,
  };
}; 