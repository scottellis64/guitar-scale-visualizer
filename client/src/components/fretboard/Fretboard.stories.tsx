import type { Meta, StoryObj } from '@storybook/react';
import { Fretboard } from './Fretboard';
import { Provider } from 'react-redux';
import { store } from 'store';

const meta: Meta<typeof Fretboard> = {
  title: 'Components/Fretboard',
  component: Fretboard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <Provider store={store}>
        <Story />
      </Provider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Fretboard>;

export const Scale: Story = {
  args: {
    rootNote: 'C',
    type: 'major',
    frets: 15,
    useNashville: false,
    isArpeggio: false,
    orientation: 'horizontal',
    showTriads: false,
  },
};

export const Arpeggio: Story = {
  args: {
    rootNote: 'C',
    type: 'major',
    frets: 15,
    useNashville: false,
    isArpeggio: true,
    orientation: 'horizontal',
    showTriads: false,
  },
};

export const WithCagedPattern: Story = {
  args: {
    rootNote: 'C',
    type: 'major',
    frets: 15,
    useNashville: false,
    isArpeggio: false,
    orientation: 'horizontal',
    showTriads: false,
    cagedPattern: 'C',
  },
};

export const WithERelativePattern: Story = {
  args: {
    rootNote: 'C',
    type: 'major',
    frets: 15,
    useNashville: false,
    isArpeggio: false,
    orientation: 'horizontal',
    showTriads: false,
    eRelativePattern: '1E',
  },
}; 