import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './',
  define: {
    __DEV__: true,
    __BANK_MODE__: JSON.stringify('SIMULATION'),
  },
  server: {
    port: 3000,
    strictPort: true,
    open: true,
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
