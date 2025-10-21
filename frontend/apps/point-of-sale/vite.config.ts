import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

// Environment-based proxy URL configuration
const getProxyUrl = () => {
  const env = process.env.VITE_ENV || 'test';

  switch (env) {
    case 'prod':
      return 'https://sudosos.gewis.nl';
    case 'test':
      return 'https://sudosos.test.gewis.nl';
    case 'local':
      return 'http://localhost:3000';
    default:
      return 'https://sudosos.test.gewis.nl';
  }
};

const PROXY_URL = getProxyUrl();
const isLocal = process.env.VITE_ENV === 'local';

// TODO: Fix nginx dev proxy setup instead of hack

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    base: './',
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['ToastService'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
        },
      },
    },
    server: {
      port: 5174,
      proxy: {
        '/api/v1': {
          target: isLocal ? 'http://localhost:3000/v1' : PROXY_URL + '/api/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/v1/, ''),
        },
        '/static': {
          target: PROXY_URL + '/static',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/static/, ''),
        },
        '/ws': {
          target: isLocal ? 'http://localhost:8080' : PROXY_URL + '/ws',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/ws/, ''),
        },
      },
    },
  };
});
