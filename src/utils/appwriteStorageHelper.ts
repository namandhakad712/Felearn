import { appwriteService } from '../services/appwrite';

/**
 * Appwrite Storage Helper - Based on Official Documentation
 * Provides utilities for proper file URL generation and image transformations
 */

export interface ImageTransformOptions {
  width?: number;           // 0-4000
  height?: number;          // 0-4000
  gravity?: 'center' | 'top-left' | 'top' | 'top-right' | 'left' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right';
  quality?: number;         // 0-100
  borderWidth?: number;     // 0-100
  borderColor?: string;     // HEX color without #
  borderRadius?: number;    // 0-4000
  opacity?: number;         // 0-1
  rotation?: number;        // -360 to 360
  background?: string;      // HEX color without #
  output?: 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp' | 'avif' | 'heic';
}

/**
 * Extract bucket ID and file ID from Appwrite URL
 */
export const parseAppwriteUrl = (url: string): { bucketId?: string; fileId?: string } => {
  if (!url || !url.includes('appwrite')) {
    return {};
  }

  try {
    // Pattern: /storage/buckets/{bucketId}/files/{fileId}/...
    const match = url.match(/\/storage\/buckets\/([^\/]+)\/files\/([^\/\?]+)/);
    if (match) {
      return {
        bucketId: match[1],
        fileId: match[2]
      };
    }

    // Alternative pattern: /v1/storage/buckets/{bucketId}/files/{fileId}/...
    const altMatch = url.match(/\/v1\/storage\/buckets\/([^\/]+)\/files\/([^\/\?]+)/);
    if (altMatch) {
      return {
        bucketId: altMatch[1],
        fileId: altMatch[2]
      };
    }

    return {};
  } catch (error) {
    console.error('Error parsing Appwrite URL:', error);
    return {};
  }
};

/**
 * Generate file view URL using official Appwrite method
 */
export const generateFileViewUrl = (fileId: string): string => {
  try {
    return appwriteService.getFileUrl(fileId);
  } catch (error) {
    console.error('Error generating file view URL:', error);
    throw error;
  }
};

/**
 * Generate file preview URL with transformations
 */
export const generateFilePreviewUrl = (
  bucketId: string,
  fileId: string,
  options: ImageTransformOptions = {}
): string => {
  try {
    // Get base URL from appwrite service
    const baseUrl = appwriteService.getFileUrl(fileId).split('/files/')[0];
    
    // Build preview URL
    let previewUrl = `${baseUrl}/files/${fileId}/preview`;
    const params = new URLSearchParams();

    // Add transformation parameters based on official documentation
    if (options.width !== undefined) params.append('width', options.width.toString());
    if (options.height !== undefined) params.append('height', options.height.toString());
    if (options.gravity) params.append('gravity', options.gravity);
    if (options.quality !== undefined) params.append('quality', options.quality.toString());
    if (options.borderWidth !== undefined) params.append('borderWidth', options.borderWidth.toString());
    if (options.borderColor) params.append('borderColor', options.borderColor);
    if (options.borderRadius !== undefined) params.append('borderRadius', options.borderRadius.toString());
    if (options.opacity !== undefined) params.append('opacity', options.opacity.toString());
    if (options.rotation !== undefined) params.append('rotation', options.rotation.toString());
    if (options.background) params.append('background', options.background);
    if (options.output) params.append('output', options.output);

    const queryString = params.toString();
    if (queryString) {
      previewUrl += `?${queryString}`;
    }

    return previewUrl;
  } catch (error) {
    console.error('Error generating file preview URL:', error);
    throw error;
  }
};

/**
 * Generate file download URL
 */
export const generateFileDownloadUrl = (fileId: string): string => {
  try {
    const baseUrl = appwriteService.getFileUrl(fileId).split('/files/')[0];
    return `${baseUrl}/files/${fileId}/download`;
  } catch (error) {
    console.error('Error generating file download URL:', error);
    throw error;
  }
};

/**
 * Convert any Appwrite URL to the best format for image display
 */
export const optimizeImageUrl = (
  originalUrl: string,
  options: ImageTransformOptions = {}
): string => {
  const { bucketId, fileId } = parseAppwriteUrl(originalUrl);
  
  if (!fileId) {
    return originalUrl; // Not an Appwrite URL or couldn't parse
  }

  try {
    // For images, use preview with optimizations
    if (Object.keys(options).length > 0 && bucketId) {
      return generateFilePreviewUrl(bucketId, fileId, options);
    }
    
    // Default to view URL for direct display
    return generateFileViewUrl(fileId);
  } catch (error) {
    console.error('Error optimizing image URL:', error);
    return originalUrl;
  }
};

