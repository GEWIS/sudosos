import { ApiService } from '../services/ApiService';
import { AxiosResponse } from 'axios/index';

type Token = {
    token: string;
    expires: string;
};
export declare function updateTokenIfNecessary(response: AxiosResponse): void;
export declare function clearTokenInStorage(): void;
export declare function parseToken(rawToken: string): Token;
export declare function setTokenInStorage(jwtToken: string): void;
export declare function getTokenFromStorage(): Token;
export declare function isTokenExpired(tokenEpochTimestamp: number): boolean;
/**
 * Returns True if there is a token in the LocalStorage and if it hasn't expired yet.
 */
export declare function isAuthenticated(): boolean;
/**
 * Populates the auth and userStore from the token stored in the localStorage.
 */
export declare function populateStoresFromToken(apiService: ApiService): void;
export {};
