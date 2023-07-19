import { defineStore } from 'pinia';
import {
  AuthenticationResponse,
  GEWISAuthenticationPinRequest,
  UserResponse
} from "@sudosos/sudosos-client";
import ApiService from "../services/ApiService";
import {AxiosResponse} from "axios";
import {useUserStore} from "./user.store";

interface AuthStoreState {
  user: UserResponse | null,
  roles: string[],
  organs: UserResponse[],
  token: string | null,
  acceptedToS: string | null,

}
export const useAuthStore = defineStore({
  id: 'auth',
  state: (): AuthStoreState => ({
    user: null,
    roles: [],
    token: null,
    organs: [],
    acceptedToS: null,
  }),
  getters: {
    getToken(): string | null {
      return this.token;
    },
    getToS(): string | null {
      return this.acceptedToS;
    },
    getUser(): UserResponse | null {
      return this.user;
    }
  },
  actions: {
    async pinlogin(userId: string, pinCode: string, service: ApiService) {
      const userDetails: GEWISAuthenticationPinRequest = {
        gewisId: parseInt(userId, 10),
        pin: pinCode,
      };

      await service.authenticate.gewisPinAuthentication(userDetails).then((res) => {
        const { user, token, roles,organs, acceptedToS} = res.data;
        if ( !user || !token || !roles || !organs || !acceptedToS) return
        this.user = user;
        this.token = token;
        this.roles = roles;
        this.organs = organs;
        this.acceptedToS = acceptedToS;
        service.user.getIndividualUser(this.user.id).then((res) => {
          const userStore = useUserStore();
          userStore.setCurrentUser(res.data)
        })
      })
    },
    logout() {
      this.user = null;
    }
  }
});
