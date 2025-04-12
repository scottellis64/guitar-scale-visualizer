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

export interface Audio {
  id: string;
  filename: string;
  length: number;
  uploadDate: string;
  contentType?: string;
  duration: number;
  title: string;
  artist: string;
} 

export interface Video {
  id: string;
  filename: string;
  length: number;
  uploadDate: string;
  contentType?: string;
} 
