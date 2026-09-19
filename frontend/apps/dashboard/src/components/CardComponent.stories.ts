import type { Meta, StoryObj } from '@storybook/vue3-vite';
import CardComponent from './CardComponent.vue';

const meta: Meta<typeof CardComponent> = {
  component: CardComponent,
  args: {
    header: 'Containers',
  },
};
export default meta;

type Story = StoryObj<typeof CardComponent>;

export const Default: Story = {
  render: (args) => ({
    components: { CardComponent },
    setup() {
      return { args };
    },
    template: `<CardComponent v-bind="args">Card body content</CardComponent>`,
  }),
};

export const WithRouterLink: Story = {
  ...Default,
  args: {
    header: 'Containers',
    routerLink: 'mock-route',
    routerParams: { id: '1' },
    action: 'View all',
  },
};

export const WithFooterSlot: Story = {
  render: (args) => ({
    components: { CardComponent },
    setup() {
      return { args };
    },
    template: `
      <CardComponent v-bind="args">
        Card body content
        <template #footer>
          <div class="p-2 text-center text-sm">Custom footer</div>
        </template>
      </CardComponent>
    `,
  }),
};
