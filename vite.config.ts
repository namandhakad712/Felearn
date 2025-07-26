import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      overlay: false // Disable the error overlay
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        app: path.resolve(__dirname, 'app.html')
      }
    }
  },
  optimizeDeps: {
    entries: [
      'index.html' // Only scan the main index.html
    ],
    exclude: ['@google/generative-ai', 'marked'] // Exclude ESM dependencies
  }
});
