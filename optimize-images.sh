#!/bin/bash

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
npx sharp public/assets/images/animation-sequence-Cdz_3fVj.png \
  --resize 370 330 \
  --webp \
  --quality 85 \
  --output public/assets/images/optimized/animation-sequence.webp

echo "📸 Processing linked-system-p-800-DnqDCWJs.png..."
npx sharp public/assets/images/linked-system-p-800-DnqDCWJs.png \
  --resize 370 330 \
  --webp \
  --quality 85 \
  --output public/assets/images/optimized/linked-system.webp

echo "📸 Processing felearn-logo-BoldL7TU.png..."
npx sharp public/assets/images/felearn-logo-BoldL7TU.png \
  --resize 352 103 \
  --webp \
  --quality 85 \
  --output public/assets/images/optimized/felearn-logo.webp

echo "📸 Processing youtube-placeholder-kFh5XbQG.jpg..."
npx sharp public/assets/images/youtube-placeholder-kFh5XbQG.jpg \
  --resize 370 217 \
  --webp \
  --quality 85 \
  --output public/assets/images/optimized/youtube-placeholder.webp

echo "✅ Image optimization complete!"
echo "📁 Optimized images saved to: public/assets/images/optimized/"
echo ""
echo "📋 Next steps:"
echo "1. Update HTML to use WebP images with fallbacks"
echo "2. Test in different browsers"
echo "3. Verify image quality and performance"
