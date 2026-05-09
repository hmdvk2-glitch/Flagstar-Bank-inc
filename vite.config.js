import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  define: {
    __DEV__: true,
    __BANK_MODE__: JSON.stringify('SIMULATION'),
  },
  server: {
    port: 3000,
    strictPort: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2020',
  },
  preview: {
    port: 4173,
    strictPort: true,
    open: true,
  },
});
