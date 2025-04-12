import React, { useState } from 'react';
import { Box, Slider, Typography } from '@mui/material';
import { AudioList, AudioPlayer } from 'components';

export const AudioPage: React.FC = () => {
    const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

    return (
        <Box sx={{ display: 'flex', gap: 2, p: 3 }}>
            <Box sx={{ width: '300px' }}>
                <AudioList onSelectAudio={setSelectedAudioId} />
            </Box>
            <Box sx={{ flex: 1 }}>
                <Box sx={{ mb: 4 }}>
                    <AudioPlayer audioId={selectedAudioId} speed={playbackSpeed} />
                </Box>
                <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                    <Typography gutterBottom>
                        Playback Speed: {playbackSpeed.toFixed(1)}x
                    </Typography>
                    <Slider
                        value={playbackSpeed}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        onChange={(_event, newValue) => setPlaybackSpeed(newValue as number)}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value.toFixed(1)}x`}
                    />
                </Box>
            </Box>
        </Box>
    );
}; 