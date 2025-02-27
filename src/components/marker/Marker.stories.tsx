import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Marker } from 'components';
import { defaultTheme, darkTheme } from 'themes';

type Story = StoryObj<typeof Marker>;

const meta: Meta<typeof Marker> = {
  component: Marker,
  title: 'Components/Marker',
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
            width: '60px', 
            height: '40px', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: theme.fretboard.wood 
          }}>
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ]
};

export default meta;

export const Default: Story = {
  args: {}
};

export const WithCustomSize: Story = {
  decorators: [
    (Story) => (
      <div style={{ transform: 'scale(1.5)' }}>
        <Story />
      </div>
    )
  ]
}; 