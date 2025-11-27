import { AxiosHeaders, AxiosResponse } from 'axios';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { jwtVerify, importSPKI } from 'jose';
import { ApiService } from '../services/ApiService';
import { useAuthStore } from '../stores/auth.store';
import { useUserStore } from '../stores/user.store';

type Token = { token: string; expires: string };

// Cache for the public key to avoid repeated API calls
let cachedPublicKey: CryptoKey | null = null;

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
 * Verifies the JWT token signature using the public key from the API.
 * Returns true if verification succeeds, false otherwise.
 */
async function verifyTokenSignature(token: string, apiService: ApiService): Promise<boolean> {
  try {
    if (!cachedPublicKey) {
      const publicKeyResponse = await apiService.authenticate.getJWTPublicKey();
      const publicKeyPem = publicKeyResponse.data;
      cachedPublicKey = await importSPKI(publicKeyPem, 'RS512');
    }
    await jwtVerify(token, cachedPublicKey);
    return true;
  } catch (err) {
    console.error('Token verification failed:', err);
    return false;
  }
}

/**
 * Populates the auth and userStore from the token stored in the localStorage, resolves when the user roles are loaded.
 */
export async function populateStoresFromToken(apiService: ApiService) {
  const token = getTokenFromStorage(apiService.tokenKey);
  if (!token.token || !token.expires) {
    return;
  }

  const isAuth = !isTokenExpired(Number(token.expires));
  if (!isAuth) {
    return;
  }

  const isValid = await verifyTokenSignature(token.token, apiService);

  if (!isValid) {
    clearTokenInStorage(apiService.tokenKey);
    return;
  }

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
