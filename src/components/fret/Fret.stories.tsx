import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Fret } from 'components';
import { defaultTheme, darkTheme } from 'themes';

type Story = StoryObj<typeof Fret>;

const meta: Meta<typeof Fret> = {
  component: Fret,
  title: 'Components/Fret',
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
          <Story />
        </ThemeProvider>
      );
    },
  ],
  argTypes: {
    fret: {
      control: 'number',
      min: 0,
      max: 24
    },
    isInScale: {
      control: 'boolean'
    },
    isArpeggio: {
      control: 'boolean'
    },
    displayValue: {
      control: 'text'
    },
    showFretNumber: {
      control: 'boolean'
    },
    showMarkers: {
      control: 'boolean'
    }
  }
};

export default meta;

export const Default: Story = {
  args: {
    fret: 0,
    isInScale: false,
    isArpeggio: false,
    displayValue: '',
    showFretNumber: false,
    showMarkers: false
  }
};

export const InScale: Story = {
  args: {
    fret: 3,
    isInScale: true,
    isArpeggio: false,
    displayValue: 'C',
    showFretNumber: true,
    showMarkers: true
  }
};

export const InArpeggio: Story = {
  args: {
    fret: 5,
    isInScale: true,
    isArpeggio: true,
    displayValue: 'E',
    showFretNumber: true,
    showMarkers: true
  }
};

export const WithMarkers: Story = {
  args: {
    fret: 12,
    isInScale: false,
    isArpeggio: false,
    displayValue: '',
    showFretNumber: true,
    showMarkers: true
  }
}; 