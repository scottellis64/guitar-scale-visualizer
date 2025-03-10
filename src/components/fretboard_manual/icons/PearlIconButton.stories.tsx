import type { Meta, StoryObj } from '@storybook/react';
import { PearlIconButton } from './PearlIconButton';
import { Box, Tooltip } from '@mui/material';

const meta = {
  title: 'Components/Icons/PearlIconButton',
  component: PearlIconButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A shiny pearl-like button component with various color options and interactive effects.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
    size: {
      control: 'radio',
      options: ['small', 'medium', 'large'],
      description: 'Size of the button',
    },
    pearlColor: {
      control: 'select',
      options: ['white', 'cream', 'pink', 'blue'],
      description: 'Color variant of the pearl',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
} satisfies Meta<typeof PearlIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    'aria-label': 'pearl button',
  },
};

export const Colors: Story = {
  decorators: [
    (Story) => (
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
        <PearlIconButton pearlColor="white" aria-label="white pearl" />
        <PearlIconButton pearlColor="cream" aria-label="cream pearl" />
        <PearlIconButton pearlColor="pink" aria-label="pink pearl" />
        <PearlIconButton pearlColor="blue" aria-label="blue pearl" />
      </Box>
    ),
  ],
};

export const Sizes: Story = {
  decorators: [
    (Story) => (
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <PearlIconButton size="small" aria-label="small pearl" />
        <PearlIconButton size="medium" aria-label="medium pearl" />
        <PearlIconButton size="large" aria-label="large pearl" />
      </Box>
    ),
  ],
};

export const WithBackground: Story = {
  decorators: [
    (Story) => (
      <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#2c3e50', borderRadius: 2 }}>
        <PearlIconButton pearlColor="white" aria-label="pearl on dark" />
        <PearlIconButton pearlColor="cream" aria-label="cream pearl on dark" />
        <PearlIconButton pearlColor="pink" aria-label="pink pearl on dark" />
        <PearlIconButton pearlColor="blue" aria-label="blue pearl on dark" />
      </Box>
    ),
  ],
};

export const WithTooltip: Story = {
  decorators: [
    (Story) => (
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title="White Pearl">
          <PearlIconButton pearlColor="white" aria-label="white pearl with tooltip" />
        </Tooltip>
        <Tooltip title="Cream Pearl">
          <PearlIconButton pearlColor="cream" aria-label="cream pearl with tooltip" />
        </Tooltip>
      </Box>
    ),
  ],
};

export const Interactive: Story = {
  args: {
    'aria-label': 'interactive pearl',
    sx: {
      '&:hover': {
        transform: 'scale(1.1) rotate(5deg)!important',
      },
    },
  },
};

export const GroupedPearls: Story = {
  decorators: [
    (Story) => (
      <Box 
        sx={{ 
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          alignItems: 'center',
          bgcolor: '#1a1a1a',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <PearlIconButton pearlColor="white" size="small" aria-label="white pearl" />
          <PearlIconButton pearlColor="cream" size="small" aria-label="cream pearl" />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <PearlIconButton pearlColor="pink" size="small" aria-label="pink pearl" />
          <PearlIconButton pearlColor="blue" size="small" aria-label="blue pearl" />
        </Box>
      </Box>
    ),
  ],
}; 