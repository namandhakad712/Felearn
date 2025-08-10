#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if sharp is installed
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (error) {
  console.log('Installing sharp for image optimization...');
  execSync('npm install sharp', { stdio: 'inherit' });
  sharp = (await import('sharp')).default;
}

const ASSETS_DIR = path.join(__dirname, '../public/assets');
const IMAGES_DIR = path.join(ASSETS_DIR, 'images');

// Image optimization configuration
const OPTIMIZATION_CONFIG = {
  quality: 80,
  formats: ['webp', 'avif'],
  sizes: {
    thumbnail: 150,
    small: 300,
    medium: 600,
    large: 1200
  }
};

// Specific image optimizations based on Lighthouse report
const IMAGE_OPTIMIZATIONS = {
  'animation-sequence-Cdz_3fVj.png': {
    targetWidth: 370,
    targetHeight: 330,
    originalSize: '152.5 KiB',
    expectedSavings: '135.9 KiB'
  },
  'linked-system-p-800-DnqDCWJs.png': {
    targetWidth: 370,
    targetHeight: 330,
    originalSize: '145.7 KiB',
    expectedSavings: '125.8 KiB'
  },
  'felearn-logo-BoldL7TU.png': {
    targetWidth: 352,
    targetHeight: 103,
    originalSize: '86.3 KiB',
    expectedSavings: '80.4 KiB'
  },
  'youtube-placeholder-kFh5XbQG.jpg': {
    targetWidth: 370,
    targetHeight: 217,
    originalSize: '31.1 KiB',
    expectedSavings: '28.1 KiB'
  }
};

async function optimizeImage(inputPath, outputPath, options = {}) {
  try {
    const { width, height, quality = OPTIMIZATION_CONFIG.quality, format = 'webp' } = options;
    
    let pipeline = sharp(inputPath);
    
    if (width && height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    if (format === 'webp') {
      pipeline = pipeline.webp({ quality });
    } else if (format === 'avif') {
      pipeline = pipeline.avif({ quality });
    }
    
    await pipeline.toFile(outputPath);
    
    const originalStats = fs.statSync(inputPath);
    const optimizedStats = fs.statSync(outputPath);
    const savings = ((originalStats.size - optimizedStats.size) / originalStats.size * 100).toFixed(1);
    
    console.log(`✓ Optimized: ${path.basename(inputPath)} → ${path.basename(outputPath)} (${savings}% smaller)`);
    
    return {
      originalSize: originalStats.size,
      optimizedSize: optimizedStats.size,
      savings: savings
    };
  } catch (error) {
    console.error(`✗ Failed to optimize ${inputPath}:`, error.message);
    return null;
  }
}

async function createResponsiveImages(inputPath, baseName) {
  const results = [];
  
  for (const [sizeName, size] of Object.entries(OPTIMIZATION_CONFIG.sizes)) {
    for (const format of OPTIMIZATION_CONFIG.formats) {
      const outputPath = path.join(
        path.dirname(inputPath),
        `${baseName}-${sizeName}.${format}`
      );
      
      const result = await optimizeImage(inputPath, outputPath, {
        width: size,
        format,
        quality: OPTIMIZATION_CONFIG.quality
      });
      
      if (result) {
        results.push({ ...result, size: sizeName, format });
      }
    }
  }
  
  return results;
}

async function optimizeAllImages() {
  console.log('🚀 Starting image optimization...\n');
  
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('Images directory not found:', IMAGES_DIR);
    return;
  }
  
  const files = fs.readdirSync(IMAGES_DIR);
  const imageFiles = files.filter(file => 
    /\.(png|jpe?g|gif|bmp|tiff)$/i.test(file)
  );
  
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  
  for (const file of imageFiles) {
    const inputPath = path.join(IMAGES_DIR, file);
    const baseName = path.parse(file).name;
    
    console.log(`\n📸 Processing: ${file}`);
    
    // Check if this image has specific optimization requirements
    const optimization = IMAGE_OPTIMIZATIONS[file];
    
    if (optimization) {
      console.log(`  Target size: ${optimization.targetWidth}x${optimization.targetHeight}`);
      console.log(`  Expected savings: ${optimization.expectedSavings}`);
      
      // Create optimized version with target dimensions
      const webpPath = path.join(IMAGES_DIR, `${baseName}.webp`);
      const result = await optimizeImage(inputPath, webpPath, {
        width: optimization.targetWidth,
        height: optimization.targetHeight,
        format: 'webp',
        quality: 85
      });
      
      if (result) {
        totalOriginalSize += result.originalSize;
        totalOptimizedSize += result.optimizedSize;
      }
    }
    
    // Create responsive images for all images
    const responsiveResults = await createResponsiveImages(inputPath, baseName);
    
    for (const result of responsiveResults) {
      totalOriginalSize += result.originalSize;
      totalOptimizedSize += result.optimizedSize;
    }
  }
  
  const totalSavings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);
  const totalSavingsMB = ((totalOriginalSize - totalOptimizedSize) / (1024 * 1024)).toFixed(2);
  
  console.log('\n🎉 Image optimization complete!');
  console.log(`📊 Total original size: ${(totalOriginalSize / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`📊 Total optimized size: ${(totalOptimizedSize / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`💾 Total savings: ${totalSavingsMB} MB (${totalSavings}%)`);
  
  // Generate srcset suggestions
  console.log('\n📝 Suggested srcset attributes:');
  console.log('For responsive images, use:');
  console.log('srcset="image-small.webp 300w, image-medium.webp 600w, image-large.webp 1200w"');
  console.log('sizes="(max-width: 600px) 300px, (max-width: 1200px) 600px, 1200px"');
}

// Run the optimization
optimizeAllImages().catch(console.error);