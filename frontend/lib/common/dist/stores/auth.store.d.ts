import { ApiService } from '../services/ApiService';
import { AuthenticationResponse, UserResponse } from '@sudosos/sudosos-client';

interface AuthStoreState {
    user: UserResponse | null;
    roles: string[];
    organs: UserResponse[];
    token: string | null;
    acceptedToS: string | null;
}
export declare const useAuthStore: import('pinia').StoreDefinition<"auth", AuthStoreState, {
    getToken(): string | null;
    getToS(): string | null;
    getUser(): UserResponse | null;
}, {
    handleResponse(res: AuthenticationResponse, service: ApiService): void;
    gewisPinlogin(userId: string, pinCode: string, service: ApiService): Promise<void>;
    ldapLogin(accountName: string, password: string, service: ApiService): Promise<void>;
    gewisWebLogin(nonce: string, token: string, service: ApiService): Promise<void>;
    externalPinLogin(userId: number, pin: string, service: ApiService): Promise<void>;
    eanLogin(eanCode: string, service: ApiService): Promise<void>;
    apiKeyLogin(key: string, userId: number, service: ApiService): Promise<void>;
    gewisLdapLogin(accountName: string, password: string, service: ApiService): Promise<void>;
    updateUserPin(pin: string, service: ApiService): Promise<void>;
    updateUserLocalPassword(password: string, service: ApiService): Promise<void>;
    updateUserNfc(nfcCode: string, service: ApiService): Promise<void>;
    updateUserKey(service: ApiService): Promise<import('@sudosos/sudosos-client').UpdateKeyResponse | undefined>;
    updateUserToSAccepted(extensiveDataProcessing: boolean, service: ApiService): Promise<void>;
    extractStateFromToken(): void;
    logout(): void;
}>;
export {};
