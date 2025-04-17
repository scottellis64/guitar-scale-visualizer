// Load environment variables
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const ffmpegBaseUrl = import.meta.env.VITE_FFMPEG_BASE_URL
const consulHost = import.meta.env.VITE_CONSUL_HOST
const consulPort = import.meta.env.VITE_CONSUL_PORT

export const API_CONFIG = {
  SERVER: {
    BASE_URL: apiBaseUrl || `http://${consulHost}:${consulPort}`,
    ENDPOINTS: {
      API: '/api',
      APP: '/api/app',
      FACEBOOK: '/api/fb',
      YOUTUBE: '/api/videos/youtube',
      REELS: '/api/reels',
      AUDIO: '/api/audio',
      VIDEOS: '/api/videos'
    }
  },
  
  // FFmpeg server API
  FFMPEG: {
    BASE_URL: ffmpegBaseUrl || `http://${consulHost}:${consulPort}`,
    ENDPOINTS: {
      HEALTH: '/ping',
      CONVERSIONS: '/convert',
      YOUTUBE: '/youtube/download',
      FACEBOOK: '/facebook/download'
    }
  }
} as const;

export type ApiConfig = typeof API_CONFIG; 