import { onScopeDispose, ref } from 'vue';

/**
 * Phones held upright get the stepwise mobile checkout instead of the
 * side-by-side kiosk layout, which needs roughly 1000px of width to be usable.
 */
const MOBILE_LAYOUT_QUERY = '(max-width: 767px) and (orientation: portrait)';

export function useMobileLayout() {
  const query = window.matchMedia(MOBILE_LAYOUT_QUERY);
  const isMobile = ref(query.matches);

  const update = (event: MediaQueryListEvent) => {
    isMobile.value = event.matches;
  };

  query.addEventListener('change', update);
  onScopeDispose(() => query.removeEventListener('change', update));

  return { isMobile };
}
