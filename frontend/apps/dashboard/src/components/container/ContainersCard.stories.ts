import type { Meta, StoryObj } from '@storybook/vue3-vite';
import type {
  BaseUserResponse,
  BaseVatGroupResponse,
  DineroObjectResponse,
  ProductCategoryResponse,
  ProductResponse,
  RoleWithPermissionsResponse,
} from '@gewis/sudosos-client';
import ContainersCard from './ContainersCard.vue';
import type { ContainerInStore } from '@/stores/container.store';

const mockOwner: BaseUserResponse = {
  id: 1,
  firstName: 'Test',
  lastName: 'Owner',
};

const mockCategory: ProductCategoryResponse = {
  id: 1,
  name: 'Drinks',
};

const mockVat: BaseVatGroupResponse = {
  id: 1,
  percentage: 21,
  hidden: false,
};

const mockPrice: DineroObjectResponse = {
  amount: 150,
  currency: 'EUR',
  precision: 2,
};

// A container's products only render (in ContainerProductGrid, nested under an expanded
// accordion panel) when the container itself carries a products array. ContainerResponse
// does not have one. Give the "Bar" container real mock products so that grid isn't empty.
const mockProducts: ProductResponse[] = [
  {
    id: 1,
    name: 'Cola',
    revision: 1,
    priceInclVat: mockPrice,
    priceExclVat: mockPrice,
    vat: mockVat,
    owner: mockOwner,
    category: mockCategory,
    alcoholPercentage: 0,
    featured: false,
    preferred: false,
    priceList: false,
  },
  {
    id: 2,
    name: 'Beer',
    revision: 1,
    priceInclVat: mockPrice,
    priceExclVat: mockPrice,
    vat: mockVat,
    owner: mockOwner,
    category: mockCategory,
    alcoholPercentage: 5,
    featured: true,
    preferred: false,
    priceList: false,
  },
];

const mockContainers: ContainerInStore[] = [
  { id: 1, name: 'Bar', public: true, owner: mockOwner, products: mockProducts },
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
