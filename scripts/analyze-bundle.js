#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if webpack-bundle-analyzer is installed
try {
  require('webpack-bundle-analyzer');
} catch (error) {
  console.log('Installing webpack-bundle-analyzer for bundle analysis...');
  execSync('npm install webpack-bundle-analyzer --save-dev', { stdio: 'inherit' });
}

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const DIST_DIR = path.join(__dirname, '../dist');
const SRC_DIR = path.join(__dirname, '../src');

// Bundle analysis configuration
const ANALYSIS_CONFIG = {
  // Large package thresholds (in KB)
  largePackageThreshold: 100,
  // Unused package patterns
  unusedPatterns: [
    /^lodash/,
    /^moment/,
    /^date-fns/,
    /^@material-ui/,
    /^@mui/,
    /^antd/,
    /^bootstrap/,
    /^jquery/
  ],
  // Critical packages that should be loaded first
  criticalPackages: [
    'react',
    'react-dom',
    'react-router-dom'
  ],
  // Packages that can be lazy loaded
  lazyLoadablePackages: [
    'chart.js',
    'react-chartjs-2',
    'jspdf',
    'html2canvas',
    'pdf-lib',
    'canvas',
    'gsap',
    '@gsap/react'
  ]
};

function analyzeBundleSizes() {
  console.log('📊 Analyzing bundle sizes...\n');
  
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Dist directory not found. Please run build first.');
    return null;
  }
  
  const jsFiles = fs.readdirSync(DIST_DIR)
    .filter(file => file.endsWith('.js'))
    .map(file => ({
      name: file,
      path: path.join(DIST_DIR, file),
      size: fs.statSync(path.join(DIST_DIR, file)).size
    }))
    .sort((a, b) => b.size - a.size);
  
  console.log('📦 JavaScript Bundle Analysis:\n');
  
  let totalSize = 0;
  const largeFiles = [];
  
  for (const file of jsFiles) {
    const sizeKB = (file.size / 1024).toFixed(2);
    totalSize += file.size;
    
    console.log(`${file.name}:`);
    console.log(`  Size: ${sizeKB} KiB`);
    
    if (file.size > ANALYSIS_CONFIG.largePackageThreshold * 1024) {
      largeFiles.push(file);
      console.log(`  ⚠️  Large bundle (>${ANALYSIS_CONFIG.largePackageThreshold} KiB)`);
    }
    
    console.log('');
  }
  
  console.log(`📈 Total bundle size: ${(totalSize / 1024).toFixed(2)} KiB`);
  
  return {
    files: jsFiles,
    totalSize,
    largeFiles
  };
}

function analyzePackageUsage() {
  console.log('🔍 Analyzing package usage...\n');
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  console.log('📋 Package Analysis:\n');
  
  const unusedPackages = [];
  const largePackages = [];
  const lazyLoadablePackages = [];
  
  for (const [packageName, version] of Object.entries(dependencies)) {
    // Check if package is potentially unused
    const isUnused = ANALYSIS_CONFIG.unusedPatterns.some(pattern => pattern.test(packageName));
    const isLarge = packageName.includes('chart') || packageName.includes('pdf') || packageName.includes('canvas');
    const isLazyLoadable = ANALYSIS_CONFIG.lazyLoadablePackages.some(pkg => packageName.includes(pkg));
    
    console.log(`${packageName}@${version}:`);
    
    if (isUnused) {
      unusedPackages.push(packageName);
      console.log(`  ⚠️  Potentially unused package`);
    }
    
    if (isLarge) {
      largePackages.push(packageName);
      console.log(`  📦 Large package - consider lazy loading`);
    }
    
    if (isLazyLoadable) {
      lazyLoadablePackages.push(packageName);
      console.log(`  🔄 Good candidate for lazy loading`);
    }
    
    console.log('');
  }
  
  return {
    unusedPackages,
    largePackages,
    lazyLoadablePackages
  };
}

