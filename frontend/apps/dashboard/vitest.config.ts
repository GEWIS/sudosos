import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

import vue from '@vitejs/plugin-vue';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // A sibling vitest.config.ts takes full precedence over vite.config.ts (it does
          // not merge with it), so this project's own vite.config.ts is never loaded by
          // vitest run. The Vue SFC compiler needs to be registered here explicitly,
          // otherwise .vue files fail to parse when a story imports one.
          vue(),
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        // Same reason as above: vite.config.ts's resolve.alias is not inherited, so it is
        // repeated here. Without it, any component or story importing via the '@/...' alias
        // (as ContainerActionsForm.vue and its story do) fails to resolve at test time.
        resolve: {
          alias: {
            '@': path.join(dirname, 'src'),
            'sudosos-dashboard': dirname,
          },
        },
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
