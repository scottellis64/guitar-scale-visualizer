import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ArpeggioTypeSelect } from './ArpeggioTypeSelect';
import { defaultTheme, darkTheme } from 'themes';
import { guitarSlice } from 'store';
import { Note, DisplayType, ScaleType, ArpeggioType } from 'types';

type Story = StoryObj<typeof ArpeggioTypeSelect>;

const mockStore = configureStore({
  reducer: {
    guitar: guitarSlice.reducer,
  },
  preloadedState: {
    guitar: {
      rootNote: 'A' as Note,
      displayType: 'arpeggio' as DisplayType,
      scaleType: 'major' as ScaleType,
      arpeggioType: 'major' as ArpeggioType,
      useNashville: false,
      isDarkMode: false,
    },
  },
});

const meta: Meta<typeof ArpeggioTypeSelect> = {
  component: ArpeggioTypeSelect,
  title: 'Components/ArpeggioTypeSelect',
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
    arpeggioType: {
      control: 'select',
      options: ['major', 'minor', 'diminished', 'augmented', 'dominant7']
    }
  }
};

export default meta;

export const Default: Story = {
  args: {
    arpeggioType: 'major'
  }
};

export const Minor: Story = {
  args: {
    arpeggioType: 'minor'
  }
};

export const Diminished: Story = {
  args: {
    arpeggioType: 'diminished'
  }
};

export const Augmented: Story = {
  args: {
    arpeggioType: 'augmented'
  }
};

export const Dominant7: Story = {
  args: {
    arpeggioType: 'dominant7'
  }
}; 