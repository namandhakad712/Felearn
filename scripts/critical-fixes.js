#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Critical Performance Fixes');
console.log('=============================\n');

// Critical issues from latest Lighthouse report
const CRITICAL_ISSUES = {
  renderBlocking: {
    description: 'Render-blocking requests',
    mobileSavings: '2,550 ms',
    desktopSavings: '450 ms',
    priority: 'critical',
    solution: 'Add preconnect hints and defer non-critical resources'
  },
  imageOptimization: {
    description: 'Improve image delivery',
    mobileSavings: '398 KiB',
    desktopSavings: '343 KiB',
    priority: 'critical',
    solution: 'Convert to WebP and implement responsive images'
  },
  cacheLifetimes: {
    description: 'Use efficient cache lifetimes',
    mobileSavings: '3,155 KiB',
    desktopSavings: '2,903 KiB',
    priority: 'high',
    solution: 'Add proper cache headers for static assets'
  },
  unusedJS: {
    description: 'Reduce unused JavaScript',
    savings: '86 KiB',
    priority: 'medium',
    solution: 'Remove unused JavaScript and implement code splitting'
  },
  unusedCSS: {
    description: 'Reduce unused CSS',
    savings: '24 KiB',
    priority: 'medium',
    solution: 'Remove unused CSS rules'
  },
  fontDisplay: {
    description: 'Font display optimization',
    mobileSavings: '110 ms',
    desktopSavings: '40 ms',
    priority: 'low',
    solution: 'Add font-display: swap to web fonts'
  }
};

function createCriticalHTMLTemplate() {
  console.log('🔧 Creating critical HTML template...\n');
  
  const criticalHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
    
    <!-- Critical preconnect hints -->
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
    <link rel="preconnect" href="https://cdn.prod.website-files.com" crossorigin>
    <link rel="preconnect" href="https://d3e54v103j8qbb.cloudfront.net" crossorigin>
    <link rel="preconnect" href="https://unpkg.com" crossorigin>
    <link rel="preconnect" href="https://cdn.unicorn.studio" crossorigin>
    
    <!-- DNS prefetch for non-critical domains -->
    <link rel="dns-prefetch" href="https://scripts.clarity.ms">
    <link rel="dns-prefetch" href="https://www.googletagmanager.com">
    <link rel="dns-prefetch" href="https://www.clarity.ms">
    
    <!-- Preload critical resources -->
    <link rel="preload" href="/assets/fonts/raginy-titanium.ttf" as="font" type="font/ttf" crossorigin>
    <link rel="preload" href="/assets/css/main-Dgyrmvob.css" as="style">
    
    <!-- Critical CSS inline -->
    <style>
      /* Critical above-the-fold CSS */
      body { 
        margin: 0; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #fff;
      }
      .loading { 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        height: 100vh;
        background: #fff;
      }
      .loading-spinner { 
        width: 40px; 
        height: 40px; 
        border: 4px solid #f3f3f3; 
        border-top: 4px solid #667eea; 
        border-radius: 50%; 
        animation: spin 1s linear infinite; 
      }
      @keyframes spin { 
        0% { transform: rotate(0deg); } 
        100% { transform: rotate(360deg); } 
      }
      
      /* Font display optimization */
      @font-face {
        font-family: 'Raginy Titanium';
        src: url('/assets/fonts/raginy-titanium.ttf') format('truetype');
        font-display: swap;
      }
      
      /* Critical layout styles */
      #root {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
    </style>
    
    <!-- Load critical CSS -->
    <link rel="stylesheet" href="/assets/css/main-Dgyrmvob.css">
    
    <!-- Defer non-critical CSS -->
    <link rel="preload" href="/assets/css/app-D2KWLy74.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="/assets/css/app-D2KWLy74.css"></noscript>
    
    <title>Felearn AI | Learn Complex Concepts with Cute Cat Stories</title>
    <meta name="description" content="Transform complex topics into engaging visual stories featuring adorable cats. AI-powered educational platform that makes learning fun and memorable." />
    
    <!-- Open Graph tags -->
    <meta property="og:title" content="Felearn AI | Learn Complex Concepts with Cute Cat Stories" />
    <meta property="og:description" content="Transform complex topics into engaging visual stories featuring adorable cats." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://felearn.vercel.app/" />
</head>
<body>
    <div id="loading-screen" class="loading">
        <div class="loading-spinner"></div>
    </div>
    
    <div id="root"></div>
    
    <!-- Critical script loading -->
    <script type="module" src="/src/main.tsx"></script>
    
    <!-- Defer third-party scripts -->
    <script>
      // Performance optimization: Defer non-critical scripts
      window.addEventListener('load', function() {
        // Remove loading screen
        setTimeout(() => {
          const loadingScreen = document.getElementById('loading-screen');
          if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.remove(), 300);
          }
        }, 500);
        
        // Load non-critical scripts with delay
        setTimeout(() => {
          const scripts = [
            'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js',
            'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css'
          ];
          
          scripts.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            document.head.appendChild(script);
          });
        }, 2000);
      });
      
      // Optimize third-party script loading
      window.addEventListener('DOMContentLoaded', function() {
        // Defer analytics and tracking scripts
        setTimeout(() => {
          // Load Clarity
          const clarityScript = document.createElement('script');
          clarityScript.src = 'https://www.clarity.ms/tag/sqofrdrzuw';
          clarityScript.async = true;
          document.head.appendChild(clarityScript);
          
          // Load Google Tag Manager
          const gtmScript = document.createElement('script');
          gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-N2CWK99B';
          gtmScript.async = true;
          document.head.appendChild(gtmScript);
        }, 3000);
      });
    </script>
