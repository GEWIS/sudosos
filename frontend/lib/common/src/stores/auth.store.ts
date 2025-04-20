import { defineStore } from 'pinia';
import {
  AuthenticationEanRequest,
  AuthenticationKeyRequest,
  AuthenticationLDAPRequest,
  AuthenticationPinRequest,
  AuthenticationResponse,
  GEWISAuthenticationPinRequest,
  GewiswebAuthenticationRequest,
  UpdatePinRequest,
  UpdateLocalRequest,
  UserResponse,
  UpdateNfcRequest,
  AcceptTosRequest,
  AuthenticationNfcRequest,
} from '@sudosos/sudosos-client';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { ApiService } from '../services/ApiService';
import { clearTokenInStorage, getTokenFromStorage, setTokenInStorage } from '../helpers/TokenHelper';
import { useUserStore } from './user.store';

interface AuthStoreState {
  user: UserResponse | null;
  organs: UserResponse[];
  token: string | null;
  acceptedToS: string | null;
}
export const useAuthStore = defineStore({
  id: 'auth',
  state: (): AuthStoreState => ({
    user: null,
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
    },
    getOrgans(): UserResponse[] | null {
      return this.organs;
    },
  },
  actions: {
    handleResponse(res: AuthenticationResponse) {
      const { user, token, rolesWithPermissions, organs, acceptedToS } = res;
      if (!user || !token || !rolesWithPermissions || !organs || !acceptedToS) return;
      this.user = user;
      this.token = token;
      setTokenInStorage(this.token);
      this.organs = organs;
      this.acceptedToS = acceptedToS;
      if (this.acceptedToS === 'ACCEPTED') {
        const userStore = useUserStore();
        userStore.setCurrentUser(user);
        userStore.setCurrentRolesWithPermissions(rolesWithPermissions);
      }
    },

    async gewisPinlogin(userId: string, pinCode: string, service: ApiService) {
      const userDetails: GEWISAuthenticationPinRequest = {
        gewisId: parseInt(userId, 10),
        pin: pinCode,
      };

      await service.authenticate.gewisPinAuthentication(userDetails).then((res) => {
        this.handleResponse(res.data);
      });
    },
    async ldapLogin(accountName: string, password: string, service: ApiService) {
      const req: AuthenticationLDAPRequest = {
        accountName,
        password,
      };
      await service.authenticate.ldapAuthentication(req).then((res) => {
        this.handleResponse(res.data);
      });
    },
    async gewisWebLogin(nonce: string, token: string, service: ApiService) {
      const req: GewiswebAuthenticationRequest = {
        nonce,
        token,
      };
      await service.authenticate.gewisWebAuthentication(req).then((res) => {
        this.handleResponse(res.data);
      });
    },
    async externalPinLogin(userId: number, pin: string, service: ApiService) {
      const req: AuthenticationPinRequest = {
        pin,
        userId,
      };
      await service.authenticate.pinAuthentication(req).then((res) => {
        this.handleResponse(res.data);
      });
    },
    async nfcLogin(nfcCode: string, service: ApiService) {
      const req: AuthenticationNfcRequest = {
        nfcCode,
      };
      await service.authenticate.nfcAuthentication(req).then((res) => {
        this.handleResponse(res.data);
      });
    },
    async eanLogin(eanCode: string, service: ApiService) {
      const req: AuthenticationEanRequest = {
        eanCode,
      };
      await service.authenticate.eanAuthentication(req).then((res) => {
        this.handleResponse(res.data);
      });
    },
    async apiKeyLogin(key: string, userId: number, service: ApiService) {
      const req: AuthenticationKeyRequest = {
        key,
        userId,
      };

      await service.authenticate.keyAuthentication(req).then((res) => {
        this.handleResponse(res.data);
      });
    },
    async gewisLdapLogin(accountName: string, password: string, service: ApiService) {
      const req: AuthenticationLDAPRequest = {
        accountName,
        password,
      };
      await service.authenticate.gewisLDAPAuthentication(req).then((res) => {
        this.handleResponse(res.data);
      });
    },
    async updateUserPin(pin: string, service: ApiService) {
      if (!this.user) return;
      const req: UpdatePinRequest = {
        pin,
      };
      await service.user.updateUserPin(this.user.id, req);
    },
    async updateUserLocalPassword(password: string, service: ApiService) {
      if (!this.user) return;
      const req: UpdateLocalRequest = {
        password,
      };
      await service.user.updateUserLocalPassword(this.user.id, req);
    },
    async updateUserNfc(nfcCode: string, service: ApiService) {
      if (!this.user) return;
      const req: UpdateNfcRequest = {
        nfcCode,
      };
      await service.user.updateUserNfc(this.user.id, req);
    },
    async updateUserKey(service: ApiService) {
      if (!this.user) return;
      return (await service.user.updateUserKey(this.user.id)).data;
    },
    async refreshToken(service: ApiService) {
      return service.authenticate.refreshToken().then((res) => {
        this.handleResponse(res.data);
      });
    },
    async updateUserToSAccepted(extensiveDataProcessing: boolean, service: ApiService) {
      if (!this.user) return;
      const req: AcceptTosRequest = {
        extensiveDataProcessing: extensiveDataProcessing,
      };
      await service.user.acceptTos(req);
      await this.refreshToken(service);
      return;
    },
    extractStateFromToken() {
      const token = getTokenFromStorage();
      if (!token.token) return;
      const decoded = jwtDecode<JwtPayload>(token.token) as AuthStoreState;
      this.user = decoded.user;
      this.token = token.token;
      this.organs = decoded.organs;
      this.acceptedToS = decoded.acceptedToS;
    },
    logout() {
      this.user = null;
      this.token = null;
      this.organs = [];
      this.acceptedToS = null;

      clearTokenInStorage();
    },
  },
});
