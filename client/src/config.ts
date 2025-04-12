// Load environment variables
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const ffmpegBaseUrl = import.meta.env.VITE_FFMPEG_BASE_URL

export const API_CONFIG = {
  SERVER: {
    BASE_URL: apiBaseUrl || 'http://localhost:3001',
    ENDPOINTS: {
      API: '/api',
      APP: '/api/app',
      FACEBOOK: '/api/fb'
    }
  },
  
  // FFmpeg server API
  FFMPEG: {
    BASE_URL: ffmpegBaseUrl || 'http://localhost:8080',
    ENDPOINTS: {
      HEALTH: '/ping',
      CONVERSIONS: '/convert'
    }
  }
} as const;

export type ApiConfig = typeof API_CONFIG; 