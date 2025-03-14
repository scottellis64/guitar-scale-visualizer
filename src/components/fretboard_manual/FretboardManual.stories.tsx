import type { Meta, StoryObj } from '@storybook/react';
import FretboardManual from './FretboardManual';
import { ThemeProvider } from '@mui/material';
import { defaultTheme } from 'themes';
import { Box } from '@mui/material';

const meta: Meta<typeof FretboardManual> = {
  title: 'Components/FretboardManual',
  component: FretboardManual,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A manual fretboard component that displays notes and patterns on a guitar neck.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider theme={defaultTheme}>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '2rem',
          width: '800px',
          borderRadius: '8px'
        }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    frets: {
      control: { type: 'number', min: 12, max: 24 },
      description: 'Number of frets to display',
    },
    height: {
      control: { type: 'number', min: 100, max: 600 },
      description: 'Height of the fretboard in pixels',
    },
    fretWidth: {
      control: { type: 'number', min: 1, max: 5 },
      description: 'Width of the fret lines in pixels',
    },
    guitarNutWidth: {
      control: { type: 'number', min: 5, max: 20 },
      description: 'Width of the guitar nut in pixels',
    },
    rootNote: {
      control: 'select',
      options: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
      description: 'Root note for the scale',
    },
    scaleType: {
      control: 'select',
      options: ['major', 'minor', 'pentatonic', 'blues', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'],
      description: 'Type of scale to display',
    }
  },
};

export default meta;
type Story = StoryObj<typeof FretboardManual>;

export const Default: Story = {
  args: {
    frets: 16,
    height: 150,
    fretWidth: 2,
    guitarNutWidth: 10,
    rootNote: 'C',
    type: 'major',
  },
};

export const WithCustomHeight: Story = {
  args: {
    frets: 16,
    height: 400,
    fretWidth: 2,
    guitarNutWidth: 10,
    rootNote: 'C',
    scaleType: 'major',
  },
};

export const WithCustomBackground: Story = {
  args: {
    frets: 16,
    height: 150,
    fretWidth: 2,
    guitarNutWidth: 10,
    rootNote: 'C',
    scaleType: 'major',
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={defaultTheme}>
        <div style={{ 
          background: '#2c3e50', 
          padding: '2rem',
          minWidth: '800px',
          borderRadius: '8px'
        }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export const MinorScale: Story = {
  args: {
    frets: 16,
    height: 150,
    fretWidth: 2,
    guitarNutWidth: 10,
    rootNote: 'A',
    scaleType: 'minor',
  },
};

export const PentatonicScale: Story = {
  args: {
    frets: 16,
    height: 150,
    fretWidth: 2,
    guitarNutWidth: 10,
    rootNote: 'E',
    scaleType: 'pentatonic',
  },
};

export const BluesScale: Story = {
  args: {
    frets: 16,
    height: 150,
    fretWidth: 2,
    guitarNutWidth: 10,
    rootNote: 'G',
    scaleType: 'blues',
  },
};

export const MultipleInstances: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <FretboardManual 
        id="fretboard-1"
        height={150}
        rootNote="C"
        scaleType="major"
      />
      <FretboardManual 
        id="fretboard-2"
        height={150}
        rootNote="A"
        scaleType="minor"
      />
      <FretboardManual 
        id="fretboard-3"
        height={150}
        rootNote="E"
        scaleType="pentatonic"
      />
    </Box>
  ),
};
