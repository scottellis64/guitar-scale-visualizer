import React from 'react';
import { DashboardLayout, AppProvider, PageContainer, type NavigationItem, type Router } from '@toolpad/core';
import { Typography, Stack } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import TuneIcon from '@mui/icons-material/Tune';
import { useLocation, useNavigate } from 'react-router-dom';

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
];

interface GuitarAppDashboardProps {
  children?: React.ReactNode;
}

export function GuitarAppDashboard({ children }: GuitarAppDashboardProps) {
  const location = useLocation();
  const navigate = useNavigate();

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
                <Typography variant="h4" gutterBottom>
                  Welcome to Guitar Tools
                </Typography>
                <Typography>
                  Select a tool from the navigation menu to get started.
                </Typography>
              </>
            )}
          </Stack>
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
} 