import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ai-tools/core': path.resolve(__dirname, '../core/src'),
      '@ai-tools/adapter-electron': path.resolve(__dirname, '../adapter-electron/src'),
      '@ai-tools/ui': path.resolve(__dirname, '../ui/src'),
    },
  },
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
  },
});
