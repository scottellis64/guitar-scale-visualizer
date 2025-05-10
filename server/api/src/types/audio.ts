export interface AudioDownloadRequest {
  url: string;
  format: 'mp3' | 'wav' | 'ogg' | 'm4a';
}

export interface AudioConversionRequest {
  format: 'mp3' | 'wav' | 'ogg' | 'm4a';
}

export interface AudioExtractionRequest {
  // No additional properties needed for extraction
}

export interface Task {
  id: string;
  type: 'convert' | 'download' | 'extract';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  input: any;
  output: any;
  error: string | null;
  progress?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueueItem {
  taskId: string;
  type: 'convert' | 'download' | 'extract';
  payload: any;
}

export interface QueueMessage {
  taskId: string;
  type: 'convert' | 'download' | 'extract';
  params: {
    format?: string;
    fileName?: string;
    url?: string;
  };
  payload: {
    file?: Express.Multer.File;
    format?: string;
    url?: string;
  };
} 