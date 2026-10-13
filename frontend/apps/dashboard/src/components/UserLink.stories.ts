import type { Meta, StoryObj } from '@storybook/vue3-vite';
import type { BaseUserResponse, RoleWithPermissionsResponse } from '@gewis/sudosos-client';
import { expect, within } from 'storybook/test';
import UserLink from './UserLink.vue';

const mockUser: BaseUserResponse = {
  id: 2,
  firstName: 'Ada',
  lastName: 'Lovelace',
};

// isAllowed always checks the 'all' relation in addition to whatever relation the
// viewer actually has (see getRelation in permissionUtil.ts), so granting it here
// covers both "viewing someone else" and "viewing yourself" stories below.
const balanceReadRole: RoleWithPermissionsResponse = {
  id: 1,
  name: 'Mock balance-read role',
  systemDefault: false,
  userTypes: [],
  permissions: [
    {
      entity: 'Balance',
      actions: [{ action: 'get', relations: [{ relation: 'all', attributes: ['*'] }] }],
    },
  ],
};

const meta: Meta<typeof UserLink> = {
  component: UserLink,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "A link to a user's profile page. Renders as plain, non-clickable text when the viewer lacks permission to see that user's balance, and shows \"You\" instead of the name when linking to the viewer's own profile.",
      },
    },
  },
  argTypes: {
    user: {
      description: 'The user to link to.',
    },
    newTab: {
      description: 'Opens the link in a new tab when true.',
    },
  },
  args: {
    user: mockUser,
  },
};
export default meta;

type Story = StoryObj<typeof UserLink>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
    await expect(canvas.getByText('Ada Lovelace')).toBeVisible();
  },
};

export const AsLink: Story = {
  parameters: {
    docs: {
      description: {
        story: "With permission to view the user's balance, this renders as a real, navigable link.",
      },
    },
    pinia: {
      initialState: {
        user: { current: { rolesWithPermissions: [balanceReadRole] } },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Ada Lovelace' })).toHaveAttribute('href', '/user/2');
  },
};

export const ViewingYourself: Story = {
  parameters: {
    docs: {
      description: {
        story: 'When the linked user is the viewer themselves, the label reads "You" instead of their name.',
      },
    },
    pinia: {
      initialState: {
        user: { current: { rolesWithPermissions: [balanceReadRole] } },
        auth: { user: { id: mockUser.id }, organs: [] },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'You' })).toHaveAttribute('href', '/user/2');
  },
};
