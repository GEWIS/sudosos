import { onMounted, onUnmounted, ref } from 'vue';

/**
 * Reactive viewport check for the mobile POS layout. Uses matchMedia instead of
 * resize listeners, so it only fires when the breakpoint is actually crossed.
 *
 * The initial value is read synchronously so the first render already picks
 * the right layout, instead of flashing the kiosk layout on a phone.
 */
export function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint - 1}px)`;
  const isMobile = ref(window.matchMedia(query).matches);
  let mediaQuery: MediaQueryList | undefined;

  const update = (e: MediaQueryListEvent) => {
    isMobile.value = e.matches;
  };

  onMounted(() => {
    mediaQuery = window.matchMedia(query);
    isMobile.value = mediaQuery.matches;
    mediaQuery.addEventListener('change', update);
  });

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', update);
  });

  return { isMobile };
}
