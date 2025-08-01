import { appwriteService } from '../services/appwrite';

/**
 * Test Appwrite storage connection and bucket access
 */
export const testStorageConnection = async () => {
  try {
    console.log('🧪 Testing Appwrite storage connection...');
    
    // Test 1: Check if we can generate a direct file URL
    const testFileId = 'test-file-id';
    const fileUrl = appwriteService.getFileUrl(testFileId);
    console.log('✅ Direct file URL generation works:', fileUrl);
    
    // Test 2: Try to create a small test file
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
    
    try {
      const fileId = await appwriteService.uploadFile(testFile);
      console.log('✅ File upload works, file ID:', fileId);
      
      // Clean up test file
      await appwriteService.deleteFile(fileId);
      console.log('✅ File deletion works');
      
      return { success: true, message: 'Storage connection is working perfectly!' };
    } catch (uploadError) {
      console.error('❌ File upload failed:', uploadError);
      return { 
        success: false, 
        message: `Storage upload failed: ${uploadError.message}`,
        error: uploadError 
      };
    }
    
  } catch (error) {
    console.error('❌ Storage connection test failed:', error);
    return { 
      success: false, 
      message: `Storage connection failed: ${error.message}`,
      error 
    };
  }
};

/**
 * Test specific image URLs to see which ones are working
 */
export const testImageUrls = async (imageUrls: string[]): Promise<{
  working: string[];
  broken: string[];
  results: Array<{ url: string; status: 'success' | 'error'; error?: string }>;
}> => {
  console.log('🧪 Testing image URLs...', imageUrls.length, 'images');
  
  const results = await Promise.all(
    imageUrls.map(async (url) => {
      return new Promise<{ url: string; status: 'success' | 'error'; error?: string }>((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          console.log('✅ Image loads:', url.substring(0, 50) + '...');
          resolve({ url, status: 'success' });
        };
        
        img.onerror = (error) => {
          console.error('❌ Image failed:', url.substring(0, 50) + '...', error);
          resolve({ url, status: 'error', error: 'Failed to load' });
        };
        
        // Set timeout for slow loading images
        setTimeout(() => {
          if (!img.complete) {
            console.warn('⏰ Image timeout:', url.substring(0, 50) + '...');
            resolve({ url, status: 'error', error: 'Timeout' });
          }
        }, 10000); // 10 second timeout
        
        img.src = url;
      });
    })
  );
  
  const working = results.filter(r => r.status === 'success').map(r => r.url);
  const broken = results.filter(r => r.status === 'error').map(r => r.url);
  
  console.log('📊 Image test results:', {
    total: imageUrls.length,
    working: working.length,
    broken: broken.length,
    successRate: `${Math.round((working.length / imageUrls.length) * 100)}%`
  });
  
  return { working, broken, results };
};

/**
 * Create a fallback image URL for failed image loads
 */
export const createFallbackImageUrl = (
  title: string, 
  slideNumber?: number,
  width: number = 400,
  height: number = 200
): string => {
  const displayText = slideNumber ? `Slide ${slideNumber}` : title;
  const subtitle = slideNumber ? 'Image unavailable' : 'Story Preview';
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fallbackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f9fafb;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#fallbackGrad)"/>
      <circle cx="${width/2}" cy="${height/2 - 20}" r="${Math.min(width, height) * 0.08}" fill="#d1d5db" opacity="0.6"/>
      <rect x="${width/2 - 40}" y="${height/2 + 10}" width="80" height="8" rx="4" fill="#d1d5db" opacity="0.5"/>
      <rect x="${width/2 - 25}" y="${height/2 + 25}" width="50" height="6" rx="3" fill="#d1d5db" opacity="0.4"/>
      <text x="50%" y="45%" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.max(12, width * 0.03)}" fill="#9ca3af" text-anchor="middle" dy=".3em">
        ${displayText.length > 25 ? displayText.substring(0, 25) + '...' : displayText}
      </text>
      <text x="50%" y="65%" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.max(10, width * 0.025)}" fill="#6b7280" text-anchor="middle" dy=".3em">
        ${subtitle}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};