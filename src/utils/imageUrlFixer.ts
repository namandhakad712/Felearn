import { appwriteService } from '../services/appwrite';
import { storyService } from '../services/storyService';
import { 
  parseAppwriteUrl, 
  // generateFileViewUrl, // Removed unused import
  optimizeImageUrl,
  // getStorySlideImageUrl, // Removed unused import
  // getStoryThumbnailUrl // Removed unused import
} from './appwriteStorageHelper';

/**
 * Comprehensive Image URL Fixer for Appwrite Storage Issues
 */

export interface ImageFixResult {
  success: boolean;
  originalUrl: string;
  fixedUrl?: string;
  error?: string;
}

export interface BulkFixResult {
  totalStories: number;
  totalImages: number;
  fixedImages: number;
  failedImages: number;
  errors: string[];
}

/**
 * Extract file ID from various Appwrite URL formats (using official helper)
 */
export const extractFileIdFromAppwriteUrl = (url: string): string | null => {
  const { fileId } = parseAppwriteUrl(url);
  return fileId || null;
};

/**
 * Convert any Appwrite URL to a direct view URL using official methods
 */
export const convertToDirectViewUrl = (url: string): string => {
  if (!url) return url;

  // If it's not an Appwrite URL, return as-is
  if (!url.includes('appwrite')) {
    return url;
  }

  // If it's already a view URL, return as-is
  if (url.includes('/view') && !url.includes('/preview')) {
    return url;
  }

  // Use the official storage helper
  return optimizeImageUrl(url);
};

/**
 * Create optimized preview URL using Appwrite's image transformation features
 */
export const createOptimizedPreviewUrl = (
  url: string, 
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpg' | 'jpeg' | 'png' | 'webp' | 'gif';
    gravity?: 'center' | 'top-left' | 'top' | 'top-right' | 'left' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right';
  } = {}
): string => {
  if (!url || !url.includes('appwrite')) {
    return url;
  }

  const fileId = extractFileIdFromAppwriteUrl(url);
  if (!fileId) {
    return url;
  }

  try {
    // Build preview URL with transformations
    const baseUrl = url.split('/files/')[0];
    const bucketId = url.match(/\/buckets\/([^/]+)\//)?.[1];
    
    if (!bucketId) {
      return url;
    }

    let previewUrl = `${baseUrl}/files/${fileId}/preview`;
    const params = new URLSearchParams();

    // Add transformation parameters
    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.quality) params.append('quality', options.quality.toString());
    if (options.format) params.append('output', options.format);
    if (options.gravity) params.append('gravity', options.gravity);

    const queryString = params.toString();
    if (queryString) {
      previewUrl += `?${queryString}`;
    }

    return previewUrl;
  } catch (error) {
    console.error('Error creating optimized preview URL:', error);
    return url;
  }
};

/**
 * Test if an image URL loads successfully
 */
export const testImageLoad = (url: string, timeout: number = 10000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    const img = new Image();
    let resolved = false;

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        img.onload = null;
        img.onerror = null;
      }
    };

    img.onload = () => {
      cleanup();
      resolve(true);
    };

    img.onerror = () => {
      cleanup();
      resolve(false);
    };

    // Set timeout
    setTimeout(() => {
      if (!resolved) {
        cleanup();
        resolve(false);
      }
    }, timeout);

    try {
      img.src = url;
    } catch (error) {
      cleanup();
      resolve(false);
    }
  });
};

/**
 * Fix a single image URL with multiple fallback strategies based on official Appwrite methods
 */
