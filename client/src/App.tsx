import { useEffect } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, addInstance } from 'store';
import { darkTheme, defaultTheme } from 'themes';
import { FretboardInstance, GuitarAppDashboard, FretboardManual, VideoPage, AudioPage } from 'components';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom/dist';

function App() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.guitar.isDarkMode);
  const theme = isDarkMode ? darkTheme : defaultTheme;

  useEffect(() => {
    // Add initial instance for the manual fretboard
    dispatch(addInstance('manual-instance'));
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <GuitarAppDashboard>
          <Routes>
            <Route path="/" element={<Navigate to="/fretboard" replace />} />
            <Route 
              path="/fretboard" 
              element={<FretboardInstance />} 
            />
            <Route 
              path="/fretboard-manual" 
              element={<FretboardManual id="manual-instance" />} 
            />
            <Route 
              path="/videos" 
              element={<VideoPage />} 
            />
            <Route 
              path="/audio" 
              element={<AudioPage />} 
            />
          </Routes>
        </GuitarAppDashboard>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App; 