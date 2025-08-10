#!/bin/bash

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
lighthouse https://felearn.vercel.app \
  --output=json \
  --output-path=./lighthouse-mobile-report.json \
  --chrome-flags="--headless" \
  --only-categories=performance

# Run Lighthouse for desktop
echo "💻 Desktop Performance Audit..."
lighthouse https://felearn.vercel.app \
  --output=json \
  --output-path=./lighthouse-desktop-report.json \
  --chrome-flags="--headless" \
  --only-categories=performance \
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
