import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  loadEnv(mode, process.cwd(), '');
  
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
        overlay: false // Disable the error overlay
      }
    },
    build: {
      // Optimize for production
      target: 'es2015',
      minify: 'terser',
      sourcemap: mode === 'development',
      
      // Chunk splitting for better caching
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          app: path.resolve(__dirname, 'app.html')
        },
        output: {
          manualChunks: {
            // Vendor chunk for React and core libraries
            vendor: ['react', 'react-dom', 'react-router-dom'],
            
            // Styled-components in its own chunk to prevent conflicts
            styled: ['styled-components'],
            
            // UI libraries chunk (excluding styled-components)
            ui: ['framer-motion'],
            
            // AI and services chunk
            ai: ['@google/generative-ai'],
            
            // Appwrite chunk
            appwrite: ['appwrite'],
            
            // PDF and canvas utilities
            pdf: ['jspdf', 'html2canvas', 'pdf-lib', 'canvas'],
            
            // Animation libraries
            animation: ['gsap', '@gsap/react']
          },
          // Optimize chunk file names
          chunkFileNames: () => {
            return `assets/js/[name]-[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/css/i.test(ext || '')) {
              return `assets/css/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext || '')) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          }
        }
      },
      
      // Terser options for better minification
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          pure_funcs: mode === 'production' ? ['console.log', 'console.debug', 'console.info'] : [],
        },
      },
      
      // Chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },
    
    optimizeDeps: {
      entries: [
        'index.html',
        'app.html'
      ],
      exclude: ['marked'],
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        'styled-components',
        '@google/generative-ai'
      ],
      // Ensure styled-components is properly deduplicated
      force: true
    },
    
    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    
    // Environment variables
    envPrefix: 'VITE_',
    
    // Preview server configuration
    preview: {
      port: 4173,
      host: true,
    },
    
    // CSS configuration
    css: {
      devSourcemap: mode === 'development',
    },
  };
});