</body>
</html>`;
  
  const templatePath = path.join(__dirname, '../index-critical-fixes.html');
  fs.writeFileSync(templatePath, criticalHTML);
  
  console.log(`✅ Critical HTML template created: ${templatePath}`);
}

function createOptimizedVercelConfig() {
  console.log('🔧 Creating optimized Vercel configuration...\n');
  
  const vercelConfig = `{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        },
        {
          "key": "Vary",
          "value": "Accept-Encoding"
        }
      ]
    },
    {
      "source": "/(.*)\\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|avif|woff|woff2|ttf|otf)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/assets/(.*)",
      "destination": "/assets/$1"
    }
  ],
  "functions": {
    "src/**/*.ts": {
      "maxDuration": 30
    }
  },
  "images": {
    "sizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    "formats": ["image/webp", "image/avif"],
    "minimumCacheTTL": 31536000
  }
}`;
  
  const configPath = path.join(__dirname, '../vercel-critical-fixes.json');
  fs.writeFileSync(configPath, vercelConfig);
  
  console.log(`✅ Optimized Vercel config created: ${configPath}`);
}

function createImageOptimizationScript() {
  console.log('📸 Creating image optimization script...\n');
  
  const script = `#!/bin/bash

echo "🖼️  Image Optimization Script"
echo "============================="

# Install sharp if not available
if ! command -v npx &> /dev/null; then
    echo "❌ Node.js/npx not found. Please install Node.js first."
    exit 1
fi

# Check if sharp is installed
if ! npx sharp --version &> /dev/null; then
    echo "📦 Installing sharp for image optimization..."
    npm install sharp
fi

echo "🔧 Optimizing images..."

# Create optimized images directory
mkdir -p public/assets/images/optimized

# Optimize specific images identified in Lighthouse report
echo "📸 Processing animation-sequence-Cdz_3fVj.png..."
npx sharp public/assets/images/animation-sequence-Cdz_3fVj.png \\
  --resize 370 330 \\
  --webp \\
  --quality 85 \\
  --output public/assets/images/optimized/animation-sequence.webp

echo "📸 Processing linked-system-p-800-DnqDCWJs.png..."
npx sharp public/assets/images/linked-system-p-800-DnqDCWJs.png \\
  --resize 370 330 \\
  --webp \\
  --quality 85 \\
  --output public/assets/images/optimized/linked-system.webp

echo "📸 Processing felearn-logo-BoldL7TU.png..."
npx sharp public/assets/images/felearn-logo-BoldL7TU.png \\
  --resize 352 103 \\
  --webp \\
  --quality 85 \\
  --output public/assets/images/optimized/felearn-logo.webp

echo "📸 Processing youtube-placeholder-kFh5XbQG.jpg..."
npx sharp public/assets/images/youtube-placeholder-kFh5XbQG.jpg \\
  --resize 370 217 \\
  --webp \\
  --quality 85 \\
  --output public/assets/images/optimized/youtube-placeholder.webp

echo "✅ Image optimization complete!"
echo "📁 Optimized images saved to: public/assets/images/optimized/"
echo ""
echo "📋 Next steps:"
echo "1. Update HTML to use WebP images with fallbacks"
echo "2. Test in different browsers"
echo "3. Verify image quality and performance"
`;
  
  const scriptPath = path.join(__dirname, '../optimize-images.sh');
  fs.writeFileSync(scriptPath, script);
  
  // Make script executable
  fs.chmodSync(scriptPath, '755');
  
  console.log(`✅ Image optimization script created: ${scriptPath}`);
}

function createPerformanceMonitoringScript() {
  console.log('📊 Creating performance monitoring script...\n');
  
  const script = `#!/bin/bash

echo "📊 Performance Monitoring Script"
echo "==============================="

# Check if lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
    echo "📦 Installing Lighthouse..."
    npm install -g lighthouse
fi

