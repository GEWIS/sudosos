import { defineStore } from 'pinia';
import type {
  AuthenticationEanRequest,
  AuthenticationKeyRequest,
  AuthenticationLDAPRequest,
  AuthenticationPinRequest,
  AuthenticationResponse,
  MemberAuthenticationPinRequest,
  GewiswebAuthenticationRequest,
  UpdatePinRequest,
  UpdateLocalRequest,
  UserResponse,
  UpdateNfcRequest,
  AcceptTosRequest,
  AuthenticationNfcRequest,
  AuthenticationLocalRequest,
} from '@gewis/sudosos-client';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { ApiService } from '../services/ApiService';
import { clearTokenInStorage, getTokenFromStorage, setTokenInStorage } from '../helpers/TokenHelper';
import { useUserStore } from './user.store';
import { useUserSettingsStore } from './userSettings.store';

// Event emitter for authentication events
class AuthEventEmitter {
  private listeners: Array<(user: UserResponse) => void> = [];

  onAuthenticated(callback: (user: UserResponse) => void) {
    this.listeners.push(callback);
  }

  offAuthenticated(callback: (user: UserResponse) => void) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  emitAuthenticated(user: UserResponse) {
    this.listeners.forEach((callback) => {
      callback(user);
    });
  }
}

export const authEventEmitter = new AuthEventEmitter();

interface AuthStoreState {
  user: UserResponse | null;
  organs: UserResponse[];
  token: string | null;
  acceptedToS: string | null;
}
export const useAuthStore = defineStore('auth', {
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
    handleResponse(res: AuthenticationResponse, service: ApiService) {
      const { user, token, rolesWithPermissions, organs, acceptedToS } = res;
      if (!user || !token || !rolesWithPermissions || !organs || !acceptedToS) return;
      this.user = user;
      this.token = token;
      setTokenInStorage(this.token, service.tokenKey);
      this.organs = organs;
      this.acceptedToS = acceptedToS;
      if (this.acceptedToS === 'ACCEPTED') {
        const userStore = useUserStore();
        void userStore.fetchCurrentUserBalance(user.id, service);
        userStore.setCurrentUser(user);
        userStore.setCurrentRolesWithPermissions(rolesWithPermissions);

        // Emit authentication event for dashboard-specific logic
        authEventEmitter.emitAuthenticated(user);
      }
    },

    async gewisPinlogin(userId: string, pinCode: string, posId: number, posService: ApiService, service: ApiService) {
      const req: MemberAuthenticationPinRequest = {
        memberId: parseInt(userId, 10),
        pin: pinCode,
        posId,
      };

      await posService.authenticate.memberPINAuthentication({ memberAuthenticationPinRequest: req }).then((res) => {
        this.handleResponse(res.data, service);
      });
    },
    async nfcLogin(nfcCode: string, posId: number, posService: ApiService, service: ApiService) {
      const req: AuthenticationNfcRequest = {
        nfcCode,
        posId,
      };

      await posService.authenticate.nfcAuthentication({ authenticationNfcRequest: req }).then((res) => {
        this.handleResponse(res.data, service);
      });
    },
    async ldapLogin(accountName: string, password: string, service: ApiService) {
      const req: AuthenticationLDAPRequest = {
        accountName,
        password,
      };
      await service.authenticate.ldapAuthentication({ authenticationLDAPRequest: req }).then((res) => {
        this.handleResponse(res.data, service);
      });
    },
    async gewisWebLogin(nonce: string, token: string, service: ApiService) {
      const req: GewiswebAuthenticationRequest = {
        nonce,
        token,
      };
      await service.authenticate.gewisWebAuthentication({ gewiswebAuthenticationRequest: req }).then((res) => {
        this.handleResponse(res.data, service);
      });
    },
    async externalPinLogin(
      userId: string,
      pinCode: string,
      posId: number,
      posService: ApiService,
      service: ApiService,
    ) {
      const req: AuthenticationPinRequest = {
        userId: parseInt(userId, 10),
        pin: pinCode,
        posId,
      };

      await posService.authenticate.pinAuthentication({ authenticationPinRequest: req }).then((res) => {
        this.handleResponse(res.data, service);
      });
    },
    async eanLogin(eanCode: string, posId: number, posService: ApiService, service: ApiService) {
      const req: AuthenticationEanRequest = {
        eanCode,
        posId,
      };
      await posService.authenticate.eanAuthentication({ authenticationEanRequest: req }).then((res) => {
        this.handleResponse(res.data, service);
      });
    },
    async apiKeyLogin(key: string, userId: number, service: ApiService) {
      const req: AuthenticationKeyRequest = {
        key,
        userId,
      };

      await service.authenticate.keyAuthentication({ authenticationKeyRequest: req }).then((res) => {
        this.handleResponse(res.data, service);
      });
    },
    async gewisLdapLogin(accountName: string, password: string, service: ApiService) {
      const req: AuthenticationLDAPRequest = {
        accountName,
        password,
      };
      await service.authenticate.gewisLDAPAuthentication({ authenticationLDAPRequest: req }).then((res) => {
        this.handleResponse(res.data, service);
      });
    },
    async localLogin(accountMail: string, password: string, service: ApiService) {
      const req: AuthenticationLocalRequest = {
        accountMail,
        password,
      };
      await service.authenticate.localAuthentication({ authenticationLocalRequest: req }).then((res) => {
        this.handleResponse(res.data, service);
      });
    },
    async updateUserPin(pin: string, service: ApiService) {
      if (!this.user) return;
      const req: UpdatePinRequest = {
        pin,
      };
      await service.user.updateUserPin({ id: this.user.id, updatePinRequest: req });
    },
    async updateUserLocalPassword(password: string, service: ApiService) {
      if (!this.user) return;
      const req: UpdateLocalRequest = {
        password,
      };
      await service.user.updateUserLocalPassword({ id: this.user.id, updateLocalRequest: req });
    },
    async updateUserNfc(nfcCode: string, service: ApiService) {
      if (!this.user) return;
      const req: UpdateNfcRequest = {
        nfcCode,
      };
      await service.user.updateUserNfc({ id: this.user.id, updateNfcRequest: req });
    },
    async updateUserKey(service: ApiService) {
      if (!this.user) return;
      return (await service.user.updateUserKey({ id: this.user.id })).data;
    },
    async refreshToken(service: ApiService) {
      return service.authenticate.refreshToken().then((res) => {
        this.handleResponse(res.data, service);
      });
    },
    async updateUserToSAccepted(extensiveDataProcessing: boolean, version: string, service: ApiService) {
      if (!this.user) return;
      const req: AcceptTosRequest = {
        extensiveDataProcessing: extensiveDataProcessing,
        version: version,
      };
      await service.user.acceptTos({ acceptTosRequest: req });
      await this.refreshToken(service);
      return;
    },
    extractStateFromToken(tokenKey: string = 'jwt_token') {
      const token = getTokenFromStorage(tokenKey);
      if (!token.token) return;
      const decoded = jwtDecode<JwtPayload>(token.token) as AuthStoreState;
      this.user = decoded.user;
      this.token = token.token;
      this.organs = decoded.organs;
      this.acceptedToS = decoded.acceptedToS;
      if (this.user) authEventEmitter.emitAuthenticated(this.user);
    },
    logout(tokenKey: string = 'jwt_token') {
      this.user = null;
      this.token = null;
      this.organs = [];
      this.acceptedToS = null;

      clearTokenInStorage(tokenKey);
      useUserSettingsStore().clearSettings();
    },
  },
});
