#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Felearn AI Performance Optimization Suite');
console.log('=============================================\n');

// Performance optimization configuration
const OPTIMIZATION_CONFIG = {
  // Target performance scores
  targetScores: {
    performance: 90,
    accessibility: 95,
    bestPractices: 95,
    seo: 95
  },
  
  // File size targets
  sizeTargets: {
    totalBundleSize: 500, // KB
    imageOptimization: 50, // % reduction
    cssOptimization: 30, // % reduction
    jsOptimization: 25 // % reduction
  }
};

// Lighthouse audit issues from the report
const LIGHTHOUSE_ISSUES = {
  renderBlocking: {
    description: 'Render-blocking resources',
    potentialSavings: '2,100 ms',
    priority: 'high'
  },
  imageOptimization: {
    description: 'Improve image delivery',
    potentialSavings: '412 KiB',
    priority: 'high'
  },
  cachePolicy: {
    description: 'Use efficient cache lifetimes',
    potentialSavings: '5,522 KiB',
    priority: 'medium'
  },
  unusedCSS: {
    description: 'Reduce unused CSS',
    potentialSavings: '24 KiB',
    priority: 'medium'
  },
  unusedJS: {
    description: 'Reduce unused JavaScript',
    potentialSavings: '86 KiB',
    priority: 'medium'
  },
  fontDisplay: {
    description: 'Font display optimization',
    potentialSavings: '40 ms',
    priority: 'low'
  }
};

async function runImageOptimization() {
  console.log('📸 Step 1: Image Optimization');
  console.log('-----------------------------\n');
  
  try {
    console.log('Running image optimization script...');
    execSync('node scripts/optimize-images.js', { stdio: 'inherit' });
    console.log('✅ Image optimization complete!\n');
  } catch (error) {
    console.log('⚠️  Image optimization failed, continuing...\n');
  }
}

async function runCSSOptimization() {
  console.log('🎨 Step 2: CSS Optimization');
  console.log('---------------------------\n');
  
  try {
    console.log('Running CSS optimization script...');
    execSync('node scripts/optimize-css.js', { stdio: 'inherit' });
    console.log('✅ CSS optimization complete!\n');
  } catch (error) {
    console.log('⚠️  CSS optimization failed, continuing...\n');
  }
}

async function runBundleAnalysis() {
  console.log('📦 Step 3: Bundle Analysis');
  console.log('--------------------------\n');
  
  try {
    console.log('Running bundle analysis...');
    execSync('node scripts/analyze-bundle.js', { stdio: 'inherit' });
    console.log('✅ Bundle analysis complete!\n');
  } catch (error) {
    console.log('⚠️  Bundle analysis failed, continuing...\n');
  }
}

function generatePerformanceReport() {
  console.log('📊 Performance Optimization Report');
  console.log('==================================\n');
  
  console.log('🎯 Target Performance Scores:');
  Object.entries(OPTIMIZATION_CONFIG.targetScores).forEach(([metric, target]) => {
    console.log(`  ${metric.toUpperCase()}: ${target}/100`);
  });
  console.log('');
  
  console.log('🔍 Lighthouse Issues Identified:');
  Object.entries(LIGHTHOUSE_ISSUES).forEach(([issue, details]) => {
    const priorityIcon = details.priority === 'high' ? '🔴' : 
                        details.priority === 'medium' ? '🟡' : '🟢';
    console.log(`  ${priorityIcon} ${details.description}`);
    console.log(`     Potential savings: ${details.potentialSavings}`);
    console.log(`     Priority: ${details.priority}`);
    console.log('');
  });
  
  console.log('💡 Optimization Recommendations:\n');
  
  console.log('1. 🚀 Immediate Actions (High Priority):');
  console.log('   • Replace large PNG/JPEG images with WebP/AVIF formats');
  console.log('   • Implement responsive images with srcset');
  console.log('   • Add preconnect hints for critical domains');
  console.log('   • Defer non-critical CSS and JavaScript');
  console.log('');
  
  console.log('2. 📦 Resource Optimization (Medium Priority):');
  console.log('   • Implement proper cache headers (1 year for static assets)');
  console.log('   • Remove unused CSS and JavaScript');
  console.log('   • Optimize third-party script loading');
  console.log('   • Implement lazy loading for images and components');
  console.log('');
  
  console.log('3. 🎯 Advanced Optimizations (Low Priority):');
  console.log('   • Add font-display: swap for web fonts');
  console.log('   • Implement service worker for caching');
  console.log('   • Use HTTP/2 server push for critical resources');
  console.log('   • Implement resource hints (preload, prefetch)');
  console.log('');
}

