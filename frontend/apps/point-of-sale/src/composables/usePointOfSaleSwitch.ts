import { ref } from 'vue';
import { PointOfSaleResponse } from '@sudosos/sudosos-client';
import { usePosToken } from './usePosToken';
import { PointOfSaleSwitchService } from '@/services/PointOfSaleSwitchService';
import { userApiService } from '@/services/ApiService';

/**
 * Composable for switching between Point of Sale instances.
 * Handles both authenticated and unauthenticated scenarios.
 */
export function usePointOfSaleSwitch() {
  const { setPosToken } = usePosToken();
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
      const response = await userApiService.authenticate.authenticatePointOfSale(pos.id);
      setPosToken(response.data.token);

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
