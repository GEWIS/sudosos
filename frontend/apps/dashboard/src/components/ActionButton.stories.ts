import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import ActionButton from './ActionButton.vue';

const meta: Meta<typeof ActionButton> = {
  component: ActionButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A PrimeVue button that reflects the outcome of an async action. Set `submitting` while the action is in flight to show a spinner, then set `result` to `true` or `false` once it resolves to flash success or danger styling. `result` stays unset before the first attempt, rendering as a plain primary button.',
      },
    },
  },
  argTypes: {
    label: {
      description: 'Button text.',
    },
    submitting: {
      description: "Shows a spinner and PrimeVue's loading state while `true`.",
    },
    result: {
      description:
        'Outcome of the last attempt: `true` flashes success (green check), `false` flashes danger (red X). Leave unset before the first attempt.',
    },
    // Vue's component typing wants the emit's argType key as `onClick`, but
    // the docgen table displays it under the raw emit name `click` -- keying
    // by `click` here (against the stricter inferred type) keeps one row
    // instead of two.
    click: {
      description: 'Emitted when the button is clicked.',
      table: { category: 'events' },
    },
  } as Meta<typeof ActionButton>['argTypes'],
  args: {
    label: 'Save',
  },
};
export default meta;

type Story = StoryObj<typeof ActionButton>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Click the button to see the full lifecycle a real parent component drives: submitting for a second, then success.',
      },
    },
  },
  render: (args) => ({
    components: { ActionButton },
    setup() {
      const submitting = ref(false);
      const result = ref<boolean | null>(null);
      const handleClick = () => {
        submitting.value = true;
        result.value = null;
        setTimeout(() => {
          submitting.value = false;
          result.value = true;
        }, 1000);
      };
      return { args, submitting, result, handleClick };
    },
    template: '<ActionButton v-bind="args" :submitting="submitting" :result="result" @click="handleClick" />',
  }),
};

export const Submitting: Story = {
  args: { submitting: true },
};

export const WithResult: Story = {
  args: { result: true },
};
