#!/bin/bash

echo "🚀 Felearn AI Quick Performance Optimization"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Running comprehensive performance optimization..."
node scripts/optimize-performance.js

echo ""
echo "✅ Optimization complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review the generated reports in the project root"
echo "2. Replace index.html with index-optimized-template.html"
echo "3. Update vercel.json with vercel.optimized.json"
echo "4. Run: npm run build:optimized"
echo "5. Deploy: npm run deploy:optimized"
echo "6. Test with: npm run lighthouse"
echo ""
echo "📊 Expected improvements:"
echo "• Performance Score: 50 → 85+ (Mobile), 67 → 90+ (Desktop)"
echo "• Bundle Size: ~7MB → ~2MB"
echo "• FCP: 5.7s → 1.5s (Mobile)"
echo "• LCP: 11.3s → 2.5s (Mobile)"
echo ""
echo "🎉 Happy optimizing!"