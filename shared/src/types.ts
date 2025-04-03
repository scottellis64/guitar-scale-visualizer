export interface Scale {
  id: string;
  name: string;
  intervals: number[];
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface FacebookReel {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  downloaded: boolean;
  downloadPath?: string;
  createdAt: string;
}

export interface DownloadReelRequest {
  url: string;
  title?: string;
}

export const API_BASE_URL = 'http://localhost:3001/api'; 