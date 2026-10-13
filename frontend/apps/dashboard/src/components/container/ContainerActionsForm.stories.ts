import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import ContainerActionsForm from './ContainerActionsForm.vue';
import { schemaToForm } from '@/utils/formUtils';
import { containerActionSchema } from '@/utils/validation-schema';

const meta: Meta<typeof ContainerActionsForm> = {
  component: ContainerActionsForm,
};
export default meta;

type Story = StoryObj<typeof ContainerActionsForm>;

const render = (args: { isEditable: boolean; isOrganEditable?: boolean }) => ({
  components: { ContainerActionsForm },
  setup() {
    const form = schemaToForm(containerActionSchema);
    return { form, args };
  },
  template: '<ContainerActionsForm v-bind="args" :form="form" />',
});

export const Default: Story = {
  render,
  args: { isEditable: true, isOrganEditable: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('switch')).toBeEnabled();
    await expect(canvas.getByRole('combobox')).toHaveAttribute('aria-disabled', 'false');
  },
};

export const Editable: Story = {
  render,
  args: { isEditable: true, isOrganEditable: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('switch')).toBeEnabled();
    // isOrganEditable is false here, unlike Default, so the owner field alone is locked.
    await expect(canvas.getByRole('combobox')).toHaveAttribute('aria-disabled', 'true');
  },
};

export const ReadOnly: Story = {
  render,
  args: { isEditable: false, isOrganEditable: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('switch')).toBeDisabled();
    await expect(canvas.getByRole('combobox')).toHaveAttribute('aria-disabled', 'true');
  },
};
