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
      },
      // Enable history API fallback for client-side routing
      historyApiFallback: true
    },
    build: {
      // Optimize for production
      target: 'es2015',
      minify: 'terser',
      sourcemap: mode === 'development',
      
      // Optimize chunk splitting for better caching and performance
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          app: path.resolve(__dirname, 'app.html')
        },
        output: {
          manualChunks: (id) => {
            // Vendor chunk for React and core libraries
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('styled-components')) {
                return 'vendor-styled';
              }
              if (id.includes('framer-motion')) {
                return 'vendor-ui';
              }
              if (id.includes('@google/generative-ai')) {
                return 'vendor-ai';
              }
              if (id.includes('appwrite')) {
                return 'vendor-appwrite';
              }
              if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('pdf-lib') || id.includes('canvas')) {
                return 'vendor-pdf';
              }
              if (id.includes('gsap') || id.includes('@gsap/react')) {
                return 'vendor-animation';
              }
              if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
                return 'vendor-charts';
              }
              // Group other node_modules into a single vendor chunk
              return 'vendor';
            }
            // Group app code by feature
            if (id.includes('/components/')) {
              return 'app-components';
            }
            if (id.includes('/pages/')) {
              return 'app-pages';
            }
            if (id.includes('/hooks/') || id.includes('/utils/')) {
              return 'app-utils';
            }
          },
          // Optimize chunk file names for better caching
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
            return `assets/js/[name]-[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(ext || '')) {
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
      
      // Enhanced Terser options for better minification
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          pure_funcs: mode === 'production' ? ['console.log', 'console.debug', 'console.info'] : [],
          passes: 2,
          unsafe: true,
          unsafe_comps: true,
          unsafe_Function: true,
          unsafe_math: true,
          unsafe_proto: true,
          unsafe_regexp: true,
          unsafe_undefined: true
        },
        mangle: {
          safari10: true
        }
      },
      
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      
      // Enable CSS code splitting
      cssCodeSplit: true,
      
      // Optimize dependencies
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true
      }
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
        '@google/generative-ai',
        'appwrite',
        'gsap',
        '@gsap/react'
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
      // Enable history API fallback for production preview
      historyApiFallback: true
    },
    
    // CSS configuration
    css: {
      devSourcemap: mode === 'development',
    },
    
    // Performance optimizations
    esbuild: {
      target: 'es2015',
      minify: mode === 'production',
      treeShaking: true
    }
  };
});
