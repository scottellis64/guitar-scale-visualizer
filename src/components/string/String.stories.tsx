import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Fret, String } from 'components';
import { defaultTheme, darkTheme } from 'themes';

type Story = StoryObj<typeof String>;

const meta: Meta<typeof String> = {
  component: String,
  title: 'Components/String',
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
          <div style={{ 
            padding: '20px',
            background: theme.fretboard.wood 
          }}>
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical']
    }
  }
};

export default meta;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    children: Array(6).fill(0).map((_, i) => (
      <Fret 
        key={i}
        fret={i}
        isInScale={i % 2 === 0}
        isArpeggio={false}
        displayValue={i % 2 === 0 ? 'A' : ''}
        showFretNumber={false}
        showMarkers={false}
      />
    ))
  }
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    children: Array(6).fill(0).map((_, i) => (
      <Fret 
        key={i}
        fret={i}
        isInScale={i % 2 === 0}
        isArpeggio={false}
        displayValue={i % 2 === 0 ? 'A' : ''}
        showFretNumber={false}
        showMarkers={false}
      />
    ))
  }
};

export const WithArpeggios: Story = {
  args: {
    orientation: 'horizontal',
    children: Array(6).fill(0).map((_, i) => (
      <Fret 
        key={i}
        fret={i}
        isInScale={i % 3 === 0}
        isArpeggio={i % 3 === 0}
        displayValue={i % 3 === 0 ? 'A' : ''}
        showFretNumber={false}
        showMarkers={false}
      />
    ))
  }
};

export const WithMarkers: Story = {
  args: {
    orientation: 'horizontal',
    children: Array(13).fill(0).map((_, i) => (
      <Fret 
        key={i}
        fret={i}
        isInScale={false}
        isArpeggio={false}
        displayValue={''}
        showFretNumber={true}
        showMarkers={true}
      />
    ))
  }
}; 