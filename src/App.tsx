import React, { useEffect } from 'react';
import { Box, Container, CssBaseline, ThemeProvider } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'store';
import { darkTheme, defaultTheme } from 'themes';
import { FretboardInstance, GuitarScaleVisualizerHeader } from 'components';
import { addInstance } from 'store/guitar-slice';

function App() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.guitar.isDarkMode);
  const theme = isDarkMode ? darkTheme : defaultTheme;

  useEffect(() => {
    // Add a second instance when the app loads
    dispatch(addInstance('second'));
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <GuitarScaleVisualizerHeader />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FretboardInstance id="default" />
            <FretboardInstance id="second" />
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App; 