function createOptimizedHTMLTemplate() {
  console.log('🔧 Creating optimized HTML template...\n');
  
  const optimizedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
    
    <!-- Preconnect to critical domains -->
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
    <link rel="preconnect" href="https://cdn.prod.website-files.com" crossorigin>
    <link rel="preconnect" href="https://d3e54v103j8qbb.cloudfront.net" crossorigin>
    
    <!-- Preload critical resources -->
    <link rel="preload" href="/assets/css/critical.css" as="style">
    <link rel="preload" href="/assets/fonts/raginy-titanium.woff2" as="font" type="font/woff2" crossorigin>
    
    <!-- Critical CSS inline -->
    <style>
      /* Critical above-the-fold CSS */
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .loading { display: flex; justify-content: center; align-items: center; height: 100vh; }
      .loading-spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
    
    <!-- Defer non-critical CSS -->
    <link rel="preload" href="/assets/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="/assets/css/main.css"></noscript>
    
    <title>Felearn AI | Learn Complex Concepts with Cute Cat Stories</title>
    <meta name="description" content="Transform complex topics into engaging visual stories featuring adorable cats. AI-powered educational platform that makes learning fun and memorable." />
</head>
<body>
    <div id="loading-screen" class="loading">
        <div class="loading-spinner"></div>
    </div>
    
    <div id="root"></div>
    
    <!-- Optimized script loading -->
    <script type="module" src="/src/main.tsx"></script>
    
    <!-- Defer third-party scripts -->
    <script>
      window.addEventListener('load', function() {
        // Remove loading screen
        setTimeout(() => {
          const loadingScreen = document.getElementById('loading-screen');
          if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.remove(), 300);
          }
        }, 500);
        
        // Load non-critical scripts
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
    </script>
</body>
</html>`;
  
  const templatePath = path.join(__dirname, '../index-optimized-template.html');
  fs.writeFileSync(templatePath, optimizedHTML);
  
  console.log(`✅ Optimized HTML template created: ${templatePath}`);
}

function createVercelConfig() {
  console.log('🔧 Creating optimized Vercel configuration...\n');
  
  const vercelConfig = `{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
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
  }
}`;
  
  const configPath = path.join(__dirname, '../vercel.optimized.json');
  fs.writeFileSync(configPath, vercelConfig);
  
  console.log(`✅ Optimized Vercel config created: ${configPath}`);
}

function createPerformanceBudget() {
  console.log('💰 Creating performance budget...\n');
  
  const budget = {
    budgets: [
      {
        path: "/*",
        timings: [
          {
            metric: "First Contentful Paint",
            budget: 1000
          },
          {
            metric: "Largest Contentful Paint",
            budget: 2500
          },
          {
            metric: "Cumulative Layout Shift",
            budget: 0.1
          },
          {
            metric: "Total Blocking Time",
            budget: 300
          }
        ],
        resourceSizes: [
          {
            resourceType: "script",
            budget: 300
          },
          {
            resourceType: "total",
            budget: 500
          }
        ]
      }
    ]
  };
  
  const budgetPath = path.join(__dirname, '../performance-budget.json');
  fs.writeFileSync(budgetPath, JSON.stringify(budget, null, 2));
  
  console.log(`✅ Performance budget created: ${budgetPath}`);
}

async function runFullOptimization() {
  console.log('🚀 Starting comprehensive performance optimization...\n');
  
  try {
    // Run optimization steps
    await runImageOptimization();
    await runCSSOptimization();
    await runBundleAnalysis();
    
    // Generate reports and configurations
    generatePerformanceReport();
    createOptimizedHTMLTemplate();
    createVercelConfig();
    createPerformanceBudget();
    
    console.log('🎉 Performance optimization complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Review the generated optimization reports');
    console.log('2. Replace the current index.html with the optimized template');
    console.log('3. Update vercel.json with the optimized configuration');
    console.log('4. Run a new Lighthouse audit to measure improvements');
    console.log('5. Monitor Core Web Vitals in production');
    
    console.log('\n📊 Expected Improvements:');
    console.log('• Performance Score: 50 → 85+ (Mobile), 67 → 90+ (Desktop)');
    console.log('• First Contentful Paint: 5.7s → 1.5s (Mobile), 0.9s → 0.6s (Desktop)');
    console.log('• Largest Contentful Paint: 11.3s → 2.5s (Mobile), 1.8s → 1.2s (Desktop)');
    console.log('• Total Blocking Time: 390ms → 150ms (Mobile), 610ms → 200ms (Desktop)');
    console.log('• Bundle Size: ~7MB → ~2MB');
    
  } catch (error) {
    console.error('❌ Performance optimization failed:', error.message);
  }
}

// Run the full optimization suite
runFullOptimization().catch(console.error);