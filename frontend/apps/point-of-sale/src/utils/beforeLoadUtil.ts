import { clearTokenInStorage, setupWebSocket } from '@sudosos/sudosos-frontend-common';
import { jwtDecode } from 'jwt-decode';
import { BasePointOfSaleInfoResponse } from '@sudosos/sudosos-client';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { POS_TOKEN_KEY, usePosToken } from '@/composables/usePosToken';
import posApiService from '@/services/PosApiService';

/**
 * Refreshes the POS authentication token and populates the POS store from the token.
 */
async function populatePosStoreFromToken(): Promise<boolean> {
  const posToken = usePosToken();
  if (!posToken.hasPosToken.value) return false;

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
  try {
    setupWebSocket();
  } catch (e) {
    console.error(e);
    return;
  }
  await populatePosStoreFromToken()
    .then((res) => {
      if (!res) clearTokenInStorage(POS_TOKEN_KEY);
    })
    .catch(() => {
      clearTokenInStorage(POS_TOKEN_KEY);
    });
}
