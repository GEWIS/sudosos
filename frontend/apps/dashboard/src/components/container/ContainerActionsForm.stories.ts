import type { Meta, StoryObj } from '@storybook/vue3-vite';
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
};

export const Editable: Story = {
  render,
  args: { isEditable: true, isOrganEditable: false },
};

export const ReadOnly: Story = {
  render,
  args: { isEditable: false, isOrganEditable: false },
};
