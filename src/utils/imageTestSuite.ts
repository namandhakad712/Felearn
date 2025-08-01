import { 
  parseAppwriteUrl, 
  generateFileViewUrl, 
  generateFilePreviewUrl,
  optimizeImageUrl,
  testFileAccess 
} from './appwriteStorageHelper';
import { 
  fixSingleImageUrl, 
  fixAllUserImages,
  testImageLoad 
} from './imageUrlFixer';
import { storyService } from '../services/storyService';

/**
 * Comprehensive Image Test Suite
 * Tests all aspects of image loading and fixing functionality
 */

export interface ImageTestResult {
  url: string;
  status: 'success' | 'error' | 'fixed';
  originalWorked: boolean;
  fixedUrl?: string;
  error?: string;
  loadTime?: number;
}

export interface StoryImageTestResult {
  storyId: string;
  storyTitle: string;
  totalImages: number;
  workingImages: number;
  fixedImages: number;
  failedImages: number;
  imageResults: ImageTestResult[];
}

export interface BulkTestResult {
  totalStories: number;
  totalImages: number;
  workingImages: number;
  fixedImages: number;
  failedImages: number;
  storyResults: StoryImageTestResult[];
  summary: {
    successRate: number;
    fixRate: number;
    avgLoadTime: number;
  };
}

/**
 * Test a single image URL comprehensively
 */
export const testSingleImage = async (url: string): Promise<ImageTestResult> => {
  const startTime = performance.now();
  
  try {
    // Test original URL
    const originalWorked = await testImageLoad(url, 5000);
    
    if (originalWorked) {
      return {
        url,
        status: 'success',
        originalWorked: true,
        loadTime: performance.now() - startTime
      };
    }

    // Try to fix the URL
    const fixResult = await fixSingleImageUrl(url);
    
    if (fixResult.success && fixResult.fixedUrl) {
      return {
        url,
        status: 'fixed',
        originalWorked: false,
        fixedUrl: fixResult.fixedUrl,
        loadTime: performance.now() - startTime
      };
    }

    return {
      url,
      status: 'error',
      originalWorked: false,
      error: fixResult.error || 'Could not fix URL',
      loadTime: performance.now() - startTime
    };

  } catch (error: any) {
    return {
      url,
      status: 'error',
      originalWorked: false,
      error: error.message,
      loadTime: performance.now() - startTime
    };
  }
};

/**
 * Test all images in a single story
 */
export const testStoryImages = async (storyId: string): Promise<StoryImageTestResult> => {
  try {
    const story = await storyService.getStory(storyId);
    
    if (!story.images || story.images.length === 0) {
      return {
        storyId,
        storyTitle: story.title,
        totalImages: 0,
        workingImages: 0,
        fixedImages: 0,
        failedImages: 0,
        imageResults: []
      };
    }

    console.log(`🧪 Testing ${story.images.length} images in story: ${story.title}`);

    const imageResults = await Promise.all(
      story.images.map(url => testSingleImage(url))
    );

    const workingImages = imageResults.filter(r => r.status === 'success').length;
    const fixedImages = imageResults.filter(r => r.status === 'fixed').length;
    const failedImages = imageResults.filter(r => r.status === 'error').length;

    return {
      storyId,
      storyTitle: story.title,
      totalImages: story.images.length,
      workingImages,
      fixedImages,
      failedImages,
      imageResults
    };

  } catch (error: any) {
    console.error('Error testing story images:', error);
    return {
      storyId,
      storyTitle: 'Unknown',
      totalImages: 0,
      workingImages: 0,
      fixedImages: 0,
      failedImages: 0,
      imageResults: []
    };
  }
};

/**
 * Test all images for a user
 */
export const testAllUserImages = async (userId: string): Promise<BulkTestResult> => {
  console.log('🧪 Starting comprehensive image test for user:', userId);
  
  try {
    const { stories } = await storyService.getUserStories(userId);
    
    if (stories.length === 0) {
      return {
        totalStories: 0,
        totalImages: 0,
        workingImages: 0,
        fixedImages: 0,
        failedImages: 0,
        storyResults: [],
        summary: {
          successRate: 0,
          fixRate: 0,
          avgLoadTime: 0
        }
      };
    }

    console.log(`🧪 Testing images in ${stories.length} stories...`);

    const storyResults = await Promise.all(
      stories.map(story => testStoryImages(story.$id))
    );

    // Calculate totals
    const totalImages = storyResults.reduce((sum, result) => sum + result.totalImages, 0);
    const workingImages = storyResults.reduce((sum, result) => sum + result.workingImages, 0);
    const fixedImages = storyResults.reduce((sum, result) => sum + result.fixedImages, 0);
    const failedImages = storyResults.reduce((sum, result) => sum + result.failedImages, 0);

    // Calculate average load time
    const allImageResults = storyResults.flatMap(result => result.imageResults);
    const avgLoadTime = allImageResults.length > 0 
      ? allImageResults.reduce((sum, result) => sum + (result.loadTime || 0), 0) / allImageResults.length
      : 0;

    const successRate = totalImages > 0 ? (workingImages / totalImages) * 100 : 0;
    const fixRate = totalImages > 0 ? (fixedImages / totalImages) * 100 : 0;

    const result: BulkTestResult = {
      totalStories: stories.length,
      totalImages,
      workingImages,
      fixedImages,
      failedImages,
      storyResults,
      summary: {
        successRate: Math.round(successRate * 100) / 100,
        fixRate: Math.round(fixRate * 100) / 100,
        avgLoadTime: Math.round(avgLoadTime)
      }
    };

    console.log('🧪 Image test completed:', {
      totalStories: result.totalStories,
      totalImages: result.totalImages,
      successRate: `${result.summary.successRate}%`,
      fixRate: `${result.summary.fixRate}%`,
      avgLoadTime: `${result.summary.avgLoadTime}ms`
    });

    return result;

  } catch (error: any) {
    console.error('Error in bulk image test:', error);
    return {
      totalStories: 0,
      totalImages: 0,
      workingImages: 0,
      fixedImages: 0,
      failedImages: 0,
      storyResults: [],
      summary: {
        successRate: 0,
        fixRate: 0,
        avgLoadTime: 0
      }
    };
  }
};

