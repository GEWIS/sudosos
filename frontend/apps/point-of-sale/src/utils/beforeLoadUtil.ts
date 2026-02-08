import { setupWebSocket, useAuthStore, getTokenFromStorage } from '@sudosos/sudosos-frontend-common';
import { jwtDecode } from 'jwt-decode';
import { BasePointOfSaleInfoResponse } from '@sudosos/sudosos-client';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { usePosToken, POS_TOKEN_KEY } from '@/composables/usePosToken';
import posApiService from '@/services/PosApiService';
import { usePointOfSaleSwitch } from '@/composables/usePointOfSaleSwitch';

/**
 * Refreshes the POS authentication token and populates the POS store from the token.
 */
async function populatePosStoreFromToken(): Promise<boolean> {
  const posToken = usePosToken();
  // Check if POS token exists in storage
  const posTokenData = getTokenFromStorage(POS_TOKEN_KEY);
  const hasPosTokenInStorage = !!posTokenData.token;

  if (!hasPosTokenInStorage) {
    return false;
  }

  try {
    const res = await posApiService.authenticate.refreshToken();
    posToken.setPosToken(res.data.token);

    const decoded = jwtDecode<{ user: { pointOfSale: BasePointOfSaleInfoResponse } }>(res.data.token);
    const posId = decoded.user.pointOfSale.id;
    if (!posId) return false;

    const posStore = usePointOfSaleStore();
    await posStore.fetchPointOfSale(posId);
    return true;
  } catch (err) {
    console.error('Failed to refresh POS token:', err);
    throw err;
  }
}

export default async function beforeLoad() {
  const urlParams = new URLSearchParams(window.location.search);
  const apiKey = urlParams.get('apiKey');
  const userId = urlParams.get('userId');

  if (apiKey && userId) {
    const authStore = useAuthStore();
    const { switchToPos } = usePointOfSaleSwitch();

    await authStore.apiKeyLogin(apiKey, Number(userId), posApiService);

    const decoded = jwtDecode<{ user: { pointOfSale: BasePointOfSaleInfoResponse } }>(authStore.getToken!);
    const posId = decoded.user.pointOfSale.id;
    const pos = await posApiService.pos.getSinglePointOfSale(Number(posId));

    await switchToPos(pos.data);
  } else {
    const posToken = usePosToken();

    await populatePosStoreFromToken()
      .then((res) => {
        if (!res) posToken.clearPosToken();
      })
      .catch(() => {
        posToken.clearPosToken();
      });
  }

  const authStore = useAuthStore();
  const token = getTokenFromStorage(POS_TOKEN_KEY).token ?? authStore.getToken;

  try {
    setupWebSocket({ token });
  } catch (e) {
    console.error(e);
    return;
  }
}
