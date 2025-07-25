/**
 * Extract name from email address
 * Example: john.doe@example.com -> John Doe
 */
export function extractNameFromEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return 'User';
  }

  const localPart = email.split('@')[0];
  
  // Handle different email formats
  let name = localPart
    .replace(/[._-]/g, ' ') // Replace dots, underscores, hyphens with spaces
    .replace(/\d+/g, '') // Remove numbers
    .trim();

  // Capitalize each word
  name = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return name || 'User';
}

/**
 * Validate Gemini API key by checking available models
 */
export async function validateGeminiApiKey(apiKey: string): Promise<{ isValid: boolean; error?: string }> {
  if (!apiKey || apiKey.trim().length === 0) {
    return { isValid: false, error: 'API key is required' };
  }

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey.trim()
      }
    });

    if (response.status === 200) {
      return { isValid: true };
    } else if (response.status === 400) {
      return { isValid: false, error: 'API key is not valid. Please check your key and try again.' };
    } else if (response.status === 403) {
      return { isValid: false, error: 'API key is valid but the Generative Language API is not enabled or billing is not set up.' };
    } else {
      return { isValid: false, error: 'Unable to validate API key. Please try again.' };
    }
  } catch (error) {
    console.error('API key validation error:', error);
    return { isValid: false, error: 'Network error. Please check your connection and try again.' };
  }
}