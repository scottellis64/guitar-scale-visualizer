// Environment configuration
const ENV = {
  API_BASE_URL: 'http://localhost:3001',
  FFMPEG_BASE_URL: 'http://localhost:8080'
};

export const API_CONFIG = {
  // Main server API
  SERVER: {
    BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
    ENDPOINTS: {
      API: '/api',
      APP: '/api/app',
      FACEBOOK: '/api/fb'
    }
  },
  
  // FFmpeg server API
  FFMPEG: {
    BASE_URL: process.env.REACT_APP_FFMPEG_BASE_URL || 'http://localhost:8080',
    ENDPOINTS: {
      HEALTH: '/ping',
      CONVERSIONS: '/convert'
    }
  }
} as const;

export type ApiConfig = typeof API_CONFIG; 