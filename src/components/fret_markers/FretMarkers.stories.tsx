import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { FretMarkers } from 'components';
import { defaultTheme, darkTheme } from 'themes';

type Story = StoryObj<typeof FretMarkers>;

const meta: Meta<typeof FretMarkers> = {
  component: FretMarkers,
  title: 'Components/FretMarkers',
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story, context) => {
      const isDarkMode = context.globals?.['darkMode'] || false;
      const theme = isDarkMode ? darkTheme : defaultTheme;
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div style={{ width: '60px', height: '40px', position: 'relative', background: theme.fretboard.wood }}>
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ],
  argTypes: {
    fret: {
      control: 'number',
      min: 0,
      max: 24
    }
  }
};

export default meta;

export const NoMarker: Story = {
  args: {
    fret: 1
  }
};

export const SingleMarker: Story = {
  args: {
    fret: 3
  }
};

export const DoubleMarker: Story = {
  args: {
    fret: 12
  }
};

export const HighFretMarker: Story = {
  args: {
    fret: 15
  }
}; 