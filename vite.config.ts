import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // The loadEnv call is removed here as Vite handles loading .env files for your app automatically.

  return {
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
        overlay: false, // Disable the error overlay
      },
      // Enable history API fallback for client-side routing
      historyApiFallback: true,
    },

    build: {
      // Optimize for production
      target: 'es2015',
      minify: 'terser',
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 1000,
      
      // Chunk splitting for better caching
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          app: path.resolve(__dirname, 'app.html'),
        },
        output: {
          manualChunks: {
            // Vendor chunk for React and core libraries
            vendor: ['react', 'react-dom', 'react-router-dom'],
            // Styled-components in its own chunk to prevent conflicts
            styled: ['styled-components'],
            // UI libraries chunk
            ui: ['framer-motion'],
            // AI and services chunk
            ai: ['@google/generative-ai'],
            // Appwrite chunk
            appwrite: ['appwrite'],
            // PDF and canvas utilities
            pdf: ['jspdf', 'html2canvas', 'pdf-lib', 'canvas'],
            // Animation libraries
            animation: ['gsap', '@gsap/react'],
          },
          // Optimize chunk and asset file names
          chunkFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const ext = assetInfo.name?.split('.').pop() || '';
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/css/i.test(ext)) {
              return `assets/css/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
        },
      },

      // Terser options for better minification
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          pure_funcs: mode === 'production' ? ['console.log', 'console.debug', 'console.info'] : [],
        },
      },
    },

    optimizeDeps: {
      entries: ['index.html', 'app.html'],
      exclude: ['marked'],
      // 'include' array removed as Vite's scanner will find these deps from the entries.
      force: true,
    },

    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },

    // Environment variables
    envPrefix: 'VITE_',

    // Preview server configuration for Render
    preview: {
      port: 4173,
      host: true,
      historyApiFallback: true,
      // This is the crucial fix for the "Host not allowed" error on Render.
      allowedHosts: ['felearn.onrender.com'], 
    },

    // CSS configuration
    css: {
      devSourcemap: mode === 'development',
    },
  };
});
