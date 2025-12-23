import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/data': resolve(__dirname, './src/data'),
      '@/components': resolve(__dirname, './src/components'),
    },
  },
  build: {
    target: 'ES2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          d3: ['d3'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
