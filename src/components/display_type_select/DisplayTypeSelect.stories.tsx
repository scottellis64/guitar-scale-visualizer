import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { DisplayTypeSelect } from './DisplayTypeSelect';
import { defaultTheme, darkTheme } from 'themes';
import { guitarSlice } from 'store';
import { Note, DisplayType, ScaleType, ArpeggioType } from 'types';

type Story = StoryObj<typeof DisplayTypeSelect>;

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

const meta: Meta<typeof DisplayTypeSelect> = {
  component: DisplayTypeSelect,
  title: 'Components/DisplayTypeSelect',
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
            <Story />
          </ThemeProvider>
        </Provider>
      );
    },
  ],
  argTypes: {
    displayType: {
      control: 'select',
      options: ['scale', 'arpeggio', 'triad']
    }
  }
};

export default meta;

export const Default: Story = {
  args: {
    displayType: 'scale'
  }
};

export const Arpeggio: Story = {
  args: {
    displayType: 'arpeggio'
  }
};

export const Triad: Story = {
  args: {
    displayType: 'triad'
  }
}; 