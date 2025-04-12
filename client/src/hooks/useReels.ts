import { useState, useEffect } from 'react';
import { FacebookReel, ApiResponse } from '@guitar-app/shared';
import { API_CONFIG } from 'src/config';
export const useReels = () => {
  const [reels, setReels] = useState<FacebookReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReels = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.SERVER.BASE_URL}/reels`);
      if (!response.ok) throw new Error('Failed to fetch reels');
      const data: ApiResponse<FacebookReel[]> = await response.json();
      setReels(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadReel = async (url: string, title?: string) => {
    try {
      const response = await fetch(`${API_CONFIG.SERVER.BASE_URL}/reels/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title })
      });
      if (!response.ok) throw new Error('Failed to download reel');
      const data: ApiResponse<FacebookReel> = await response.json();
      setReels(prev => [...prev, data.data]);
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download reel');
      throw err;
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  return {
    reels,
    loading,
    error,
    refetch: fetchReels,
    downloadReel
  };
}; 