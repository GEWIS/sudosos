import { computed, ref } from 'vue';
import {
  getTokenFromStorage,
  setTokenInStorage,
  clearTokenInStorage,
  isAuthenticated,
} from '@sudosos/sudosos-frontend-common';
import { jwtDecode } from 'jwt-decode';
import { BasePointOfSaleInfoResponse } from '@gewis/sudosos-client';
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

  const getPosIdFromToken = (): number | null => {
    const token = getPosToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<{ user: { pointOfSale: BasePointOfSaleInfoResponse } }>(token);
      return decoded.user.pointOfSale.id || null;
    } catch {
      return null;
    }
  };

  /**
   * The id of the POINT_OF_SALE-type user this token was minted for. Anonymous
   * terminal payments are booked in the name of that user, so this is the
   * `from` of such a transaction.
   */
  const getPosUserIdFromToken = (): number | null => {
    const token = getPosToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<{ user: { id: number } }>(token);
      return decoded.user.id || null;
    } catch {
      return null;
    }
  };

  return {
    hasPosToken,
    setPosToken,
    clearPosToken,
    getPosToken,
    refreshPosToken,
    getPosIdFromToken,
    getPosUserIdFromToken,
  };
}
