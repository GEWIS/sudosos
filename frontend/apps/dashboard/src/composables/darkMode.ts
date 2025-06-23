import { ref, onMounted } from 'vue';

const DARK_MODE_KEY = 'dark-mode';

/**
 * Composable for managing dark mode
 * @returns {Object} Object containing the isDark, toggle, enable and disable functions
 */
export function useDarkMode() {
  const isDark = ref(false);

  const apply = (value: boolean) => {
    isDark.value = value;
    const html = document.documentElement;
    html.classList.toggle('dark-mode', value);
    localStorage.setItem(DARK_MODE_KEY, value ? 'true' : 'false');
  };

  const applyFromSystem = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDark.value = prefersDark;
    document.documentElement.classList.toggle('dark-mode', prefersDark);
  };

  const toggle = () => apply(!isDark.value);

  onMounted(() => {
    const stored = localStorage.getItem(DARK_MODE_KEY);
    if (stored === null) {
      applyFromSystem();
    } else {
      apply(stored === 'true');
    }
  });

  return {
    isDark,
    toggle,
    enable: () => apply(true),
    disable: () => apply(false),
  };
}
