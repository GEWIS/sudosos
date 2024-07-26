import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import useGitInfo from "./vite.config.plugin-git-info";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
              @import "./src/scss/styles.scss";
            `
        }
      }
    },
    server: {
      port: 5174,
      proxy: {
        '/api': {
          target: env.VITE_DEV_API_BASE,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        }
      }
    },
    define: {
      ...useGitInfo(),
    }
  };
});
