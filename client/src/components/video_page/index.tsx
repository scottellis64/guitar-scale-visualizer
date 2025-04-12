import React, { useState } from 'react';
import { Box } from '@mui/material';
import { VideoList, VideoPlayer } from 'components';

export const VideoPage: React.FC = () => {
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

    return (
        <Box sx={{ display: 'flex', gap: 2, p: 3 }}>
            <Box sx={{ width: '300px' }}>
                <VideoList onSelectVideo={setSelectedVideoId} />
            </Box>
            <Box sx={{ flex: 1 }}>
                <VideoPlayer videoId={selectedVideoId} />
            </Box>
        </Box>
    );
}; 