import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { Fretboard } from './Fretboard';
import { RootNoteSelect } from 'components/root_note_select';
import { DisplayTypeSelect } from 'components/display_type_select';
import { ScaleTypeSelect } from 'components/scale_type_select';
import { ArpeggioTypeSelect } from 'components/arpeggio_type_select';
import { NotationToggle } from 'components/notation_toggle';
import { defaultTheme, darkTheme } from 'themes';
import { guitarSlice } from 'store';
import { Note, DisplayType, ScaleType, ArpeggioType } from 'types';

type Story = StoryObj<typeof Fretboard>;

const mockStore = configureStore({
  reducer: {
    guitar: guitarSlice.reducer,
  },
  preloadedState: {
    guitar: {
      rootNote: 'A' as Note,
      displayType: 'scale' as DisplayType,
      scaleType: 'major' as ScaleType,
      arpeggioType: 'major' as ArpeggioType,
      useNashville: false,
      isDarkMode: false,
    },
  },
});

const ControlsPanel = () => (
  <Box sx={{ 
    display: 'flex', 
    gap: 2, 
    mb: 2,
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    p: 2,
    borderRadius: 1,
    bgcolor: 'background.paper'
  }}>
    <RootNoteSelect />
    <DisplayTypeSelect />
    <ScaleTypeSelect />
    <ArpeggioTypeSelect />
    <NotationToggle />
  </Box>
);

const meta: Meta<typeof Fretboard> = {
  component: Fretboard,
  title: 'Components/Fretboard',
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story, context) => {
      const isDarkMode = context.globals?.['darkMode'] || false;
      const theme = isDarkMode ? darkTheme : defaultTheme;
      return (
        <Provider store={mockStore}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
              <ControlsPanel />
              <Story />
            </Box>
          </ThemeProvider>
        </Provider>
      );
    },
  ],
  argTypes: {
    rootNote: {
      control: 'select',
      options: ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
    },
    type: {
      control: 'select',
      options: ['major', 'minor', 'pentatonic', 'blues', 'diminished', 'augmented']
    },
    frets: {
      control: 'number',
      min: 12,
      max: 24
    },
    useNashville: {
      control: 'boolean'
    },
    isArpeggio: {
      control: 'boolean'
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical']
    }
  }
};

export default meta;

export const Default: Story = {
  args: {
    rootNote: 'A',
    type: 'major',
    frets: 15,
    useNashville: false,
    isArpeggio: false,
    orientation: 'horizontal'
  }
};

export const MinorScale: Story = {
  args: {
    ...Default.args,
    type: 'minor'
  }
};

export const PentatonicScale: Story = {
  args: {
    ...Default.args,
    type: 'pentatonic'
  }
};

export const MajorArpeggio: Story = {
  args: {
    ...Default.args,
    isArpeggio: true
  }
};

export const NashvilleNumbers: Story = {
  args: {
    ...Default.args,
    useNashville: true
  }
};

export const VerticalOrientation: Story = {
  args: {
    ...Default.args,
    orientation: 'vertical'
  }
};

export const ExtendedRange: Story = {
  args: {
    ...Default.args,
    frets: 24
  }
}; 