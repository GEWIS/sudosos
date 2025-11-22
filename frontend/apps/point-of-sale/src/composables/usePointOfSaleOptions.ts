import { computed, ref } from 'vue';
import { useAuthStore, isAllowed } from '@sudosos/sudosos-frontend-common';
import { PointOfSaleResponse } from '@sudosos/sudosos-client';
import { usePointOfSaleStore } from '@/stores/pos.store';

/**
 * Composable for loading and managing Point of Sale options.
 * Groups POS by owner name and provides loading state.
 */
export function usePointOfSaleOptions() {
  const authStore = useAuthStore();
  const posStore = usePointOfSaleStore();
  const loadingPos = ref(false);

  const posOptions = computed(() => {
    // Show all POS if the user has permission
    if (isAllowed('authenticate', 'all', 'User', ['pointOfSale'])) {
      return posStore.allPointOfSales || [];
    }
    return posStore.usersPointOfSales || [];
  });

  const groupedPos = computed(() => {
    if (!posOptions.value.length) return {};

    const groups: Record<string, PointOfSaleResponse[]> = {};

    posOptions.value.forEach((pos: PointOfSaleResponse) => {
      const ownerName = pos.owner?.firstName || 'Unknown';
      if (!groups[ownerName]) {
        groups[ownerName] = [];
      }
      groups[ownerName].push(pos);
    });

    const sortedEntries = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);

    const sortedGroups: Record<string, PointOfSaleResponse[]> = {};
    sortedEntries.forEach(([ownerName, posList]) => {
      sortedGroups[ownerName] = posList;
    });

    return sortedGroups;
  });

  const loadPosOptions = async (): Promise<void> => {
    const user = authStore.getUser;
    if (!user) return;

    loadingPos.value = true;
    try {
      await posStore.fetchUserPointOfSale(user.id);
      // Load all POS if the user has permission
      if (isAllowed('authenticate', 'all', 'User', ['pointOfSale'])) {
        await posStore.fetchAllPointOfSales();
      }
    } catch (error) {
      console.error('Error loading POS options:', error);
      throw error;
    } finally {
      loadingPos.value = false;
    }
  };

  return {
    posOptions,
    groupedPos,
    loadingPos,
    loadPosOptions,
  };
}
