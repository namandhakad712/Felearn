import { appwriteService } from '../services/appwrite';
import { storyService } from '../services/story';

/**
 * Extract file ID from Appwrite URL
 */
const extractFileIdFromUrl = (url: string): string | null => {
  try {
    // Match patterns like: /storage/buckets/bucket-id/files/file-id/view
    // or /storage/buckets/bucket-id/files/file-id/preview
    const match = url.match(/\/files\/([^\/\?]+)(?:\/(?:view|preview))?/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting file ID from URL:', url, error);
    return null;
  }
};

/**
 * Convert preview URLs to direct file URLs
 */
export const fixImageUrl = (url: string): string => {
  if (!url || !url.includes('appwrite')) {
    return url; // Not an Appwrite URL, return as-is
  }

  // If it's already a view URL, return as-is
  if (url.includes('/view')) {
    return url;
  }

  // If it's a preview URL, convert to view URL
  if (url.includes('/preview')) {
    const fileId = extractFileIdFromUrl(url);
    if (fileId) {
      return appwriteService.getFileUrl(fileId);
    }
  }

  // If it's some other Appwrite URL format, try to extract file ID
  const fileId = extractFileIdFromUrl(url);
  if (fileId) {
    return appwriteService.getFileUrl(fileId);
  }

  return url; // Return original if we can't parse it
};

/**
 * Fix all image URLs in a story
 */
export const fixStoryImageUrls = async (storyId: string): Promise<boolean> => {
  try {
    console.log('🔧 Fixing image URLs for story:', storyId);
    
    // Get the story
    const story = await storyService.getStory(storyId);
    if (!story || !story.images || story.images.length === 0) {
      console.log('No images to fix for story:', storyId);
      return true;
    }

    // Fix all image URLs
    const fixedImages = story.images.map(url => fixImageUrl(url));
    
    // Check if any URLs were changed
    const hasChanges = fixedImages.some((url, index) => url !== story.images![index]);
    
    if (!hasChanges) {
      console.log('No image URLs needed fixing for story:', storyId);
      return true;
    }

    // Update the story with fixed URLs
    await storyService.updateStory(storyId, { images: fixedImages });
    
    console.log('✅ Fixed image URLs for story:', storyId, {
      before: story.images.length,
      after: fixedImages.length,
      changed: fixedImages.filter((url, index) => url !== story.images![index]).length
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error fixing image URLs for story:', storyId, error);
    return false;
  }
};

/**
 * Fix image URLs for all user stories
 */
export const fixAllUserStoryImageUrls = async (userId: string): Promise<{
  total: number;
  fixed: number;
  errors: number;
}> => {
  try {
    console.log('🔧 Starting bulk image URL fix for user:', userId);
    
    // Get all user stories
    const result = await storyService.getUserStories(userId);
    const stories = result.stories;
    
    if (stories.length === 0) {
      console.log('No stories found for user:', userId);
      return { total: 0, fixed: 0, errors: 0 };
    }

    let fixed = 0;
    let errors = 0;

    // Fix each story
    for (const story of stories) {
      try {
        const success = await fixStoryImageUrls(story.$id);
        if (success) {
          fixed++;
        } else {
          errors++;
        }
      } catch (error) {
        console.error('Error fixing story:', story.$id, error);
        errors++;
      }
    }

    const results = {
      total: stories.length,
      fixed,
      errors
    };

    console.log('✅ Bulk image URL fix completed:', results);
    return results;
    
  } catch (error) {
    console.error('❌ Error in bulk image URL fix:', error);
    return { total: 0, fixed: 0, errors: 1 };
  }
};

/**
 * Test if an image URL works
 */
export const testImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
    
    img.src = url;
  });
};