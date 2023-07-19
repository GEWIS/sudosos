import {createPinia, defineStore} from 'pinia';
import ApiService from '@/services/ApiService';
import {
  BalanceResponse,
  UserResponse
} from "@sudosos/sudosos-client";
import {fetchAllPages} from "sudosos-frontend-common";

const pinia = createPinia();

interface CurrentState {
  balance: BalanceResponse | null,
  user: UserResponse | null,
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
    },
  }),
  getters: {
    getUserById: (state) => (id: number): UserResponse | undefined => {
      return state.users.find((user) => user.id === id);
    },
    getActiveUsers: (state) => (): UserResponse[] => {
      return state.users.filter((user) => user.active);
    },
    getDeletedUsers: (state) => (): UserResponse[] => {
      return state.users.filter((user) => user.deleted);
    },
    getCurrentUser: (state) => (): CurrentState => {
      return state.current;
    }
  },
  actions: {
    async fetchUsers() {
      // @ts-ignore TODO Fix Swagger
      this.users = await fetchAllPages<UserResponse>(0, 500, (take, skip) => ApiService.user.getAllUsers(take, skip));
    },
    async fetchCurrentUserBalance(id: number) {
      this.current.balance = (await ApiService.balance.getBalanceId(id)).data
    },
    setCurrentUser(user: UserResponse) {
      this.current.user = user;
    },
    addUser(user: UserResponse) {
      this.users.push(user);
    },
    deleteUser(id: number) {
      const index = this.users.findIndex((user) => user.id === id);
      if (index !== -1) {
        this.users.splice(index, 1);
      }
    },
  },
});
