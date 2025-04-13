export interface FacebookReel {
    id: string;
    title: string;
    url: string;
    downloaded: boolean;
    createdAt: string;
}

export interface DownloadReelRequest {
    url: string;
    title?: string;
} 