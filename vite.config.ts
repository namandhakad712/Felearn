import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.APPWRITE_ENDPOINT': JSON.stringify(env.APPWRITE_ENDPOINT),
        'process.env.APPWRITE_PROJECT_ID': JSON.stringify(env.APPWRITE_PROJECT_ID)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@google/genai': 'https://esm.sh/@google/genai@^0.7.0',
        }
      },
      server: {
        port: 5173, // Explicitly set the port to fix WebSocket connection issues
        hmr: {
          protocol: 'ws',
          host: 'localhost',
          port: 5173
        }
      }
    };
});
