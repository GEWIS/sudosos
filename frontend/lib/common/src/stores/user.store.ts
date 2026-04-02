import { createPinia, defineStore } from 'pinia';
import type {
  BalanceResponse,
  PaginatedBaseTransactionResponse,
  PaginatedFinancialMutationResponse,
  UserResponse,
  RoleWithPermissionsResponse,
  DineroObjectRequest,
  CreateUserRequest,
  UpdateUserRequest,
} from '@gewis/sudosos-client';
import { ApiService } from '../services/ApiService';
import { fetchAllPages } from '../helpers/PaginationHelper';

createPinia();

interface CurrentState {
  balance: BalanceResponse | null;
  user: UserResponse | null;
  rolesWithPermissions: RoleWithPermissionsResponse[];
  financialMutations: PaginatedFinancialMutationResponse;
  createdTransactions: PaginatedBaseTransactionResponse;
}
interface UserModuleState {
  users: Record<number, UserResponse>;
  balances: Record<number, BalanceResponse>;
  organs: UserResponse[];
  current: CurrentState;
}

export const useUserStore = defineStore('user', {
  state: (): UserModuleState => ({
    users: {} as Record<number, UserResponse>,
    balances: {} as Record<number, BalanceResponse>,
    organs: [],
    current: {
      balance: null,
      rolesWithPermissions: [],
      user: null,
      financialMutations: {
        _pagination: {
          take: -1,
          skip: -1,
          count: -1,
        },
        records: [],
      },
      createdTransactions: {
        _pagination: {
          take: -1,
          skip: -1,
          count: -1,
        },
        records: [],
      },
    },
  }),
  getters: {
    getUserById: (state: UserModuleState) => {
      return (userId: number) => state.users[userId];
    },
    getBalanceById: (state: UserModuleState) => {
      return (userId: number) => state.balances[userId];
    },
    getAllBalances: (state: UserModuleState) => {
      return () => state.balances;
    },
    getActiveUsers(): UserResponse[] {
      return Object.values(this.users).filter((user) => user.active);
    },
    getDeletedUsers(): UserResponse[] {
      return Object.values(this.users).filter((user) => user.deleted);
    },
    getCurrentUser(): CurrentState {
      return this.current;
    },
  },
  actions: {
    async fetchUsers(service: ApiService) {
      // Fetches all users if the store is empty
      if (Object.values(this.users).length == 0) {
        this.users = await fetchAllPages<UserResponse>((take, skip) => service.user.getAllUsers({ take, skip }));
      }
    },
    async fetchAllOrgans(apiService: ApiService) {
      if (this.organs.length != 0) return this.organs;
      return fetchAllPages<UserResponse>((take, skip) =>
        apiService.user.getAllUsersOfUserType({ userType: 'ORGAN', take, skip }),
      ).then((organs) => {
        this.organs = organs;
        return this.organs;
      });
    },
    async fetchInvoiceAccountsWithBalance(service: ApiService) {
      await fetchAllPages<UserResponse>((take, skip) =>
        service.user.getAllUsers({ take, skip, active: true, ofAge: true, type: 'INVOICE' }),
      ).then((users) => {
        this.addUsers(users);
        void this.fetchUserBalances(users, service);
      });
    },
    async fetchCurrentUserBalance(id: number, service: ApiService): Promise<BalanceResponse> {
      const res = await service.balance.getBalanceId({ id });
      this.current.balance = res.data;
      return res.data;
    },
    async fetchUserBalances(users: UserResponse[], service: ApiService) {
      for (const user of users) {
        await this.fetchUserBalance(user.id, service);
      }
    },
    async fetchUserBalance(id: number, service: ApiService) {
      this.balances[id] = (await service.balance.getBalanceId({ id })).data;
    },
    async fetchUserRolesWithPermissions(id: number, service: ApiService) {
      this.current.rolesWithPermissions = (await service.user.getUserRoles({ id })).data;
    },
    async fetchUsersFinancialMutations(id: number, service: ApiService, take?: number, skip?: number) {
      this.current.financialMutations = (await service.user.getUsersFinancialMutations({ id, take, skip })).data;
    },
    async fetchUserCreatedTransactions(id: number, service: ApiService, take?: number, skip?: number) {
      const res = await service.transaction.getAllTransactions({
        createdById: id,
        excludeFromId: id,
        take,
        skip,
      });
      this.current.createdTransactions = res.data;
    },
    async fetchUserApi(service: ApiService, id: number) {
      return await service.user.updateUserKey({ id });
    },
    async waiveUserFine(id: number, amount: DineroObjectRequest, service: ApiService) {
      return service.user.waiveUserFines({ id, waiveFinesRequest: { amount } });
    },
    setCurrentUser(user: UserResponse) {
      this.current.user = user;
    },
    setCurrentRolesWithPermissions(rolesWithPermissions: RoleWithPermissionsResponse[]) {
      this.current.rolesWithPermissions = rolesWithPermissions;
    },
    addUser(user: UserResponse) {
      this.users[user.id] = user;
    },
    addUsers(users: UserResponse[]) {
      for (const user of users) {
        this.addUser(user);
      }
    },
    clearCurrent() {
      this.current.balance = null;
      this.current.user = null;
    },
    deleteUser(id: number) {
      delete this.users[id];
    },
    async removeUser(id: number, service: ApiService) {
      await service.user.deleteUser({ id });
      this.deleteUser(id);
    },
    async createUser(user: CreateUserRequest, service: ApiService): Promise<UserResponse> {
      const createdUser: UserResponse = (await service.user.createUser({ createUserRequest: user })).data;
      this.addUser(createdUser);
      return createdUser;
    },
    async updateUser(id: number, u: UpdateUserRequest, service: ApiService): Promise<UserResponse> {
      const updatedUser: UserResponse = (await service.user.updateUser({ id, updateUserRequest: u })).data;
      this.addUser(updatedUser);
      return updatedUser;
    },
  },
});
