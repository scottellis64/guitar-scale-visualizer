import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material';
import { defaultTheme } from 'themes';
import { FretboardManual } from 'components';
import { store } from 'store';
import React from 'react';
import { useFretboardDispatch } from 'hooks';

interface FretboardControlsProps {
  id: string;
  height: number;
  fretWidth: number;
  guitarNutWidth: number;
  numberOfFrets?: number;
}

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
      <Provider store={store}>
        <ThemeProvider theme={defaultTheme}>
          <div style={{ 
            background: '#f5f5f5', 
            padding: '0 2rem 1rem 2rem',
            width: '800px',
            borderRadius: '8px'
          }}>
            <Story />
          </div>
        </ThemeProvider>
      </Provider>
    ),
  ],
  argTypes: {
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
    }
  },
};

export default meta;
type Story = StoryObj<typeof FretboardManual>;

const DEFAULT_ID = 'story-default';

// Create a wrapper component to handle fret updates
const FretboardWithControls: React.FC<FretboardControlsProps> = ({ 
  id, 
  height, 
  fretWidth, 
  guitarNutWidth, 
  numberOfFrets = 16 
}) => {
  const { handleFretsChange } = useFretboardDispatch({ id });

  React.useEffect(() => {
    handleFretsChange(numberOfFrets);
  }, [numberOfFrets]);

  return (
    <FretboardManual
      id={id}
      height={height}
      fretWidth={fretWidth}
      guitarNutWidth={guitarNutWidth}
    />
  );
};

export const Default: Story = {
  render: (args) => (
    <FretboardWithControls {...args as FretboardControlsProps} />
  ),
  args: {
    id: DEFAULT_ID,
    height: 150,
    fretWidth: 2,
    guitarNutWidth: 10
  }
};
