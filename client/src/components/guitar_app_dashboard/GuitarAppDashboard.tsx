import React, { useState } from 'react';
import { DashboardLayout, AppProvider, PageContainer, type NavigationItem, type Router } from '@toolpad/core';
import { Typography, Stack, Button, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import TuneIcon from '@mui/icons-material/Tune';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import { useLocation, useNavigate } from 'react-router-dom';
import { VideoList, VideoPlayer } from 'components';

const NAVIGATION: NavigationItem[] = [
  {
    kind: 'header',
    title: 'Guitar Tools',
  },
  {
    kind: 'page',
    segment: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    kind: 'page',
    segment: 'fretboard',
    title: 'Fretboard',
    icon: <MusicNoteIcon />,
  },
  {
    kind: 'page',
    segment: 'fretboard-manual',
    title: 'Fretboard Manual',
    icon: <TuneIcon />,
  },
  {
    kind: 'page',
    segment: 'videos',
    title: 'Videos',
    icon: <VideoLibraryIcon />,
  },
  {
    kind: 'page',
    segment: 'audio',
    title: 'Audio',
    icon: <AudiotrackIcon />,
  },
];

interface GuitarAppDashboardProps {
  children?: React.ReactNode;
}

export function GuitarAppDashboard({ children }: GuitarAppDashboardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scales' | 'videos'>('scales');

  // Create router object compatible with @toolpad/core
  const toolpadRouter: Router = React.useMemo(() => ({
    pathname: location.pathname,
    searchParams: new URLSearchParams(location.search),
    navigate: (url: string | URL) => navigate(url.toString()),
  }), [location, navigate]);

  return (
    <AppProvider 
      navigation={NAVIGATION} 
      router={toolpadRouter}
    >
      <DashboardLayout>
        <PageContainer>
          <Stack spacing={3} sx={{ p: 3 }}>
            {children || (
              <>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Button
                    variant={activeTab === 'scales' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('scales')}
                  >
                    Scales
                  </Button>
                  <Button
                    variant={activeTab === 'videos' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('videos')}
                  >
                    Videos
                  </Button>
                </Box>

                {activeTab === 'scales' && (
                  <>
                    <Typography variant="h4" gutterBottom>
                      Welcome to Guitar Tools
                    </Typography>
                    <Typography>
                      Select a tool from the navigation menu to get started.
                    </Typography>
                  </>
                )}

                {activeTab === 'videos' && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ width: '300px' }}>
                      <VideoList onSelectVideo={setSelectedVideoId} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <VideoPlayer videoId={selectedVideoId} />
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Stack>
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
} 