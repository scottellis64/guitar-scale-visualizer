import React, { useEffect, useRef } from 'react';
import { useAppSettings } from 'hooks';

import { API_CONFIG } from 'src/config';

interface VideoPlayerProps {
    videoId: string | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { server } = useAppSettings();

    useEffect(() => {
        if (videoId && videoRef.current) {
            const videoUrl = `${API_CONFIG.SERVER.BASE_URL}${API_CONFIG.SERVER.ENDPOINTS.APP}/videos/${videoId}`;
            videoRef.current.src = videoUrl;
            videoRef.current.load();
        }
    }, [videoId, server]);

    if (!videoId) {
        return <div>Select a video to play</div>;
    }

    return (
        <div className="video-player">
            <video
                ref={videoRef}
                controls
                style={{ width: '100%', maxWidth: '800px' }}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
}; 