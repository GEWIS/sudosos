import { createPinia, defineStore } from 'pinia';
import {
  BalanceResponse, PaginatedBaseTransactionResponse, PaginatedFinancialMutationResponse,
  UserResponse, RoleWithPermissionsResponse
} from "@sudosos/sudosos-client";
import { ApiService } from "../services/ApiService";
import { fetchAllPages } from "../helpers/PaginationHelper";

createPinia();

interface CurrentState {
  balance: BalanceResponse | null,
  user: UserResponse | null,
  rolesWithPermissions: RoleWithPermissionsResponse[],
  financialMutations: PaginatedFinancialMutationResponse,
  createdTransactions: PaginatedBaseTransactionResponse
}
interface UserModuleState {
  users: UserResponse[];
  organs: UserResponse[];
  current: CurrentState
}

export const useUserStore = defineStore('user', {
  state: (): UserModuleState => ({
    users: [],
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
      return (userId: number) => state.users.find((user) => user.id === userId);
    },
    getActiveUsers(): UserResponse[] {
      return this.users.filter((user) => user.active);
    },
    getDeletedUsers(): UserResponse[] {
      return this.users.filter((user) => user.deleted);
    },
    getCurrentUser(): CurrentState {
      return this.current;
    },
  },
  actions: {
    async fetchUsers(service: ApiService) {
      // Fetches all users if the store is empty
      if(this.users.length == 0) {
        this.users = await fetchAllPages<UserResponse>((take, skip) =>
            service.user.getAllUsers(take, skip)
        );
      }
    },
    async fetchAllOrgans(apiService: ApiService) {
      if (this.organs.length != 0) return this.organs;
      return fetchAllPages<UserResponse>(
          (take, skip) => apiService.user.getAllUsersOfUserType("ORGAN", take, skip))
            .then((organs) => {
              this.organs = organs;
              return this.organs;
            });
    },
    async fetchCurrentUserBalance(id: number, service: ApiService) {
      this.current.balance = (await service.balance.getBalanceId(id)).data;
    },
    async fetchUserRolesWithPermissions(id: number, service: ApiService) {
      this.current.rolesWithPermissions = (await service.user.getUserRoles(id)).data;
    },
    async fetchUsersFinancialMutations(
      id: number,
      service: ApiService,
      take?: number,
      skip?: number
    ) {
      this.current.financialMutations = (
        await service.user.getUsersFinancialMutations(id, undefined,undefined, take, skip)
      ).data;
    },
    async fetchUserCreatedTransactions(
      id: number,
      service: ApiService,
      take?: number,
      skip?: number
    ) {
      this.current.createdTransactions = (
        await service.transaction.getAllTransactions(undefined, id, undefined, undefined,undefined,undefined,undefined,undefined,take, skip)
      ).data;
    },
    setCurrentUser(user: UserResponse) {
      this.current.user = user;
    },
    setCurrentRolesWithPermissions(rolesWithPermissions: RoleWithPermissionsResponse[]) {
      this.current.rolesWithPermissions = rolesWithPermissions;
    },
    addUser(user: UserResponse) {
      this.users.push(user);
    },
    clearCurrent() {
      this.current.balance = null;
      this.current.user = null;
    },
    deleteUser(id: number) {
      const index = this.users.findIndex((user) => user.id === id);
      if (index !== -1) {
        this.users.splice(index, 1);
      }
    },
  },
});
