// vite.config.ts
import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts';

// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'sudosos-frontend-common',
      fileName: 'sudosos-frontend-common',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', 'pinia'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
          pinia: 'pinia'
        }
      }
    }
  },
  plugins: [dts(), vue()],
});
