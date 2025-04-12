import { useState, useEffect } from 'react';

import { Scale } from 'types';

import { API_CONFIG } from 'src/config';

const API_BASE_URL = API_CONFIG.SERVER.BASE_URL;

export const useServerApi = () => {
  const [scales, setScales] = useState<Scale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScales = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/scales`);
      if (!response.ok) {
        throw new Error('Failed to fetch scales');
      }
      const data = await response.json();
      setScales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScales();
  }, []);

  return {
    scales,
    loading,
    error,
    refetch: fetchScales
  };
}; 