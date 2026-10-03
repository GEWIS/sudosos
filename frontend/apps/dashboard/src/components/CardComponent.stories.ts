import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import { mockRouter } from '../../.storybook/mockRouter';
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('CONTAINERS')).toBeVisible();
    await expect(canvas.getByText('Card body content')).toBeVisible();
  },
};

export const WithRouterLink: Story = {
  ...Default,
  args: {
    header: 'Containers',
    routerLink: 'mock-route',
    routerParams: { id: '1' },
    action: 'View all',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'VIEW ALL' }));
    await expect(mockRouter.currentRoute.value.name).toBe('mock-route');
    await expect(mockRouter.currentRoute.value.params.id).toBe('1');
    // mockRouter is a shared singleton across every story (see the dashboard README), so put it back.
    await mockRouter.push('/');
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Custom footer')).toBeVisible();
  },
};
