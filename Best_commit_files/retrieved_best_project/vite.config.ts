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
  optimizeDeps: {
    entries: [
      'index.html' // Only scan the main index.html
    ],
    exclude: ['@google/genai', 'marked'] // Exclude ESM dependencies
  }
});