export const fixSingleImageUrl = async (originalUrl: string): Promise<ImageFixResult> => {
  if (!originalUrl) {
    return {
      success: false,
      originalUrl,
      error: 'Empty URL'
    };
  }

  // Strategy 1: Test original URL
  const originalWorks = await testImageLoad(originalUrl);
  if (originalWorks) {
    return {
      success: true,
      originalUrl,
      fixedUrl: originalUrl
    };
  }

  // Strategy 2: Convert to direct view URL using official method
  if (originalUrl.includes('appwrite')) {
    const directUrl = convertToDirectViewUrl(originalUrl);
    if (directUrl !== originalUrl) {
      const directWorks = await testImageLoad(directUrl);
      if (directWorks) {
        return {
          success: true,
          originalUrl,
          fixedUrl: directUrl
        };
      }
    }
  }

  // Strategy 3: Try optimized preview URL with different formats
  if (originalUrl.includes('appwrite')) {
    const fileId = extractFileIdFromAppwriteUrl(originalUrl);
    if (fileId) {
      // Try different formats and optimizations
      const optimizedVariations = [
        createOptimizedPreviewUrl(originalUrl, { format: 'webp', quality: 85 }),
        createOptimizedPreviewUrl(originalUrl, { format: 'jpg', quality: 90 }),
        createOptimizedPreviewUrl(originalUrl, { format: 'png' }),
        createOptimizedPreviewUrl(originalUrl, { width: 800, quality: 85 }),
      ];

      for (const variation of optimizedVariations) {
        if (variation !== originalUrl) {
          const works = await testImageLoad(variation);
          if (works) {
            return {
              success: true,
              originalUrl,
              fixedUrl: variation
            };
          }
        }
      }
    }
  }

  // Strategy 4: Try different endpoint formats (legacy support)
  if (originalUrl.includes('appwrite')) {
    const fileId = extractFileIdFromAppwriteUrl(originalUrl);
    if (fileId) {
      const variations = [
        appwriteService.getFileUrl(fileId),
        originalUrl.replace('/preview', '/view'),
        originalUrl.replace('/view', '/preview'),
        originalUrl.replace('/download', '/view'),
      ];

      for (const variation of variations) {
        if (variation !== originalUrl) {
          const works = await testImageLoad(variation);
          if (works) {
            return {
              success: true,
              originalUrl,
              fixedUrl: variation
            };
          }
        }
      }
    }
  }

  return {
    success: false,
    originalUrl,
    error: 'All fix strategies failed'
  };
};

/**
 * Fix all images in a single story
 */
export const fixStoryImages = async (storyId: string): Promise<{
  success: boolean;
  totalImages: number;
  fixedImages: number;
  failedImages: number;
  errors: string[];
}> => {
  const errors: string[] = [];
  
  try {
    console.log('🔧 Fixing images for story:', storyId);
    
    // Get the story
    const story = await storyService.getStory(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    if (!story.images || story.images.length === 0) {
      return {
        success: true,
        totalImages: 0,
        fixedImages: 0,
        failedImages: 0,
        errors: []
      };
    }

    const originalImages = story.images;
    const fixedImages: string[] = [];
    let fixedCount = 0;
    let failedCount = 0;

    // Fix each image
    for (let i = 0; i < originalImages.length; i++) {
      const originalUrl = originalImages[i];
      console.log(`🔧 Fixing image ${i + 1}/${originalImages.length}:`, originalUrl.substring(0, 50) + '...');
      
      const result = await fixSingleImageUrl(originalUrl);
      
      if (result.success && result.fixedUrl) {
        fixedImages.push(result.fixedUrl);
        if (result.fixedUrl !== originalUrl) {
          fixedCount++;
          console.log(`✅ Fixed image ${i + 1}: ${originalUrl.substring(0, 30)}... → ${result.fixedUrl.substring(0, 30)}...`);
        }
      } else {
        fixedImages.push(originalUrl); // Keep original even if it doesn't work
        failedCount++;
        errors.push(`Image ${i + 1}: ${result.error || 'Unknown error'}`);
        console.error(`❌ Failed to fix image ${i + 1}:`, result.error);
      }
    }

    // Update story if any images were fixed
    if (fixedCount > 0) {
      await storyService.updateStory(storyId, { images: fixedImages });
      console.log(`✅ Updated story ${storyId} with ${fixedCount} fixed images`);
    }

    return {
      success: failedCount === 0,
      totalImages: originalImages.length,
      fixedImages: fixedCount,
      failedImages: failedCount,
      errors
    };

  } catch (error: any) {
    console.error('❌ Error fixing story images:', error);
    errors.push(`Story fix error: ${error.message}`);
    
    return {
      success: false,
      totalImages: 0,
      fixedImages: 0,
      failedImages: 0,
      errors
    };
  }
};

/**
 * Fix images for all user stories
 */
export const fixAllUserImages = async (userId: string): Promise<BulkFixResult> => {
  // Starting bulk image fix
  
  const result: BulkFixResult = {
    totalStories: 0,
    totalImages: 0,
    fixedImages: 0,
    failedImages: 0,
    errors: []
  };

  try {
    // Get all user stories
    const storiesResult = await storyService.getUserStories(userId);
    const stories = storiesResult.stories;
    
    result.totalStories = stories.length;
    
    if (stories.length === 0) {
      // No stories found for user
      return result;
    }

    // Fix each story
    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      // Processing story
      
      try {
        const storyResult = await fixStoryImages(story.$id);
        
        result.totalImages += storyResult.totalImages;
        result.fixedImages += storyResult.fixedImages;
        result.failedImages += storyResult.failedImages;
        result.errors.push(...storyResult.errors);
        
      } catch (error: any) {
        console.error(`❌ Error processing story ${story.title}:`, error);
        result.errors.push(`Story "${story.title}": ${error.message}`);
      }
    }

    console.log('✅ Bulk image fix completed:', {
      totalStories: result.totalStories,
      totalImages: result.totalImages,
      fixedImages: result.fixedImages,
      failedImages: result.failedImages,
      successRate: result.totalImages > 0 ? Math.round((result.fixedImages / result.totalImages) * 100) : 0
    });

    return result;

  } catch (error: any) {
    console.error('❌ Error in bulk image fix:', error);
    result.errors.push(`Bulk fix error: ${error.message}`);
    return result;
  }
};

