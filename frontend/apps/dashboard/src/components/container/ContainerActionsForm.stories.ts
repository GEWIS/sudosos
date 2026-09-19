import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { createPinia, setActivePinia } from 'pinia';
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
    // ContainerActionsForm renders InputOrganSpan.vue, which unconditionally calls
    // useAuthStore() (a Pinia store) during setup. preview.ts does not install Pinia
    // app-wide -- per-story Pinia isolation/seeding is Task 5's job -- so activate a
    // throwaway, unseeded Pinia here just so that call does not throw. This story does
    // not depend on any particular auth state, so an empty store is enough. Once Task 5's
    // global per-render decorator lands, this call becomes redundant and can be removed.
    setActivePinia(createPinia());
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
