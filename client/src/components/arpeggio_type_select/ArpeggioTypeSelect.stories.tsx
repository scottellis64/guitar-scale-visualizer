import type { Meta, StoryObj } from '@storybook/react';
import { ArpeggioTypeSelect } from './ArpeggioTypeSelect';

const meta: Meta<typeof ArpeggioTypeSelect> = {
  title: 'Components/ArpeggioTypeSelect',
  component: ArpeggioTypeSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ArpeggioTypeSelect>;

export const Default: Story = {
  args: {
    value: 'major',
    onChange: (value) => console.log('Selected:', value),
  },
};

export const Minor: Story = {
  args: {
    value: 'minor',
    onChange: (value) => console.log('Selected:', value),
  },
}; 