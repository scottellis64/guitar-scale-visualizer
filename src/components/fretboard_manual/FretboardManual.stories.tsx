import type { Meta, StoryObj } from '@storybook/react';
import { FretboardManual } from '.';
import { ThemeProvider } from '@mui/material';
import { defaultTheme } from 'themes';

const meta: Meta<typeof FretboardManual> = {
  title: 'Components/FretboardManual',
  component: FretboardManual,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    height: {
      control: 'number',
      description: 'Height of the fretboard in pixels',
    },
    frets: {
      control: 'number',
      description: 'Number of frets',
    },
    fretWidth: {
      control: 'number',
      description: 'Width of each fret in pixels',
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={defaultTheme}>
        <div style={{ padding: '2rem', backgroundColor: '#f5f5f5' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FretboardManual>;

export const Default: Story = {
  args: {
    height: 100,
    frets: 16,
    fretWidth: 2,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Narrow: Story = {
  args: {
    height: 100,
    frets: 16,
    fretWidth: 2,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Wide: Story = {
  args: {
    height: 100,
    frets: 16,
    fretWidth: 2,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '1200px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Tall: Story = {
  args: {
    height: 200,
    frets: 16,
    fretWidth: 2,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px' }}>
        <Story />
      </div>
    ),
  ],
};

export const MoreFrets: Story = {
  args: {
    height: 100,
    frets: 24,
    fretWidth: 2,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '1000px' }}>
        <Story />
      </div>
    ),
  ],
};

export const WiderFrets: Story = {
  args: {
    height: 100,
    frets: 16,
    fretWidth: 4,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Responsive: Story = {
  args: {
    height: 100,
    frets: 16,
    fretWidth: 2,
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={defaultTheme}>
        <div style={{ padding: '2rem', backgroundColor: '#f5f5f5', width: '100%', maxWidth: '1200px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
}; 