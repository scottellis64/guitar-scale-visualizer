import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import { setIsDarkMode } from 'store/guitar-slice';

export const GuitarScaleVisualizerHeader: React.FC = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.guitar.isDarkMode);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      <Typography variant="h3" component="h1">
        Guitar Scale Visualizer
      </Typography>
      <IconButton 
        onClick={() => dispatch(setIsDarkMode(!isDarkMode))} 
        color="inherit"
      >
        {isDarkMode ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Box>
  );
}; 