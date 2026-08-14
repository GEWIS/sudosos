// vite.config.ts
import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'sudosos-frontend-themes',
      fileName: 'sudosos-frontend-themes',
    },
    watch: process.env.WATCH ? {} : undefined,
  },
  server: {
    port: 5176,
  },
  plugins: [dts(), vue()],
});
