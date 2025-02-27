import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { RootNoteSelect } from './RootNoteSelect';
import { defaultTheme, darkTheme } from 'themes';
import { guitarSlice } from 'store';
import { Note, DisplayType, ScaleType, ArpeggioType } from 'types';

type Story = StoryObj<typeof RootNoteSelect>;

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

const meta: Meta<typeof RootNoteSelect> = {
  component: RootNoteSelect,
  title: 'Components/RootNoteSelect',
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
    rootNote: {
      control: 'select',
      options: ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
    }
  }
};

export default meta;

export const Default: Story = {
  args: {
    rootNote: 'A'
  }
};

export const WithSharp: Story = {
  args: {
    rootNote: 'F#'
  }
};

export const Natural: Story = {
  args: {
    rootNote: 'C'
  }
}; 