import React from 'react';

import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  ThemeProvider,
  IconButton,
  CssBaseline
} from '@mui/material';

import { Brightness4, Brightness7 } from '@mui/icons-material';
import { darkTheme, defaultTheme } from 'themes';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, setIsDarkMode } from 'store';

import {
  RootNoteSelect,
  DisplayTypeSelect,
  ScaleTypeSelect,
  ArpeggioTypeSelect,
  NotationToggle,
  ERelativePatternSelect,
  Fretboard
} from 'components';

function App() {
  const dispatch = useDispatch();
  const {
    rootNote,
    displayType,
    scaleType,
    arpeggioType,
    useNashville,
    isDarkMode,
    cagedPattern,
    eRelativePattern
  } = useSelector((state: RootState) => state.guitar);

  const theme = isDarkMode ? darkTheme : defaultTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
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
          
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <RootNoteSelect />
              <DisplayTypeSelect />
              {displayType === 'scale' ? (
                <ScaleTypeSelect />
              ) : (
                <ArpeggioTypeSelect />
              )}
              <NotationToggle />
              <ERelativePatternSelect />
            </Box>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Fretboard 
              rootNote={rootNote} 
              type={displayType === 'scale' ? scaleType : arpeggioType}
              frets={16} 
              useNashville={useNashville}
              isArpeggio={displayType === 'arpeggio'}
              cagedPattern={cagedPattern}
              eRelativePattern={eRelativePattern}
              showTriads={displayType === 'triad'}  
            />
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App; 