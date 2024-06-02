import { createPinia, defineStore } from 'pinia';
import {
  BalanceResponse, PaginatedFinancialMutationResponse,
  UserResponse
} from "@sudosos/sudosos-client";
import { ApiService } from "../services/ApiService";
import { fetchAllPages } from "../helpers/PaginationHelper";

const pinia = createPinia();

interface CurrentState {
  balance: BalanceResponse | null,
  user: UserResponse | null,
  financialMutations: PaginatedFinancialMutationResponse
}
interface UserModuleState {
  users: UserResponse[];
  current: CurrentState
}

export const useUserStore = defineStore('user', {
  state: (): UserModuleState => ({
    users: [],
    current: {
      balance: null,
      user: null,
      financialMutations: {
        _pagination: {
          take: -1,
          skip: -1,
          count: -1,
        },
        records: [],
      }
    },
  }),
  getters: {
    getUserById: (state: UserModuleState) => {
      return (userId: number) => state.users.find((user) => user.id === userId)
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
      // @ts-ignore TODO Fix Swagger
      this.users = await fetchAllPages<UserResponse>(0, 500, (take, skip) => service.user.getAllUsers(take, skip));
    },
    async fetchCurrentUserBalance(id: number, service: ApiService) {
      this.current.balance = (await service.balance.getBalanceId(id)).data
    },
    async fetchUsersFinancialMutations(id: number, service: ApiService, take?: number, skip?: number) {
      this.current.financialMutations = (await service.user.getUsersFinancialMutations(id, take, skip)).data;
    },
    setCurrentUser(user: UserResponse) {
      this.current.user = user;
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
