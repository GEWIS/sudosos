import { createPinia, setActivePinia } from 'pinia';
import type { Pinia } from 'pinia';

export type PiniaSeed = Record<string, Record<string, unknown>>;

/**
 * Creates a fresh Pinia instance, activates it, and optionally seeds one or more stores
 * before any component reads from them.
 *
 * The seed REPLACES the entire state object for each listed store id. It is not a merge
 * with that store's normal defaults. This has to run before the store is ever instantiated
 * (via setActivePinia, below), and Pinia's $patch requires an existing store instance, so
 * $patch is not an option here. The tradeoff: a story must provide a complete state shape
 * for every field the component under test actually reads. Any field you omit becomes
 * undefined, not that field's normal default.
 */
export function createSeededPinia(seed: PiniaSeed | undefined): Pinia {
  const pinia = createPinia();
  setActivePinia(pinia);
  if (seed) {
    for (const [storeId, state] of Object.entries(seed)) {
      // Full replace, not a merge. See the doc comment above.
      pinia.state.value[storeId] = state;
    }
  }
  return pinia;
}
