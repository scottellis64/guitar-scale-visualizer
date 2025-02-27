import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  FormControlLabel,
  Switch,
  Paper,
  ThemeProvider,
  IconButton,
  CssBaseline
} from '@mui/material';
import { Fretboard } from 'components';
import { Note, ScaleType, ArpeggioType, DisplayType } from 'types';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import darkTheme, { defaultTheme } from 'themes';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store/store';
import {
  setRootNote,
  setDisplayType,
  setScaleType,
  setArpeggioType,
  setUseNashville,
  setIsDarkMode,
} from './store/guitarSlice';

function App() {
  const dispatch = useDispatch();
  const {
    rootNote,
    displayType,
    scaleType,
    arpeggioType,
    useNashville,
    isDarkMode,
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
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Root Note</InputLabel>
                <Select
                  value={rootNote}
                  label="Root Note"
                  onChange={(e) => dispatch(setRootNote(e.target.value as Note))}
                >
                  {['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'].map(note => (
                    <MenuItem key={note} value={note}>{note}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Display Type</InputLabel>
                <Select
                  value={displayType}
                  label="Display Type"
                  onChange={(e) => dispatch(setDisplayType(e.target.value as DisplayType))}
                >
                  <MenuItem value="scale">Scale</MenuItem>
                  <MenuItem value="arpeggio">Arpeggio</MenuItem>
                  <MenuItem value="triad">Triad</MenuItem>

                </Select>
              </FormControl>

              {displayType === 'scale' ? (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Scale Type</InputLabel>
                  <Select
                    value={scaleType}
                    label="Scale Type"
                    onChange={(e) => dispatch(setScaleType(e.target.value as ScaleType))}
                  >
                    {['major', 'minor', 'pentatonic', 'blues'].map(scale => (
                      <MenuItem key={scale} value={scale}>{scale}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Arpeggio Type</InputLabel>
                  <Select
                    value={arpeggioType}
                    label="Arpeggio Type"
                    onChange={(e) => dispatch(setArpeggioType(e.target.value as ArpeggioType))}
                  >
                    {['major', 'minor', 'diminished', 'augmented', 'dominant7'].map(arpeggio => (
                      <MenuItem key={arpeggio} value={arpeggio}>{arpeggio}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={useNashville}
                    onChange={(e) => dispatch(setUseNashville(e.target.checked))}
                  />
                }
                label="Use Nashville Numbers"
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Fretboard 
              rootNote={rootNote} 
              type={displayType === 'scale' ? scaleType : arpeggioType}
              frets={15} 
              useNashville={useNashville}
              isArpeggio={displayType === 'arpeggio'}
              showTriads={displayType === 'triad'}  
            />
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App; 