/**
 * Create a fallback image with story information
 */
export const createStoryFallbackImage = (
  storyTitle: string,
  slideNumber?: number,
  width: number = 600,
  height: number = 400
): string => {
  const title = slideNumber ? `Slide ${slideNumber}` : storyTitle;
  const subtitle = slideNumber ? storyTitle : 'AI Generated Story';
  
  // Create a more attractive fallback with gradients and better typography
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="overlay" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <rect width="100%" height="100%" fill="url(#overlay)"/>
      
      <!-- Pattern -->
      <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/>
      </pattern>
      <rect width="100%" height="100%" fill="url(#dots)"/>
      
      <!-- Icon -->
      <g transform="translate(${width/2 - 30}, ${height/2 - 40})">
        <rect x="10" y="10" width="40" height="30" rx="4" fill="white" opacity="0.2"/>
        <circle cx="20" cy="20" r="3" fill="white" opacity="0.3"/>
        <rect x="30" y="25" width="15" height="2" rx="1" fill="white" opacity="0.3"/>
        <rect x="30" y="30" width="10" height="2" rx="1" fill="white" opacity="0.3"/>
      </g>
      
      <!-- Title -->
      <text x="50%" y="${height/2 + 20}" 
            font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" 
            font-size="${Math.min(24, width * 0.04)}" 
            font-weight="600"
            fill="white" 
            text-anchor="middle" 
            dy=".3em">
        ${title.length > 30 ? title.substring(0, 30) + '...' : title}
      </text>
      
      <!-- Subtitle -->
      <text x="50%" y="${height/2 + 45}" 
            font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" 
            font-size="${Math.min(16, width * 0.025)}" 
            fill="white" 
            opacity="0.8"
            text-anchor="middle" 
            dy=".3em">
        ${subtitle.length > 40 ? subtitle.substring(0, 40) + '...' : subtitle}
      </text>
      
      <!-- Felearn branding -->
      <text x="50%" y="${height - 20}" 
            font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" 
            font-size="12" 
            fill="white" 
            opacity="0.6"
            text-anchor="middle" 
            dy=".3em">
        Felearn AI Stories
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Enhanced image component with automatic fallback
 */
export const createImageWithFallback = (
  src: string,
  alt: string,
  storyTitle: string,
  slideNumber?: number,
  className?: string
): HTMLImageElement => {
  const img = new Image();
  img.className = className || '';
  img.alt = alt;
  
  // Set up error handling with fallback
  img.onerror = () => {
    console.warn('Image failed to load, using fallback:', src.substring(0, 50) + '...');
    img.src = createStoryFallbackImage(storyTitle, slideNumber);
    img.alt = `${alt} (fallback)`;
  };
  
  // Set the source (this might trigger onerror if it fails)
  img.src = src;
  
  return img;
};