/**
 * Test Appwrite URL parsing functionality
 */
export const testUrlParsing = (urls: string[]): {
  successful: number;
  failed: number;
  results: Array<{
    url: string;
    parsed: boolean;
    bucketId?: string;
    fileId?: string;
    error?: string;
  }>;
} => {
  console.log('🧪 Testing URL parsing for', urls.length, 'URLs...');
  
  const results = urls.map(url => {
    try {
      const { bucketId, fileId } = parseAppwriteUrl(url);
      
      if (fileId) {
        return {
          url: url.substring(0, 50) + '...',
          parsed: true,
          bucketId,
          fileId
        };
      } else {
        return {
          url: url.substring(0, 50) + '...',
          parsed: false,
          error: 'Could not extract file ID'
        };
      }
    } catch (error: any) {
      return {
        url: url.substring(0, 50) + '...',
        parsed: false,
        error: error.message
      };
    }
  });

  const successful = results.filter(r => r.parsed).length;
  const failed = results.filter(r => !r.parsed).length;

  console.log('🧪 URL parsing test completed:', {
    successful,
    failed,
    successRate: `${Math.round((successful / urls.length) * 100)}%`
  });

  return { successful, failed, results };
};

/**
 * Test image optimization functionality
 */
export const testImageOptimization = async (urls: string[]): Promise<{
  successful: number;
  failed: number;
  results: Array<{
    originalUrl: string;
    optimizedUrl: string;
    optimized: boolean;
    loadTest: boolean;
    error?: string;
  }>;
}> => {
  console.log('🧪 Testing image optimization for', urls.length, 'URLs...');
  
  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        const optimizedUrl = optimizeImageUrl(url, {
          width: 800,
          quality: 85,
          output: 'webp'
        });

        const optimized = optimizedUrl !== url;
        const loadTest = await testImageLoad(optimizedUrl, 5000);

        return {
          originalUrl: url.substring(0, 30) + '...',
          optimizedUrl: optimizedUrl.substring(0, 30) + '...',
          optimized,
          loadTest
        };
      } catch (error: any) {
        return {
          originalUrl: url.substring(0, 30) + '...',
          optimizedUrl: url.substring(0, 30) + '...',
          optimized: false,
          loadTest: false,
          error: error.message
        };
      }
    })
  );

  const successful = results.filter(r => r.loadTest).length;
  const failed = results.filter(r => !r.loadTest).length;

  console.log('🧪 Image optimization test completed:', {
    successful,
    failed,
    successRate: `${Math.round((successful / urls.length) * 100)}%`
  });

  return { successful, failed, results };
};

/**
 * Generate a comprehensive test report
 */
export const generateTestReport = (testResult: BulkTestResult): string => {
  const report = `
# Image Test Report

## Summary
- **Total Stories**: ${testResult.totalStories}
- **Total Images**: ${testResult.totalImages}
- **Working Images**: ${testResult.workingImages} (${testResult.summary.successRate}%)
- **Fixed Images**: ${testResult.fixedImages} (${testResult.summary.fixRate}%)
- **Failed Images**: ${testResult.failedImages}
- **Average Load Time**: ${testResult.summary.avgLoadTime}ms

## Story Breakdown
${testResult.storyResults.map(story => `
### ${story.storyTitle}
- Images: ${story.totalImages}
- Working: ${story.workingImages}
- Fixed: ${story.fixedImages}
- Failed: ${story.failedImages}
${story.imageResults.length > 0 ? story.imageResults.map(img => 
  `  - ${img.url.substring(0, 40)}... [${img.status.toUpperCase()}]${img.fixedUrl ? ' → Fixed' : ''}${img.error ? ` (${img.error})` : ''}`
).join('\n') : '  - No images'}
`).join('\n')}

## Recommendations
${testResult.summary.successRate < 80 ? '⚠️ Low success rate - consider running the image fix utility' : '✅ Good success rate'}
${testResult.summary.fixRate > 20 ? '🔧 Many images were fixed - consider updating stored URLs' : ''}
${testResult.summary.avgLoadTime > 3000 ? '🐌 Slow load times - consider image optimization' : ''}
${testResult.failedImages > 0 ? `❌ ${testResult.failedImages} images still failing - may need manual attention` : ''}
`;

  return report;
};

export default {
  testSingleImage,
  testStoryImages,
  testAllUserImages,
  testUrlParsing,
  testImageOptimization,
  generateTestReport
};