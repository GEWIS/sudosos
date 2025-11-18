import { computed, ref } from 'vue';
import {
  getTokenFromStorage,
  setTokenInStorage,
  clearTokenInStorage,
  isAuthenticated,
} from '@sudosos/sudosos-frontend-common';
import { posApiService } from '@/services/ApiService';

export const POS_TOKEN_KEY = 'pos_jwt_token';
export const POS_ID_KEY = 'pos_id';

// Global reactive state for POS token
const posTokenState = ref(isAuthenticated(POS_TOKEN_KEY));

export function usePosToken() {
  const hasPosToken = computed(() => {
    void posTokenState.value;
    return isAuthenticated(POS_TOKEN_KEY);
  });

  const setPosToken = (token: string) => {
    setTokenInStorage(token, POS_TOKEN_KEY);
    posTokenState.value = true;
  };

  const clearPosToken = () => {
    clearTokenInStorage(POS_TOKEN_KEY);
    // TODO: Remove this once backend includes posId in POS JWT token
    localStorage.removeItem(POS_ID_KEY);
    posTokenState.value = false;
  };

  const refreshPosToken = async () => {
    await posApiService.authenticate.refreshToken().then((res) => {
      setPosToken(res.data.token);
    });
  };

  const getPosToken = () => {
    const tokenData = getTokenFromStorage(POS_TOKEN_KEY);
    return tokenData.token;
  };

  return {
    hasPosToken,
    setPosToken,
    clearPosToken,
    getPosToken,
    refreshPosToken,
  };
}
