import type { Meta, StoryObj } from '@storybook/react';
import { FretboardInstance } from './FretboardInstance';
import { Provider } from 'react-redux';
import { store } from 'store';
import { addInstance } from 'store/guitar-slice';

const meta: Meta<typeof FretboardInstance> = {
  title: 'Components/FretboardInstance',
  component: FretboardInstance,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => {
      // Add a test instance to the store
      store.dispatch(addInstance('test'));
      return (
        <Provider store={store}>
          <Story />
        </Provider>
      );
    },
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FretboardInstance>;

export const Default: Story = {
  args: {
    id: 'test',
  },
};

export const ScaleWithCagedPattern: Story = {
  args: {
    id: 'test',
  },
  parameters: {
    initialState: {
      guitar: {
        instances: {
          test: {
            id: 'test',
            rootNote: 'C',
            displayType: 'scale',
            scaleType: 'major',
            arpeggioType: 'major',
            useNashville: false,
            cagedPattern: 'C',
            eRelativePattern: null,
          },
        },
        isDarkMode: false,
      },
    },
  },
};

export const ArpeggioWithERelativePattern: Story = {
  args: {
    id: 'test',
  },
  parameters: {
    initialState: {
      guitar: {
        instances: {
          test: {
            id: 'test',
            rootNote: 'C',
            displayType: 'arpeggio',
            scaleType: 'major',
            arpeggioType: 'major',
            useNashville: false,
            cagedPattern: null,
            eRelativePattern: '1E',
          },
        },
        isDarkMode: false,
      },
    },
  },
};

export const WithNashvilleNotation: Story = {
  args: {
    id: 'test',
  },
  parameters: {
    initialState: {
      guitar: {
        instances: {
          test: {
            id: 'test',
            rootNote: 'C',
            displayType: 'scale',
            scaleType: 'major',
            arpeggioType: 'major',
            useNashville: true,
            cagedPattern: null,
            eRelativePattern: null,
          },
        },
        isDarkMode: false,
      },
    },
  },
};

export const MinorScale: Story = {
  args: {
    id: 'test',
  },
  parameters: {
    initialState: {
      guitar: {
        instances: {
          test: {
            id: 'test',
            rootNote: 'A',
            displayType: 'scale',
            scaleType: 'minor',
            arpeggioType: 'minor',
            useNashville: false,
            cagedPattern: null,
            eRelativePattern: null,
          },
        },
        isDarkMode: false,
      },
    },
  },
};

export const WithTriads: Story = {
  args: {
    id: 'test',
  },
  parameters: {
    initialState: {
      guitar: {
        instances: {
          test: {
            id: 'test',
            rootNote: 'C',
            displayType: 'triad',
            scaleType: 'major',
            arpeggioType: 'major',
            useNashville: false,
            cagedPattern: null,
            eRelativePattern: null,
          },
        },
        isDarkMode: false,
      },
    },
  },
}; 