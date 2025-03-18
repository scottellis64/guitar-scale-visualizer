import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, Box, Typography, Paper, Stack } from '@mui/material';
import { defaultTheme } from '../../themes';
import { GuitarAppDashboard } from './GuitarAppDashboard';

const meta: Meta<typeof GuitarAppDashboard> = {
  title: 'Components/GuitarAppDashboard',
  component: GuitarAppDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A dashboard layout component using @toolpad/core with navigation and responsive design.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={defaultTheme}>
        <BrowserRouter>
          <Story />
        </BrowserRouter>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GuitarAppDashboard>;

export const Default: Story = {
  render: () => (
    <GuitarAppDashboard />
  ),
};

export const WithContent: Story = {
  render: () => (
    <GuitarAppDashboard>
      <Typography variant="h4" gutterBottom>
        Fretboard Visualization
      </Typography>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)'
        },
        gap: 3 
      }}>
        <Paper sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="h6">Scale Explorer</Typography>
            <Typography>
              Visualize different scales and modes on the fretboard.
            </Typography>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="h6">Chord Library</Typography>
            <Typography>
              Explore common chord shapes and variations.
            </Typography>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="h6">Practice Tools</Typography>
            <Typography>
              Tools to help you practice scales and chords effectively.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </GuitarAppDashboard>
  ),
}; 