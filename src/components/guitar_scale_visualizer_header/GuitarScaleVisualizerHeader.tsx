import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Brightness4, Brightness7, Add } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import { setIsDarkMode, addInstance } from 'store/guitar-slice';

export const GuitarScaleVisualizerHeader: React.FC = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.guitar.isDarkMode);

  const handleAddInstance = () => {
    const timestamp = Date.now();
    dispatch(addInstance(`instance-${timestamp}`));
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      <Typography variant="h3" component="h1">
        Guitar Scale Visualizer
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton 
          onClick={handleAddInstance}
          color="primary"
          aria-label="add fretboard"
        >
          <Add />
        </IconButton>
        <IconButton 
          onClick={() => dispatch(setIsDarkMode(!isDarkMode))} 
          color="inherit"
          aria-label="toggle dark mode"
        >
          {isDarkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Box>
    </Box>
  );
}; 