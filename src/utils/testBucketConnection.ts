import { Client, Storage } from 'appwrite';
import { APPWRITE_CONFIG } from '../config/appwrite';

/**
 * Test the bucket connection and permissions
 */
export const testBucketConnection = async () => {
  try {
    console.log('🧪 Testing bucket connection...');
    console.log('🔧 Using bucket ID:', APPWRITE_CONFIG.buckets.storyImages);
    console.log('🔧 Endpoint:', APPWRITE_CONFIG.endpoint);
    console.log('🔧 Project:', APPWRITE_CONFIG.projectId);

    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    const storage = new Storage(client);

    // Test 1: Check if bucket exists
    console.log('📋 Test 1: Checking if bucket exists...');
    const bucket = await storage.getBucket(APPWRITE_CONFIG.buckets.storyImages);
    console.log('✅ Bucket found:', {
      id: bucket.$id,
      name: bucket.name,
      enabled: bucket.enabled,
      maxFileSize: bucket.maximumFileSize,
      extensions: bucket.allowedFileExtensions
    });

    // Test 2: List files in bucket (to test read permissions)
    console.log('📋 Test 2: Testing read permissions...');
    try {
      const files = await storage.listFiles(APPWRITE_CONFIG.buckets.storyImages);
      console.log('✅ Read permissions OK. Files in bucket:', files.total);
    } catch (readError: any) {
      console.warn('⚠️ Read permission issue:', readError.message);
    }

    // Test 3: Create a small test file (to test write permissions)
    console.log('📋 Test 3: Testing write permissions...');
    try {
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testFile = new File([testBlob], 'connection-test.txt', { type: 'text/plain' });
      
      const uploadResult = await storage.createFile(
        APPWRITE_CONFIG.buckets.storyImages,
        'connection-test-' + Date.now(),
        testFile
      );
      
      console.log('✅ Write permissions OK. Test file created:', uploadResult.$id);
      
      // Clean up test file
      try {
        await storage.deleteFile(APPWRITE_CONFIG.buckets.storyImages, uploadResult.$id);
        console.log('✅ Test file cleaned up');
      } catch (deleteError) {
        console.warn('⚠️ Could not delete test file (not critical)');
      }
      
    } catch (writeError: any) {
      console.warn('⚠️ Write permission issue:', writeError.message);
    }

    return {
      success: true,
      bucket,
      message: 'Bucket connection successful!'
    };

  } catch (error: any) {
    console.error('❌ Bucket connection failed:', error);
    
    if (error.code === 404) {
      return {
        success: false,
        error: 'Bucket not found',
        message: `Bucket '${APPWRITE_CONFIG.buckets.storyImages}' does not exist. Please create it in the Appwrite console.`
      };
    }
    
    return {
      success: false,
      error: error.message,
      message: 'Bucket connection failed. Check console for details.'
    };
  }
};

/**
 * Quick bucket status check
 */
export const quickBucketCheck = async (): Promise<boolean> => {
  try {
    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    const storage = new Storage(client);
    await storage.getBucket(APPWRITE_CONFIG.buckets.storyImages);
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  testBucketConnection,
  quickBucketCheck
};