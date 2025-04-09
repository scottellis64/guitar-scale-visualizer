import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { GuitarTablature } from './GuitarTablature';
import { Tablature } from 'types';

const meta: Meta<typeof GuitarTablature> = {
  title: 'GuitarTablature',
  component: GuitarTablature,
  decorators: [
    (Story) => (
      <Provider store={configureStore({ reducer: {} })}>
        <Story />
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GuitarTablature>;

// Create a sample tablature for a C major scale
const cMajorTablature: Tablature = {
  id: 'c-major',
  name: 'C Major Scale',
  columns: [
    { fret: 3, notes: [{ string: 4 }] },
    { fret: 0, notes: [{ string: 3 }] },
    { fret: 2, notes: [{ string: 3 }] },
    { fret: 3, notes: [{ string: 3 }] },
    { fret: 0, notes: [{ string: 2 }] },
    { fret: 2, notes: [{ string: 2 }] },
    { fret: 0, notes: [{ string: 1 }] },
    { fret: 1, notes: [{ string: 1 }] },
    { fret: 3, notes: [{ string: 1 }] },
    { fret: 0, notes: [{ string: 0 }] },
    { fret: 1, notes: [{ string: 0 }] },
    { fret: 3, notes: [{ string: 0 }] },
  ],
};

// Create a sample tablature for an A minor arpeggio
const aMinorArpeggio: Tablature = {
  id: 'a-minor',
  name: 'A Minor Arpeggio',
  columns: [
    { fret: 0, notes: [{ string: 5 }] },
    { fret: 2, notes: [{ string: 4 }] },
    { fret: 2, notes: [{ string: 3 }] },
    { fret: 0, notes: [{ string: 2 }] },
  ],
};

export const Default: Story = {
  args: {
    title: 'C Major Scale',
    tablature: cMajorTablature,
  },
};

export const Arpeggio: Story = {
  args: {
    title: 'A Minor Arpeggio',
    tablature: aMinorArpeggio,
  },
};
