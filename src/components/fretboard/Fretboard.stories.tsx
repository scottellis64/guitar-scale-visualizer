import { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Fretboard } from './Fretboard';
import { defaultTheme, darkTheme } from '../../themes/defaultTheme';

const meta = {
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
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Story />
        </ThemeProvider>
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
      options: ['major', 'minor', 'pentatonic', 'blues', 'diminished', 'augmented', 'dominant7']
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
    },
    showTriads: {
      control: 'boolean'
    }
  }
} satisfies Meta<typeof Fretboard>;

export default meta;

type Story = StoryObj<typeof Fretboard>;

export const Default: Story = {
  args: {
    rootNote: 'A',
    type: 'major',
    frets: 15,
    useNashville: false,
    isArpeggio: false,
    orientation: 'horizontal',
    showTriads: false
  }
};

export const Vertical: Story = {
  args: {
    ...Default.args,
    orientation: 'vertical'
  }
};

export const WithTriads: Story = {
  args: {
    ...Default.args,
    showTriads: true
  }
}; 