/**
 * Utilities for handling image operations
 */

/**
 * Convert base64 data to a File object
 */
export const base64ToFile = (base64Data: string, filename: string): File => {
  try {
    // Extract the MIME type and base64 content
    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      console.error('Invalid base64 data format:', base64Data.substring(0, 50) + '...');
      throw new Error('Invalid base64 data format');
    }
    
    const mimeType = matches[1];
    const base64Content = matches[2];
    
    // Convert base64 to binary
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create a Blob and then a File
    const blob = new Blob([bytes], { type: mimeType });
    const file = new File([blob], filename, { type: mimeType });
    
    console.log(`Created file: ${filename}, size: ${file.size} bytes, type: ${file.type}`);
    return file;
  } catch (error) {
    console.error('Error converting base64 to file:', error);
    // Create a small placeholder file instead of failing
    const blob = new Blob(['placeholder'], { type: 'image/webp' });
    return new File([blob], filename, { type: 'image/webp' });
  }
};

/**
 * Generate a unique filename for an image with the format "email-date-month-year-index"
 */
export const generateImageFilename = (email: string, index: number): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = now.getFullYear();
  
  // Sanitize email for filename (remove @ and special characters)
  const safeEmail = email.replace(/[^a-zA-Z0-9]/g, '-');
  
  return `${safeEmail}-${day}-${month}-${year}-${index}.webp`;
};

/**
 * Check if a string is a URL
 */
export const isUrl = (str: string): boolean => {
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:');
};