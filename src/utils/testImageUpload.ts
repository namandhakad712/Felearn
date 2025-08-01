/**
 * Test utility to verify image upload functionality
 */
export async function testImageUpload() {
  try {
    console.log('🧪 Testing image upload functionality...');
    
    // Import the appwrite service
    const { appwriteService } = await import('../services/appwrite');
    
    // Create a test base64 image (1x1 red pixel)
    const testBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    console.log('📤 Testing single image upload...');
    
    // Test uploading multiple images
    const testImages = [testBase64Image, testBase64Image];
    const uploadedUrls = await appwriteService.uploadStoryImages(testImages);
    
    console.log('✅ Images uploaded successfully!');
    console.log('📊 Results:', {
      originalCount: testImages.length,
      uploadedCount: uploadedUrls.length,
      urls: uploadedUrls
    });
    
    // Test if URLs are accessible
    console.log('🔍 Testing URL accessibility...');
    for (let i = 0; i < uploadedUrls.length; i++) {
      const url = uploadedUrls[i];
      console.log(`URL ${i + 1}:`, url);
      
      // Try to load the image
      const img = new Image();
      img.onload = () => console.log(`✅ Image ${i + 1} loaded successfully`);
      img.onerror = () => console.log(`❌ Image ${i + 1} failed to load`);
      img.src = url;
    }
    
    console.log('🎉 Image upload test completed!');
    return {
      success: true,
      uploadedUrls,
      count: uploadedUrls.length
    };
    
  } catch (error) {
    console.error('❌ Image upload test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export for console testing
(window as any).testImageUpload = testImageUpload;