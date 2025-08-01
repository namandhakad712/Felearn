/**
 * Test utility to verify caption storage functionality
 */
export async function testCaptionStorage() {
  try {
    console.log('🧪 Testing caption storage functionality...');
    
    // Import required services
    const { storyService } = await import('../services/storyService');
    
    // Create test story with slides (captions)
    const testSlides = [
      { text: "A tiny cat explains how computers work", image: "https://example.com/image1.jpg" },
      { text: "The cat shows how data flows through circuits", image: "https://example.com/image2.jpg" },
      { text: "Finally, the cat demonstrates output processing", image: "https://example.com/image3.jpg" }
    ];
    
    const testImages = [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg", 
      "https://example.com/image3.jpg"
    ];
    
    console.log('📝 Creating test story with captions...');
    
    try {
      const createdStory = await storyService.createStory(
        'test-user-id',
        'Test Story with Captions',
        'This is a test story to verify caption storage.',
        testImages,
        ['test', 'captions'],
        'test@example.com',
        'Test User',
        new Date().toISOString(),
        testSlides // Pass the slides with captions
      );
      
      console.log('✅ Story created successfully:', createdStory.$id);
      console.log('📊 Story data:', {
        title: createdStory.title,
        imagesCount: createdStory.images?.length || 0,
        slidesCount: createdStory.slides?.length || 0,
        slides: createdStory.slides?.map(slide => ({
          text: slide.text,
          hasImage: !!slide.image
        }))
      });
      
      // Test retrieval
      console.log('📖 Testing story retrieval...');
      const retrievedStory = await storyService.getStory(createdStory.$id);
      
      console.log('✅ Story retrieved successfully');
      console.log('📊 Retrieved data:', {
        title: retrievedStory.title,
        imagesCount: retrievedStory.images?.length || 0,
        slidesCount: retrievedStory.slides?.length || 0,
        captionsMatch: retrievedStory.slides?.every((slide, index) => 
          slide.text === testSlides[index].text
        )
      });
      
      // Verify captions are properly stored and retrieved
      if (retrievedStory.slides && retrievedStory.slides.length > 0) {
        console.log('🎉 Captions are properly stored!');
        retrievedStory.slides.forEach((slide, index) => {
          console.log(`   Caption ${index + 1}: "${slide.text}"`);
          console.log(`   Image URL: ${slide.image?.substring(0, 50)}...`);
        });
      } else {
        console.log('❌ Captions were not stored properly');
      }
      
      // Cleanup - delete test story
      console.log('🧹 Cleaning up test story...');
      await storyService.deleteStory(createdStory.$id);
      console.log('✅ Test story deleted');
      
      return {
        success: true,
        captionsStored: retrievedStory.slides?.length || 0,
        captionsMatch: retrievedStory.slides?.every((slide, index) => 
          slide.text === testSlides[index].text
        )
      };
      
    } catch (error) {
      console.error('❌ Failed to create/retrieve story:', error);
      return { success: false, error: error.message };
    }
    
  } catch (error) {
    console.error('❌ Caption storage test failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test caption display in existing stories
 */
export async function testExistingStoryCaptions() {
  try {
    console.log('🧪 Testing captions in existing stories...');
    
    const { storyService } = await import('../services/storyService');
    
    // Get user stories (this would need actual user ID in real usage)
    const result = await storyService.getUserStories('test-user-id', 5);
    
    console.log(`📖 Found ${result.stories.length} stories`);
    
    result.stories.forEach((story, index) => {
      console.log(`\n📝 Story ${index + 1}: "${story.title}"`);
      console.log(`   Images: ${story.images?.length || 0}`);
      console.log(`   Slides: ${story.slides?.length || 0}`);
      
      if (story.slides && story.slides.length > 0) {
        console.log('   Captions:');
        story.slides.forEach((slide, slideIndex) => {
          console.log(`     ${slideIndex + 1}. "${slide.text}"`);
        });
      } else {
        console.log('   ⚠️ No captions found');
      }
    });
    
    return {
      success: true,
      storiesChecked: result.stories.length,
      storiesWithCaptions: result.stories.filter(s => s.slides && s.slides.length > 0).length
    };
    
  } catch (error) {
    console.error('❌ Failed to test existing stories:', error);
    return { success: false, error: error.message };
  }
}

// Export for console testing
(window as any).testCaptionStorage = testCaptionStorage;
(window as any).testExistingStoryCaptions = testExistingStoryCaptions;