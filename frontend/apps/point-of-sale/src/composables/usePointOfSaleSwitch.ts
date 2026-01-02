import { ref } from 'vue';
import { PointOfSaleResponse } from '@sudosos/sudosos-client';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { usePosToken } from './usePosToken';
import { PointOfSaleSwitchService } from '@/services/PointOfSaleSwitchService';
import { userApiService } from '@/services/ApiService';

/**
 * Composable for switching between Point of Sale instances.
 * Handles both authenticated and unauthenticated scenarios.
 */
export function usePointOfSaleSwitch() {
  const { setPosToken } = usePosToken();
  const authStore = useAuthStore();
  const switching = ref(false);

  /**
   * Switches to the specified Point of Sale.
   * If no POS token exists, authenticates first, then switches.
   * If a POS token already exists, switches directly.
   */
  const switchToPos = async (pos: PointOfSaleResponse): Promise<void> => {
    if (switching.value) return;

    switching.value = true;
    try {
      // If the current authStore user is a point of sale user
      // then we are already authenticated for POS access.
      // Ideally this checks if POS_JWT_TOKEN exists AND is for the right POS or not, but that
      // state is not directly accessible here.
      if (authStore.user?.type !== 'POINT_OF_SALE') {
        const response = await userApiService.authenticate.authenticatePointOfSale(pos.id);
        setPosToken(response.data.token);
      }

      PointOfSaleSwitchService.switchTo(pos);
    } catch (error) {
      console.error('Error switching POS:', error);
      throw error;
    } finally {
      switching.value = false;
    }
  };

  return {
    switchToPos,
    switching,
  };
}
