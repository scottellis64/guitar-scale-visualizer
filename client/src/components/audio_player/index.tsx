import React, { useRef, useEffect, useState } from 'react';
import { Box, Slider, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import IconButton from '@mui/material/IconButton';

import { API_CONFIG } from 'src/config';

interface AudioPlayerProps {
    audioId: string | null;
    speed?: number;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioId, speed = 1.0 }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (audioId && audioRef.current) {
            audioRef.current.src = `${API_CONFIG.SERVER.BASE_URL}${API_CONFIG.SERVER.ENDPOINTS.APP}/audio/stream/${audioId}?speed=${speed}`;
            audioRef.current.load();
        }
    }, [audioId, speed]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSliderChange = (_event: Event, newValue: number | number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = newValue as number;
            setCurrentTime(newValue as number);
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: 2 }}>
            {audioId ? (
                <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <IconButton onClick={togglePlay} size="large">
                            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                        <Slider
                            value={currentTime}
                            max={duration}
                            onChange={handleSliderChange}
                            sx={{ mx: 2, flex: 1 }}
                        />
                        <Typography variant="body2">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </Typography>
                    </Box>
                    <audio
                        ref={audioRef}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => setIsPlaying(false)}
                        style={{ display: 'none' }}
                    />
                </>
            ) : (
                <Typography align="center" color="textSecondary">
                    Select an audio file to play
                </Typography>
            )}
        </Box>
    );
};

const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}; 