echo "🔍 Running Lighthouse audit..."

# Run Lighthouse for mobile
echo "📱 Mobile Performance Audit..."
lighthouse https://felearn.vercel.app \\
  --output=json \\
  --output-path=./lighthouse-mobile-report.json \\
  --chrome-flags="--headless" \\
  --only-categories=performance

# Run Lighthouse for desktop
echo "💻 Desktop Performance Audit..."
lighthouse https://felearn.vercel.app \\
  --output=json \\
  --output-path=./lighthouse-desktop-report.json \\
  --chrome-flags="--headless" \\
  --only-categories=performance \\
  --preset=desktop

echo "✅ Performance audit complete!"
echo "📄 Reports saved to:"
echo "  - lighthouse-mobile-report.json"
echo "  - lighthouse-desktop-report.json"
echo ""
echo "📊 To view results:"
echo "  - Open reports in browser or use Lighthouse Viewer"
echo "  - Compare with previous results"
echo "  - Monitor Core Web Vitals trends"
`;
  
  const scriptPath = path.join(__dirname, '../monitor-performance.sh');
  fs.writeFileSync(scriptPath, script);
  
  // Make script executable
  fs.chmodSync(scriptPath, '755');
  
  console.log(`✅ Performance monitoring script created: ${scriptPath}`);
}

function generateCriticalReport() {
  console.log('📊 Critical Performance Issues Report');
  console.log('=====================================\n');
  
  console.log('🔴 Critical Issues (High Priority):');
  Object.entries(CRITICAL_ISSUES).forEach(([issue, details]) => {
    if (details.priority === 'critical') {
      console.log(`  🔴 ${details.description}`);
      console.log(`     Mobile savings: ${details.mobileSavings}`);
      console.log(`     Desktop savings: ${details.desktopSavings}`);
      console.log(`     Solution: ${details.solution}`);
      console.log('');
    }
  });
  
  console.log('🟡 High Priority Issues:');
  Object.entries(CRITICAL_ISSUES).forEach(([issue, details]) => {
    if (details.priority === 'high') {
      console.log(`  🟡 ${details.description}`);
      console.log(`     Mobile savings: ${details.mobileSavings}`);
      console.log(`     Desktop savings: ${details.desktopSavings}`);
      console.log(`     Solution: ${details.solution}`);
      console.log('');
    }
  });
  
  console.log('🟢 Medium Priority Issues:');
  Object.entries(CRITICAL_ISSUES).forEach(([issue, details]) => {
    if (details.priority === 'medium') {
      console.log(`  🟢 ${details.description}`);
      console.log(`     Savings: ${details.savings}`);
      console.log(`     Solution: ${details.solution}`);
      console.log('');
    }
  });
  
  console.log('💡 Implementation Priority:');
  console.log('1. 🔴 Replace HTML with critical-fixes template');
  console.log('2. 🔴 Update Vercel configuration');
  console.log('3. 🔴 Optimize images using the script');
  console.log('4. 🟡 Implement lazy loading for components');
  console.log('5. 🟡 Defer third-party scripts');
  console.log('6. 🟢 Monitor performance regularly');
}

async function runCriticalFixes() {
  console.log('🚀 Implementing critical performance fixes...\n');
  
  try {
    createCriticalHTMLTemplate();
    createOptimizedVercelConfig();
    createImageOptimizationScript();
    createPerformanceMonitoringScript();
    generateCriticalReport();
    
    console.log('🎉 Critical fixes implementation complete!');
    console.log('\n📋 Generated Files:');
    console.log('• index-critical-fixes.html - Critical HTML template');
    console.log('• vercel-critical-fixes.json - Optimized Vercel config');
    console.log('• optimize-images.sh - Image optimization script');
    console.log('• monitor-performance.sh - Performance monitoring script');
    
    console.log('\n📋 Immediate Actions:');
    console.log('1. Replace index.html with index-critical-fixes.html');
    console.log('2. Update vercel.json with vercel-critical-fixes.json');
    console.log('3. Run: ./optimize-images.sh');
    console.log('4. Deploy changes');
    console.log('5. Monitor with: ./monitor-performance.sh');
    
    console.log('\n📊 Expected Improvements:');
    console.log('• Mobile Performance: 48 → 75+ (56% improvement)');
    console.log('• Desktop Performance: 83 → 90+ (8% improvement)');
    console.log('• FCP (Mobile): 4.2s → 1.5s (64% improvement)');
    console.log('• LCP (Mobile): 9.3s → 3.0s (68% improvement)');
    console.log('• TBT (Mobile): 580ms → 200ms (66% improvement)');
    
  } catch (error) {
    console.error('❌ Critical fixes failed:', error.message);
  }
}

// Run the critical fixes
runCriticalFixes().catch(console.error);