/**
 * Get responsive image URLs for different screen sizes
 */
export const getResponsiveImageUrls = (originalUrl: string): {
  small: string;
  medium: string;
  large: string;
  original: string;
} => {
  const { bucketId, fileId } = parseAppwriteUrl(originalUrl);
  
  if (!bucketId || !fileId) {
    return {
      small: originalUrl,
      medium: originalUrl,
      large: originalUrl,
      original: originalUrl
    };
  }

  try {
    return {
      small: generateFilePreviewUrl(bucketId, fileId, {
        width: 400,
        quality: 80,
        output: 'webp'
      }),
      medium: generateFilePreviewUrl(bucketId, fileId, {
        width: 800,
        quality: 85,
        output: 'webp'
      }),
      large: generateFilePreviewUrl(bucketId, fileId, {
        width: 1200,
        quality: 90,
        output: 'webp'
      }),
      original: generateFileViewUrl(fileId)
    };
  } catch (error) {
    console.error('Error generating responsive URLs:', error);
    return {
      small: originalUrl,
      medium: originalUrl,
      large: originalUrl,
      original: originalUrl
    };
  }
};

/**
 * Test if a file exists and is accessible
 */
export const testFileAccess = async (fileId: string): Promise<boolean> => {
  try {
    const url = generateFileViewUrl(fileId);
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error testing file access:', error);
    return false;
  }
};

/**
 * Get optimized image URL for story slides
 */
export const getStorySlideImageUrl = (
  originalUrl: string,
  slideIndex: number = 0
): string => {
  return optimizeImageUrl(originalUrl, {
    width: 800,
    height: 600,
    quality: 85,
    output: 'webp',
    gravity: 'center'
  });
};

/**
 * Get optimized thumbnail URL for story previews
 */
export const getStoryThumbnailUrl = (originalUrl: string): string => {
  return optimizeImageUrl(originalUrl, {
    width: 400,
    height: 300,
    quality: 80,
    output: 'webp',
    gravity: 'center'
  });
};

/**
 * Validate image transformation options
 */
export const validateTransformOptions = (options: ImageTransformOptions): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (options.width !== undefined && (options.width < 0 || options.width > 4000)) {
    errors.push('Width must be between 0 and 4000');
  }

  if (options.height !== undefined && (options.height < 0 || options.height > 4000)) {
    errors.push('Height must be between 0 and 4000');
  }

  if (options.quality !== undefined && (options.quality < 0 || options.quality > 100)) {
    errors.push('Quality must be between 0 and 100');
  }

  if (options.borderWidth !== undefined && (options.borderWidth < 0 || options.borderWidth > 100)) {
    errors.push('Border width must be between 0 and 100');
  }

  if (options.borderRadius !== undefined && (options.borderRadius < 0 || options.borderRadius > 4000)) {
    errors.push('Border radius must be between 0 and 4000');
  }

  if (options.opacity !== undefined && (options.opacity < 0 || options.opacity > 1)) {
    errors.push('Opacity must be between 0 and 1');
  }

  if (options.rotation !== undefined && (options.rotation < -360 || options.rotation > 360)) {
    errors.push('Rotation must be between -360 and 360');
  }

  if (options.borderColor && !/^[0-9A-Fa-f]{6}$/.test(options.borderColor)) {
    errors.push('Border color must be a valid 6-character hex color without #');
  }

  if (options.background && !/^[0-9A-Fa-f]{6}$/.test(options.background)) {
    errors.push('Background color must be a valid 6-character hex color without #');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create a picture element with responsive sources
 */
export const createResponsivePictureElement = (
  originalUrl: string,
  alt: string,
  className?: string
): HTMLPictureElement => {
  const picture = document.createElement('picture');
  const urls = getResponsiveImageUrls(originalUrl);

  // WebP sources for modern browsers
  const webpSource = document.createElement('source');
  webpSource.type = 'image/webp';
  webpSource.srcset = `
    ${urls.small} 400w,
    ${urls.medium} 800w,
    ${urls.large} 1200w
  `;
  webpSource.sizes = '(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px';
  picture.appendChild(webpSource);

  // Fallback img element
  const img = document.createElement('img');
  img.src = urls.medium;
  img.alt = alt;
  if (className) img.className = className;
  img.loading = 'lazy';
  picture.appendChild(img);

  return picture;
};

export default {
  parseAppwriteUrl,
  generateFileViewUrl,
  generateFilePreviewUrl,
  generateFileDownloadUrl,
  optimizeImageUrl,
  getResponsiveImageUrls,
  testFileAccess,
  getStorySlideImageUrl,
  getStoryThumbnailUrl,
  validateTransformOptions,
  createResponsivePictureElement
};