import type { Meta, StoryObj } from '@storybook/vue3-vite';
import ActionButton from './ActionButton.vue';

const meta: Meta<typeof ActionButton> = {
  component: ActionButton,
  args: {
    label: 'Save',
  },
};
export default meta;

type Story = StoryObj<typeof ActionButton>;

export const Default: Story = {};

export const Submitting: Story = {
  args: { submitting: true },
};

export const WithResult: Story = {
  args: { result: true },
};
