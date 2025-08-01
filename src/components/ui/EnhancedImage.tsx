import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  optimizeImageUrl, 
  getResponsiveImageUrls, 
  getStorySlideImageUrl,
  getStoryThumbnailUrl 
} from '../../utils/appwriteStorageHelper';
import { createStoryFallbackImage } from '../../utils/imageUrlFixer';

interface EnhancedImageProps {
  src: string;
  alt: string;
  className?: string;
  storyTitle?: string;
  slideNumber?: number;
  type?: 'slide' | 'thumbnail' | 'original';
  width?: number;
  height?: number;
  quality?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallbackWidth?: number;
  fallbackHeight?: number;
  showLoadingSpinner?: boolean;
}

const EnhancedImage: React.FC<EnhancedImageProps> = ({
  src,
  alt,
  className = '',
  storyTitle = 'Story',
  slideNumber,
  type = 'original',
  width,
  height,
  quality = 85,
  loading = 'lazy',
  onLoad,
  onError,
  fallbackWidth = 600,
  fallbackHeight = 400,
  showLoadingSpinner = true
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src);

  // Optimize the image URL based on type
  useEffect(() => {
    if (!src) {
      setImageState('error');
      return;
    }

    try {
      let optimized = src;

      switch (type) {
        case 'slide':
          optimized = getStorySlideImageUrl(src);
          break;
        case 'thumbnail':
          optimized = getStoryThumbnailUrl(src);
          break;
        case 'original':
        default:
          optimized = optimizeImageUrl(src, {
            width,
            height,
            quality,
            output: 'webp',
            gravity: 'center'
          });
          break;
      }

      setOptimizedSrc(optimized);
    } catch (error) {
      console.error('Error optimizing image URL:', error);
      setOptimizedSrc(src);
    }
  }, [src, type, width, height, quality]);

  const handleLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleError = () => {
    console.warn('Enhanced image failed to load:', optimizedSrc.substring(0, 50) + '...');
    setImageState('error');
    onError?.();
  };

  const fallbackSrc = createStoryFallbackImage(
    storyTitle,
    slideNumber,
    fallbackWidth,
    fallbackHeight
  );

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading spinner */}
      {imageState === 'loading' && showLoadingSpinner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Loading image...</span>
          </div>
        </motion.div>
      )}

      {/* Main image */}
      <motion.img
        src={imageState === 'error' ? fallbackSrc : optimizedSrc}
        alt={imageState === 'error' ? `${alt} (fallback)` : alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: imageState === 'loaded' ? 1 : 0,
          scale: imageState === 'loaded' ? 1 : 0.95
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Error state indicator */}
      {imageState === 'error' && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full opacity-75">
          Fallback
        </div>
      )}

      {/* Optimization indicator */}
      {imageState === 'loaded' && optimizedSrc !== src && (
        <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full opacity-75">
          Optimized
        </div>
      )}
    </div>
  );
};

/**
 * Responsive image component with multiple sources
 */
interface ResponsiveImageProps extends Omit<EnhancedImageProps, 'type'> {
  sizes?: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  sizes = '(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px',
  ...props
}) => {
  const [responsiveUrls, setResponsiveUrls] = useState<{
    small: string;
    medium: string;
    large: string;
    original: string;
  } | null>(null);

  useEffect(() => {
    try {
      const urls = getResponsiveImageUrls(src);
      setResponsiveUrls(urls);
    } catch (error) {
      console.error('Error generating responsive URLs:', error);
      setResponsiveUrls(null);
    }
  }, [src]);

  if (!responsiveUrls) {
    return <EnhancedImage src={src} alt={alt} className={className} {...props} />;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <picture>
        {/* WebP sources for modern browsers */}
        <source
          type="image/webp"
          srcSet={`
            ${responsiveUrls.small} 400w,
            ${responsiveUrls.medium} 800w,
            ${responsiveUrls.large} 1200w
          `}
          sizes={sizes}
        />
        
        {/* Fallback image */}
        <EnhancedImage
          src={responsiveUrls.medium}
          alt={alt}
          className="w-full h-full"
          {...props}
        />
      </picture>
    </div>
  );
};

/**
 * Story slide image with optimized settings
 */
export const StorySlideImage: React.FC<Omit<EnhancedImageProps, 'type'>> = (props) => (
  <EnhancedImage {...props} type="slide" />
);

/**
 * Story thumbnail image with optimized settings
 */
export const StoryThumbnailImage: React.FC<Omit<EnhancedImageProps, 'type'>> = (props) => (
  <EnhancedImage {...props} type="thumbnail" />
);

export default EnhancedImage;