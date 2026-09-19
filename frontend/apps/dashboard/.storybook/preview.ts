import { setup } from '@storybook/vue3-vite';
import type { Preview } from '@storybook/vue3-vite';
import { usePreset } from '@primeuix/themes';
import {
  SudososRed,
  GrolschGreen,
  BetaBlue,
  AthenaPinkBlue,
  IvvNavy,
  BoomMango,
  DefiLilac,
  GepwnageYellow,
} from '@sudosos/themes';
import { registerPrimeVue } from './registerPrimeVue';
import 'primeicons/primeicons.css';

const themePresets = {
  'sudosos-red': SudososRed,
  'grolsch-green': GrolschGreen,
  'beta-blue': BetaBlue,
  'athena-pink-blue': AthenaPinkBlue,
  'ivv-navy': IvvNavy,
  'boom-mango': BoomMango,
  'defi-lilac': DefiLilac,
  'gepwnage-yellow': GepwnageYellow,
} as const;

setup((app) => {
  registerPrimeVue(app, SudososRed);
});

// src/assets/main.css sets this same rule for the real app. PrimeVue's own generated
// tokens already include --p-body-background without needing that (Tailwind-laden)
// stylesheet, so applying just this one rule here is enough for the canvas background
// to invert with the color mode toolbar in Storybook too.
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = 'body { background-color: var(--p-body-background); }';
  document.head.appendChild(style);
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'PrimeVue tenant preset',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: Object.keys(themePresets),
        dynamicTitle: true,
      },
    },
    colorMode: {
      description: 'Light or dark mode',
      toolbar: {
        title: 'Color mode',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'sudosos-red',
    colorMode: 'light',
  },
  decorators: [
    (story, context) => {
      const preset = themePresets[context.globals.theme as keyof typeof themePresets] ?? SudososRed;
      usePreset(preset);
      document.documentElement.classList.toggle('dark-mode', context.globals.colorMode === 'dark');
      return { components: { Story: story() }, template: '<Story />' };
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
