import { createPinia, setActivePinia } from 'pinia';
import type { Pinia } from 'pinia';

export type PiniaSeed = Record<string, Record<string, unknown>>;

export function createSeededPinia(seed: PiniaSeed | undefined): Pinia {
  const pinia = createPinia();
  setActivePinia(pinia);
  if (seed) {
    for (const [storeId, state] of Object.entries(seed)) {
      pinia.state.value[storeId] = state;
    }
  }
  return pinia;
}
