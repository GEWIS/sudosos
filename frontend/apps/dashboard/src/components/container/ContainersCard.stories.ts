import type { Meta, StoryObj } from '@storybook/vue3-vite';
import type { BaseUserResponse, ContainerResponse, RoleWithPermissionsResponse } from '@gewis/sudosos-client';
import ContainersCard from './ContainersCard.vue';

const mockOwner: BaseUserResponse = {
  id: 1,
  firstName: 'Test',
  lastName: 'Owner',
};

const mockContainers: ContainerResponse[] = [
  { id: 1, name: 'Bar', public: true, owner: mockOwner },
  { id: 2, name: 'Kitchen', public: false, owner: mockOwner },
];

const fullContainerPermissionsRole: RoleWithPermissionsResponse = {
  id: 1,
  name: 'Mock full-access role',
  systemDefault: false,
  userTypes: [],
  permissions: [
    {
      entity: 'Container',
      actions: [
        { action: 'create', relations: [{ relation: 'own', attributes: ['*'] }] },
        { action: 'update', relations: [{ relation: 'own', attributes: ['*'] }] },
      ],
    },
  ],
};

const meta: Meta<typeof ContainersCard> = {
  component: ContainersCard,
  args: {
    showCreate: true,
  },
};
export default meta;

type Story = StoryObj<typeof ContainersCard>;

export const Default: Story = {
  args: {
    containers: mockContainers,
  },
};

export const Empty: Story = {
  args: {
    containers: [],
  },
};

export const WithPermissions: Story = {
  args: {
    containers: mockContainers,
  },
  parameters: {
    pinia: {
      initialState: {
        user: { current: { rolesWithPermissions: [fullContainerPermissionsRole] } },
      },
    },
  },
};
