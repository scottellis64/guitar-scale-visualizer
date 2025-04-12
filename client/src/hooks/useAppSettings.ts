import { API_CONFIG } from '@guitar-app/shared';

export const useAppSettings = () => {
  const getServerUrl = () => {
    const url = new URL(API_CONFIG.SERVER.BASE_URL);
    return {
      protocol: url.protocol,
      host: url.hostname,
      port: url.port || (url.protocol === 'https:' ? '443' : '80'),
    };
  };

  const getFfmpegUrl = () => {
    const url = new URL(API_CONFIG.FFMPEG.BASE_URL);
    return {
      protocol: url.protocol,
      host: url.hostname,
      port: url.port || (url.protocol === 'https:' ? '443' : '80'),
    };
  };

  return {
    server: getServerUrl(),
    ffmpeg: getFfmpegUrl(),
  };
}; 