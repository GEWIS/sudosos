import { createPinia, defineStore } from 'pinia';
import {
  BalanceResponse, PaginatedBaseTransactionResponse, PaginatedFinancialMutationResponse,
  UserResponse, RoleWithPermissionsResponse, GewisUserResponse, DineroObjectRequest
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
  users: Record<number, UserResponse>;
  balances: Record<number, BalanceResponse>;
  organs: UserResponse[];
  current: CurrentState
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
      if(Object.values(this.users).length == 0) {
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
    async fetchUserBalance(id: number, service: ApiService) {
      this.balances[id] = (await service.balance.getBalanceId(id)).data;
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
          await service.user.getUsersTransactions(
              id, undefined,
              id, undefined, undefined, undefined, undefined, undefined,
              take, skip)
      ).data;
    },
    async fetchGewisUser(id: number, service: ApiService): Promise<GewisUserResponse> {
      return service.user.getIndividualUser(id).then((res) => {
        this.current.user = res.data;
        return res.data as GewisUserResponse;
      });
    },
    async fetchUserApi(service: ApiService, id: number){
      return (await service.user.updateUserKey(id));
    },
    async waiveUserFine(id: number, amount: DineroObjectRequest, service: ApiService) {
      return service.user.waiveUserFines(id, {
        amount
      });
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
    clearCurrent() {
      this.current.balance = null;
      this.current.user = null;
    },
    deleteUser(id: number) {
      delete this.users[id];
    },
  },
});