function generateOptimizationRecommendations(bundleAnalysis, packageAnalysis) {
  console.log('💡 Optimization Recommendations:\n');
  
  // Bundle splitting recommendations
  if (bundleAnalysis.largeFiles.length > 0) {
    console.log('1. 📦 Bundle Splitting:');
    console.log('   - Split large bundles into smaller chunks');
    console.log('   - Implement route-based code splitting');
    console.log('   - Use dynamic imports for heavy components');
    console.log('');
  }
  
  // Lazy loading recommendations
  if (packageAnalysis.lazyLoadablePackages.length > 0) {
    console.log('2. 🔄 Lazy Loading:');
    console.log('   - Implement lazy loading for:');
    packageAnalysis.lazyLoadablePackages.forEach(pkg => {
      console.log(`     • ${pkg}`);
    });
    console.log('');
  }
  
  // Unused package recommendations
  if (packageAnalysis.unusedPackages.length > 0) {
    console.log('3. 🗑️ Package Cleanup:');
    console.log('   - Consider removing unused packages:');
    packageAnalysis.unusedPackages.forEach(pkg => {
      console.log(`     • ${pkg}`);
    });
    console.log('');
  }
  
  // General recommendations
  console.log('4. 🎯 General Optimizations:');
  console.log('   - Enable tree shaking in build configuration');
  console.log('   - Use ES modules instead of CommonJS');
  console.log('   - Implement proper code splitting strategies');
  console.log('   - Consider using webpack-bundle-analyzer for detailed analysis');
  console.log('');
  
  console.log('5. 📱 Performance Monitoring:');
  console.log('   - Monitor Core Web Vitals');
  console.log('   - Track bundle size over time');
  console.log('   - Use Lighthouse for performance audits');
  console.log('   - Implement performance budgets');
}

function generateBundleReport(bundleAnalysis, packageAnalysis) {
  const report = {
    timestamp: new Date().toISOString(),
    bundleAnalysis: {
      totalSize: bundleAnalysis.totalSize,
      totalSizeKB: (bundleAnalysis.totalSize / 1024).toFixed(2),
      fileCount: bundleAnalysis.files.length,
      largeFiles: bundleAnalysis.largeFiles.map(f => ({
        name: f.name,
        sizeKB: (f.size / 1024).toFixed(2)
      }))
    },
    packageAnalysis: {
      unusedPackages: packageAnalysis.unusedPackages,
      largePackages: packageAnalysis.largePackages,
      lazyLoadablePackages: packageAnalysis.lazyLoadablePackages
    },
    recommendations: {
      bundleSplitting: bundleAnalysis.largeFiles.length > 0,
      lazyLoading: packageAnalysis.lazyLoadablePackages.length > 0,
      packageCleanup: packageAnalysis.unusedPackages.length > 0
    }
  };
  
  const reportPath = path.join(__dirname, '../bundle-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📄 Detailed report saved to: ${reportPath}`);
  
  return report;
}

function createOptimizedViteConfig() {
  console.log('\n🔧 Creating optimized Vite configuration...\n');
  
  const optimizedConfig = `
// Optimized Vite configuration for better bundle splitting
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          
          // UI libraries
          'vendor-ui': ['framer-motion', 'styled-components'],
          
          // Heavy libraries - lazy load these
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-pdf': ['jspdf', 'html2canvas', 'pdf-lib', 'canvas'],
          'vendor-animation': ['gsap', '@gsap/react'],
          
          // AI and services
          'vendor-ai': ['@google/generative-ai'],
          'vendor-appwrite': ['appwrite']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
`;
  
  const configPath = path.join(__dirname, '../vite.config.optimized.ts');
  fs.writeFileSync(configPath, optimizedConfig);
  
  console.log(`✅ Optimized Vite config created: ${configPath}`);
}

async function analyzeBundle() {
  console.log('🚀 Starting bundle analysis...\n');
  
  try {
    const bundleAnalysis = analyzeBundleSizes();
    if (!bundleAnalysis) return;
    
    const packageAnalysis = analyzePackageUsage();
    
    generateOptimizationRecommendations(bundleAnalysis, packageAnalysis);
    
    const report = generateBundleReport(bundleAnalysis, packageAnalysis);
    
    createOptimizedViteConfig();
    
    console.log('\n✅ Bundle analysis complete!');
    console.log(`📊 Total bundle size: ${report.bundleAnalysis.totalSizeKB} KiB`);
    console.log(`📦 Large files: ${report.bundleAnalysis.largeFiles.length}`);
    console.log(`🔄 Lazy loadable packages: ${report.packageAnalysis.lazyLoadablePackages.length}`);
    
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
  }
}

// Run the analysis
analyzeBundle().catch(console.error);