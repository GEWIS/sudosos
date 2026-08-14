import { ref, onMounted, onUnmounted, computed } from 'vue';

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useSizeBreakpoints() {
  const width = ref(window.innerWidth);

  function onResize() {
    width.value = window.innerWidth;
  }

  onMounted(() => window.addEventListener('resize', onResize));
  onUnmounted(() => window.removeEventListener('resize', onResize));

  const isSm = computed(() => width.value >= breakpoints.sm);
  const isMd = computed(() => width.value >= breakpoints.md);
  const isLg = computed(() => width.value >= breakpoints.lg);
  const isXl = computed(() => width.value >= breakpoints.xl);
  const is2xl = computed(() => width.value >= breakpoints['2xl']);

  return { width, isSm, isMd, isLg, isXl, is2xl };
}
