import React from 'react';
import { 
    Drawer, 
    Box, 
    IconButton, 
    Typography, 
    styled
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DisplayTypeSelect, ERelativePatternSelect, NotationToggle, RootNoteSelect, ScaleTypeSelect } from 'components';
import { useFretboardDispatch } from 'hooks';

const DRAWER_WIDTH = 200;

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'space-between',
}));

interface FretboardConfigPanelProps {
    id: string;
    open: boolean;
    onClose: () => void;
}

export const FretboardConfigPanel: React.FC<FretboardConfigPanelProps> = ({
    id,
    open,
    onClose,
}) => {
    const {
        rootNote,
        scaleType,
        displayType,
        useNashville,
        eRelativePattern,
        handleRootNoteChange,
        handleScaleTypeChange,
        handleDisplayTypeChange,
        handleUseNashvilleChange,
        handleERelativePatternChange,
    } = useFretboardDispatch({ id });

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                },
            }}
        >
            <DrawerHeader>
                <Typography variant="h6" noWrap component="div">
                    Fretboard Configuration
                </Typography>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DrawerHeader>
            <Box sx={{ p: 1 }}>
                <RootNoteSelect value={rootNote} onChange={handleRootNoteChange} />
                <ScaleTypeSelect value={scaleType} onChange={handleScaleTypeChange} />
                <DisplayTypeSelect value={displayType} onChange={handleDisplayTypeChange} />
                <NotationToggle value={useNashville} onChange={handleUseNashvilleChange} />
                <ERelativePatternSelect value={eRelativePattern} onChange={handleERelativePatternChange} />
            </Box>
        </Drawer>
    );
}; 