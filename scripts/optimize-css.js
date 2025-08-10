#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if PurgeCSS is installed
try {
  require('@fullhuman/postcss-purgecss');
} catch (error) {
  console.log('Installing PurgeCSS for CSS optimization...');
  execSync('npm install @fullhuman/postcss-purgecss --save-dev', { stdio: 'inherit' });
}

const PurgeCSS = require('@fullhuman/postcss-purgecss');

const SRC_DIR = path.join(__dirname, '../src');
const PUBLIC_DIR = path.join(__dirname, '../public');

// Files to scan for CSS usage
const CONTENT_PATHS = [
  path.join(SRC_DIR, '**/*.{js,jsx,ts,tsx}'),
  path.join(SRC_DIR, '**/*.html'),
  path.join(PUBLIC_DIR, '**/*.html'),
  path.join(__dirname, '../index.html'),
  path.join(__dirname, '../app.html')
];

// CSS files to optimize
const CSS_FILES = [
  path.join(SRC_DIR, 'index.css'),
  path.join(SRC_DIR, 'App.css'),
  path.join(PUBLIC_DIR, 'assets/css/style.css')
];

// Safelist for critical CSS that shouldn't be purged
const SAFELIST = [
  // Tailwind utilities that might be dynamically generated
  /^bg-/,
  /^text-/,
  /^border-/,
  /^p-/,
  /^m-/,
  /^w-/,
  /^h-/,
  /^flex/,
  /^grid/,
  /^hidden/,
  /^block/,
  /^inline/,
  /^relative/,
  /^absolute/,
  /^fixed/,
  /^z-/,
  /^opacity-/,
  /^transform/,
  /^transition/,
  /^animate-/,
  /^hover:/,
  /^focus:/,
  /^active:/,
  /^disabled:/,
  /^group/,
  /^peer/,
  
  // GSAP classes
  /^gsap-/,
  /^swiper-/,
  
  // Custom classes that might be dynamically added
  /^loading/,
  /^error/,
  /^success/,
  /^warning/,
  /^is-/,
  /^has-/,
  /^js-/,
  /^w-/,
  /^u-/,
  /^nav__/,
  /^products__/,
  /^use-cases__/,
  /^tech-partners__/,
  /^cta-s__/,
  /^footer__/
];

async function analyzeCSSUsage() {
  console.log('🔍 Analyzing CSS usage...\n');
  
  const results = [];
  
  for (const cssFile of CSS_FILES) {
    if (!fs.existsSync(cssFile)) {
      console.log(`⚠️  CSS file not found: ${cssFile}`);
      continue;
    }
    
    const originalContent = fs.readFileSync(cssFile, 'utf8');
    const originalSize = Buffer.byteLength(originalContent, 'utf8');
    
    console.log(`📄 Processing: ${path.basename(cssFile)}`);
    console.log(`  Original size: ${(originalSize / 1024).toFixed(2)} KiB`);
    
    try {
      // Use PurgeCSS to analyze unused CSS
      const purgeCSSResult = await PurgeCSS.purge({
        content: CONTENT_PATHS,
        css: [cssFile],
        safelist: SAFELIST,
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
        fontFace: true,
        keyframes: true,
        variables: true
      });
      
      if (purgeCSSResult.length > 0) {
        const optimizedContent = purgeCSSResult[0].css;
        const optimizedSize = Buffer.byteLength(optimizedContent, 'utf8');
        const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
        
        console.log(`  Optimized size: ${(optimizedSize / 1024).toFixed(2)} KiB`);
        console.log(`  Savings: ${((originalSize - optimizedSize) / 1024).toFixed(2)} KiB (${savings}%)`);
        
        // Create optimized version
        const optimizedPath = cssFile.replace('.css', '.optimized.css');
        fs.writeFileSync(optimizedPath, optimizedContent);
        
        results.push({
          file: path.basename(cssFile),
          originalSize,
          optimizedSize,
          savings: savings,
          optimizedPath
        });
      } else {
        console.log(`  ⚠️  No optimization possible`);
      }
    } catch (error) {
      console.error(`  ✗ Error processing ${cssFile}:`, error.message);
    }
    
    console.log('');
  }
  
  return results;
}

function generateCSSOptimizationReport(results) {
  console.log('📊 CSS Optimization Report\n');
  
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  
  for (const result of results) {
    totalOriginalSize += result.originalSize;
    totalOptimizedSize += result.optimizedSize;
    
    console.log(`${result.file}:`);
    console.log(`  Original: ${(result.originalSize / 1024).toFixed(2)} KiB`);
    console.log(`  Optimized: ${(result.optimizedSize / 1024).toFixed(2)} KiB`);
    console.log(`  Savings: ${result.savings}%`);
    console.log('');
  }
  
  const totalSavings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);
  const totalSavingsKB = ((totalOriginalSize - totalOptimizedSize) / 1024).toFixed(2);
  
  console.log('📈 Summary:');
  console.log(`Total original size: ${(totalOriginalSize / 1024).toFixed(2)} KiB`);
  console.log(`Total optimized size: ${(totalOptimizedSize / 1024).toFixed(2)} KiB`);
  console.log(`Total savings: ${totalSavingsKB} KiB (${totalSavings}%)`);
  
  return {
    totalOriginalSize,
    totalOptimizedSize,
    totalSavings: totalSavings,
    totalSavingsKB: totalSavingsKB
  };
}

function generateOptimizationRecommendations() {
  console.log('\n💡 CSS Optimization Recommendations:\n');
  
  console.log('1. 🎯 Critical CSS Inlining:');
  console.log('   - Extract critical CSS for above-the-fold content');
  console.log('   - Inline critical CSS in <head>');
  console.log('   - Defer non-critical CSS loading');
  
  console.log('\n2. 📦 CSS Code Splitting:');
  console.log('   - Split CSS by components/pages');
  console.log('   - Use dynamic imports for route-based CSS');
  console.log('   - Implement CSS lazy loading');
  
  console.log('\n3. 🗜️ CSS Minification:');
  console.log('   - Enable CSS minification in build process');
  console.log('   - Remove comments and whitespace');
  console.log('   - Optimize CSS selectors');
  
  console.log('\n4. 🎨 CSS Architecture:');
  console.log('   - Use CSS-in-JS for component-scoped styles');
  console.log('   - Implement CSS custom properties for theming');
  console.log('   - Consider utility-first CSS (Tailwind)');
  
  console.log('\n5. 🔄 CSS Caching:');
  console.log('   - Implement long-term caching for CSS files');
  console.log('   - Use content hashing for cache busting');
  console.log('   - Set appropriate cache headers');
}

async function optimizeCSS() {
  console.log('🚀 Starting CSS optimization...\n');
  
  try {
    const results = await analyzeCSSUsage();
    
    if (results.length > 0) {
      const summary = generateCSSOptimizationReport(results);
      generateOptimizationRecommendations();
      
      console.log('\n✅ CSS optimization complete!');
      console.log(`💾 Total potential savings: ${summary.totalSavingsKB} KiB`);
      
      // Create a summary file
      const summaryPath = path.join(__dirname, '../css-optimization-report.json');
      fs.writeFileSync(summaryPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary,
        results
      }, null, 2));
      
      console.log(`📄 Detailed report saved to: ${summaryPath}`);
    } else {
      console.log('⚠️  No CSS files found or no optimization possible');
    }
  } catch (error) {
    console.error('❌ CSS optimization failed:', error.message);
  }
}

// Run the optimization
optimizeCSS().catch(console.error);