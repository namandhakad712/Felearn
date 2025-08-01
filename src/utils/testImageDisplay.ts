/**
 * Test utility to debug image display issues
 */
export async function testImageDisplay() {
  try {
    console.log('🧪 Testing image display functionality...');
    
    // Import the story service
    const { storyService } = await import('../services/storyService');
    
    // Get current user
    const { useAuth } = await import('../contexts/AuthContext');
    
    console.log('📖 Fetching user stories...');
    
    // This would need to be called from a component with auth context
    // For now, let's just test with a mock user ID
    const testUserId = 'test-user-id';
    
    try {
      const result = await storyService.getUserStories(testUserId, 5);
      console.log('✅ Stories fetched:', result.stories.length);
      
      // Analyze each story's images
      result.stories.forEach((story, index) => {
        console.log(`📝 Story ${index + 1}: "${story.title}"`);
        console.log(`   Images: ${story.images?.length || 0}`);
        
        if (story.images && story.images.length > 0) {
          story.images.forEach((imageUrl, imgIndex) => {
            console.log(`   Image ${imgIndex + 1}:`, {
              url: imageUrl.substring(0, 100) + '...',
              isBase64: imageUrl.startsWith('data:'),
              isAppwriteUrl: imageUrl.includes('appwrite'),
              isHttpUrl: imageUrl.startsWith('http')
            });
            
            // Test if image can be loaded
            const img = new Image();
            img.onload = () => console.log(`   ✅ Image ${imgIndex + 1} loads successfully`);
            img.onerror = () => console.log(`   ❌ Image ${imgIndex + 1} failed to load`);
            img.src = imageUrl;
          });
        } else {
          console.log('   ⚠️ No images found');
        }
        
        if (story.slides && story.slides.length > 0) {
          console.log(`   Slides: ${story.slides.length}`);
          story.slides.forEach((slide, slideIndex) => {
            console.log(`   Slide ${slideIndex + 1}: "${slide.text?.substring(0, 50)}..."`);
          });
        }
        
        console.log('   ---');
      });
      
      return {
        success: true,
        storiesCount: result.stories.length,
        totalImages: result.stories.reduce((sum, story) => sum + (story.images?.length || 0), 0)
      };
      
    } catch (error) {
      console.error('❌ Failed to fetch stories:', error);
      return { success: false, error: error.message };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test a specific image URL
 */
export function testImageUrl(imageUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    console.log('🔍 Testing image URL:', imageUrl.substring(0, 100) + '...');
    
    const img = new Image();
    img.onload = () => {
      console.log('✅ Image loaded successfully');
      resolve(true);
    };
    img.onerror = (error) => {
      console.log('❌ Image failed to load:', error);
      resolve(false);
    };
    img.src = imageUrl;
  });
}

// Export for console testing
(window as any).testImageDisplay = testImageDisplay;
(window as any).testImageUrl = testImageUrl;