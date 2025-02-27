import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ScaleTypeSelect } from './ScaleTypeSelect';
import { defaultTheme, darkTheme } from 'themes';
import { guitarSlice } from 'store';
import { Note, DisplayType, ScaleType, ArpeggioType } from 'types';

type Story = StoryObj<typeof ScaleTypeSelect>;

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

const meta: Meta<typeof ScaleTypeSelect> = {
  component: ScaleTypeSelect,
  title: 'Components/ScaleTypeSelect',
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
    scaleType: {
      control: 'select',
      options: ['major', 'minor', 'pentatonic', 'blues', 'diminished', 'augmented']
    }
  }
};

export default meta;

export const Default: Story = {
  args: {
    scaleType: 'major'
  }
};

export const Minor: Story = {
  args: {
    scaleType: 'minor'
  }
};

export const Pentatonic: Story = {
  args: {
    scaleType: 'pentatonic'
  }
};

export const Blues: Story = {
  args: {
    scaleType: 'blues'
  }
};

export const Diminished: Story = {
  args: {
    scaleType: 'diminished'
  }
};

export const Augmented: Story = {
  args: {
    scaleType: 'augmented'
  }
}; 