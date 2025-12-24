import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ai-tools/core': path.resolve(__dirname, '../core/src'),
      '@ai-tools/adapter-web': path.resolve(__dirname, '../adapter-web/src'),
      '@ai-tools/ui': path.resolve(__dirname, '../ui/src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
