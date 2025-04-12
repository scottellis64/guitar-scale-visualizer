import React from 'react';
import { useVideoApi } from 'hooks';

interface VideoListProps {
    onSelectVideo: (videoId: string) => void;
}

export const VideoList: React.FC<VideoListProps> = ({ onSelectVideo }) => {
    const { videos, loading, error } = useVideoApi();

    if (loading) return <div>Loading videos...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="video-list">
            <h2>Available Videos</h2>
            <ul>
                {videos.map((video) => (
                    <li key={video.id}>
                        <button onClick={() => onSelectVideo(video.id)}>
                            {video.filename}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}; 