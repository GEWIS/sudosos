import { defineStore } from 'pinia';
import {
  AuthenticationEanRequest, AuthenticationKeyRequest,
  AuthenticationLDAPRequest, AuthenticationPinRequest,
  AuthenticationResponse,
  GEWISAuthenticationPinRequest, GewiswebAuthenticationRequest, UpdatePinRequest,
  UpdateLocalRequest,
  UserResponse, UpdateNfcRequest, AcceptTosRequest
} from "@sudosos/sudosos-client";
import { useUserStore } from "./user.store";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { ApiService } from "../services/ApiService";
import { clearTokenInStorage, getTokenFromStorage, setTokenInStorage, updateTokenIfNecessary } from "../helpers/TokenHelper";

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
    handleResponse(res: AuthenticationResponse, service: ApiService) {
      const { user, token, roles,organs, acceptedToS } = res;
      if ( !user || !token || !roles || !organs || !acceptedToS) return
      this.user = user;
      this.token = token;
      setTokenInStorage(this.token);
      this.roles = roles;
      this.organs = organs;
      this.acceptedToS = acceptedToS;
      if (this.acceptedToS === "ACCEPTED") {
        service.user.getIndividualUser(this.user.id).then((res) => {
          const userStore = useUserStore();
          userStore.setCurrentUser(res.data)
        });
      }
    },
    async gewisPinlogin(userId: string, pinCode: string, service: ApiService) {
      const userDetails: GEWISAuthenticationPinRequest = {
        gewisId: parseInt(userId, 10),
        pin: pinCode,
      };

      await service.authenticate.gewisPinAuthentication(userDetails).then((res) => {
        this.handleResponse(res.data, service)
      })
    },
    async ldapLogin(accountName: string, password: string, service: ApiService) {
      const req: AuthenticationLDAPRequest = {
        accountName,
        password
      }
      await service.authenticate.ldapAuthentication(req).then((res) => {
        this.handleResponse(res.data, service)
      })
    },
    async gewisWebLogin(nonce: string, token: string, service: ApiService) {
      const req: GewiswebAuthenticationRequest = {
        nonce, token
      }
      await service.authenticate.gewisWebAuthentication(req).then((res) => {
        this.handleResponse(res.data, service)
      })
    },
    async externalPinLogin(userId: number, pin: string, service: ApiService) {
      const req: AuthenticationPinRequest = {
        pin, userId
      }
      await service.authenticate.pinAuthentication(req).then((res) => {
        this.handleResponse(res.data, service)
      })
    },
    async eanLogin(eanCode: string, service: ApiService) {
      const req: AuthenticationEanRequest = {
        eanCode
      }
      await service.authenticate.eanAuthentication(req).then((res) => {
        this.handleResponse(res.data, service)
      })
    },
    async apiKeyLogin(key: string, userId: number, service: ApiService) {
      const req: AuthenticationKeyRequest = {
        key, userId
      }

      await service.authenticate.keyAuthentication(req).then((res) => {
        this.handleResponse(res.data, service)
      })
    },
    async gewisLdapLogin(accountName: string, password: string, service: ApiService) {
      const req: AuthenticationLDAPRequest = {
        accountName,
        password
      }
      await service.authenticate.gewisLDAPAuthentication(req).then((res) => {
        this.handleResponse(res.data, service)
      })
    },
    async updateUserPin(pin: string, service: ApiService) {
      if (!this.user) return;
      const req: UpdatePinRequest = {
        pin
      }
      await service.user.updateUserPin(this.user.id, req)
    },
    async updateUserLocalPassword(password: string, service: ApiService) {
      if (!this.user) return;
      const req: UpdateLocalRequest = {
        password
      }
      await service.user.updateUserLocalPassword(this.user.id, req)
    },
    async updateUserNfc(nfcCode: string, service: ApiService) {
      if (!this.user) return;
      const req: UpdateNfcRequest = {
        nfcCode
      }
      await service.user.updateUserNfc(this.user.id, req)
    },
    async updateUserKey(service: ApiService) {
      if (!this.user) return;
      return (await service.user.updateUserKey(this.user.id)).data
    },
    async updateUserToSAccepted(extensiveDataProcessing: boolean, service: ApiService) {
      if (!this.user) return;
      const req: AcceptTosRequest = {
        extensiveDataProcessing: extensiveDataProcessing
      }
      await service.user.acceptTos(req);
      const res = await service.authenticate.refreshToken();
      this.handleResponse(res.data, service);
      return;
    },
    extractStateFromToken() {
      const token = getTokenFromStorage();
      if (!token.token) return;
      const decoded = jwtDecode<JwtPayload>(token.token) as AuthStoreState;
      this.user = decoded.user;
      this.roles = decoded.roles;
      this.token = token.token;
      this.organs = decoded.organs;
      this.acceptedToS = decoded.acceptedToS;
    },
    logout() {
      this.user = null;
      this.roles = [];
      this.token = null;
      this.organs = [];
      this.acceptedToS = null;

      clearTokenInStorage();
    }
  }
});
