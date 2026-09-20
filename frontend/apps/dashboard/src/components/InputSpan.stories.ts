import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import InputSpan from './InputSpan.vue';

const meta: Meta<typeof InputSpan> = {
  component: InputSpan,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A labeled input row that renders one of several PrimeVue widgets depending on `type`: a text field, a textarea, a date picker, a currency or percentage number input, a password or pin field, a boolean toggle, or a user-type select. Pairs with a vee-validate `errors` string to show inline validation state.',
      },
    },
  },
  argTypes: {
    label: {
      description: 'Text shown next to (or above, if `column`) the input.',
    },
    value: {
      description:
        'Current value. Its type follows `type`: string for text-like fields, number for currency/percentage/number, boolean for the toggle.',
    },
    errors: {
      description:
        "Validation error message. Shown below the input, or as the input's placeholder if `inlineError` is set.",
    },
    placeholder: {
      description: 'Placeholder text shown when the field is empty.',
    },
    type: {
      description: 'Which field widget to render.',
      control: 'select',
      options: [
        'text',
        'textarea',
        'date',
        'currency',
        'percentage',
        'pin',
        'password',
        'boolean',
        'usertype',
        'usertypecreate',
        'number',
      ],
    },
    disabled: {
      description: 'Disables the input.',
    },
    column: {
      description: 'Stacks the label above the input instead of placing them side by side.',
    },
    inlineError: {
      description: "Shows the error message as the input's placeholder instead of below it.",
    },
    suffix: {
      description: 'Text appended after the value. Only used by the `number` type.',
    },
    // Vue's component typing wants the emit's argType key as `onUpdate:value`, but
    // the docgen table displays it under the raw emit name `update:value` -- keying
    // by `update:value` here (against the stricter inferred type) keeps one row
    // instead of two.
    'update:value': {
      description: 'Emitted with the new value whenever the input changes.',
      table: { category: 'events' },
    },
  } as Meta<typeof InputSpan>['argTypes'],
  args: {
    label: 'Name',
    type: 'text',
  },
};
export default meta;

type Story = StoryObj<typeof InputSpan>;

export const Default: Story = {
  args: {
    label: 'Name',
    type: 'text',
    value: 'Ada Lovelace',
    placeholder: 'Enter a name',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox')).toHaveValue('Ada Lovelace');
  },
};

export const Currency: Story = {
  args: {
    label: 'Price',
    type: 'currency',
    value: 12.5,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole<HTMLInputElement>('spinbutton');
    // nl-NL currency formatting inserts a non-ASCII space after the symbol; \s matches it too.
    await expect(input.value.replace(/\s/g, ' ')).toBe('€ 12,50');
  },
};

export const Boolean: Story = {
  args: {
    label: 'Active',
    type: 'boolean',
    value: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('switch')).toBeChecked();
  },
};

export const Date: Story = {
  args: {
    label: 'Birthday',
    type: 'date',
    value: '1990-01-15',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');
    await expect(input).toHaveValue('01/15/1990');
    // Typing into the field, not only picking from the calendar, keeps the component
    // rendered. The exact masked text after one keystroke is not worth pinning down.
    await userEvent.type(input, '1');
    await expect(canvas.getByRole('combobox')).toBeVisible();
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    type: 'text',
    value: '',
    errors: 'This field is required',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('This field is required')).toBeVisible();
  },
};
