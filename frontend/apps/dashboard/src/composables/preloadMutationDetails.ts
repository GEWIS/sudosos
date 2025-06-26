import { nextTick, ref } from 'vue';
import { useMutationDetails } from '@/composables/mutationDetails';
import type { FinancialMutation } from '@/utils/mutationUtils';

/**
 * Prefetches the details for a given list of base mutations.
 */
export function usePrefetchMutationDetails() {
  /**
   * @param mutations Array of base FinancialMutation objects (should have id and type)
   * @returns Promise that resolves when all visible details are prefetched
   */
  async function preload(mutations: FinancialMutation[]) {
    await nextTick(); // Wait for DOM/reactivity updates, if needed
    const promises: Promise<void>[] = [];
    for (const mutation of mutations) {
      if (!mutation) continue;
      // useMutationDetails expects Refs (type, id)
      const { fetchMutation } = useMutationDetails(ref(mutation.type), ref(mutation.id), false);
      promises.push(fetchMutation());
    }
    await Promise.all(promises);
  }

  return { preload };
}
