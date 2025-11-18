import { AxiosHeaders, AxiosResponse } from 'axios';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { ApiService } from '../services/ApiService';
import { useAuthStore } from '../stores/auth.store';
import { useUserStore } from '../stores/user.store';

type Token = { token: string; expires: string };

export function updateTokenIfNecessary(response: AxiosResponse) {
  if ((response.headers as AxiosHeaders).has('Set-Authorization')) {
    const newToken = (response.headers as AxiosHeaders).get('Set-Authorization') as string;
    if (newToken) setTokenInStorage(newToken);
  }
}

export function clearTokenInStorage(tokenKey: string = 'jwt_token') {
  localStorage.removeItem(tokenKey);
}

export function parseToken(rawToken: string): Token {
  const expires = String(jwtDecode<JwtPayload>(rawToken).exp);
  return { token: rawToken, expires };
}

export function setTokenInStorage(jwtToken: string, tokenKey: string = 'jwt_token') {
  localStorage.setItem(tokenKey, JSON.stringify(parseToken(jwtToken)));
}

export function getTokenFromStorage(tokenKey: string = 'jwt_token'): Token {
  const rawToken = localStorage.getItem(tokenKey) as string;
  let token = {} as Token;
  if (rawToken !== null) token = JSON.parse(rawToken);

  return {
    ...token,
  };
}

export function isTokenExpired(tokenEpochTimestamp: number): boolean {
  // If the expiry is somewhere around the year 33658 assume migration from old frontend and force re-login.
  if (tokenEpochTimestamp > 1000000000000) return true;

  const tokenExpirationTime = tokenEpochTimestamp * 1000;
  const currentTimestamp = new Date().getTime();
  return currentTimestamp > tokenExpirationTime;
}

/**
 * Returns True if there is a token in the LocalStorage and if it hasn't expired yet.
 */
export function isAuthenticated(tokenKey: string = 'jwt_token'): boolean {
  const token = getTokenFromStorage(tokenKey);
  if (!token.token || !token.expires) return false;
  return !isTokenExpired(Number(token.expires));
}

/**
 * Populates the auth and userStore from the token stored in the localStorage, resolves when the user roles are loaded.
 */
export async function populateStoresFromToken(apiService: ApiService) {
  const isAuth = isAuthenticated(apiService.tokenKey);

  if (isAuth) {
    const authStore = useAuthStore();
    authStore.extractStateFromToken(apiService.tokenKey);
    const user = authStore.getUser;
    if (user) {
      const userStore = useUserStore();
      userStore.setCurrentUser(user);
      void userStore.fetchCurrentUserBalance(user.id, apiService);
      return await userStore.fetchUserRolesWithPermissions(user.id, apiService);
    }
  }
}
