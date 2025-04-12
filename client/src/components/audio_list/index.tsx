import React from 'react';
import { List, ListItem, ListItemText, CircularProgress, Typography } from '@mui/material';
import { useAudioApi } from 'hooks';

interface AudioListProps {
    onSelectAudio: (audioId: string) => void;
}

export const AudioList: React.FC<AudioListProps> = ({ onSelectAudio }) => {
    const { audioFiles, loading, error } = useAudioApi();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return (
            <Typography color="error" style={{ padding: '20px' }}>
                {error}
            </Typography>
        );
    }

    return (
        <List>
            {audioFiles.map((audio) => (
                <ListItem 
                    key={audio.id}
                    component="button"
                    onClick={() => onSelectAudio(audio.id)}
                    sx={{
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        },
                    }}
                >
                    <ListItemText
                        primary={audio.title}
                        secondary={`${audio.artist} - ${formatDuration(audio.duration)}`}
                    />
                </ListItem>
            ))}
        </List>
    );
};

const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}; 