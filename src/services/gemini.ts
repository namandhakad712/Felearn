/// <reference types="vite/client" />

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { GeminiRequest, GeminiResponse, StorySlide, StreamingUpdate } from '../types';

// Helper function to safely access environment variables
const getEnvVar = (name: string): string | undefined => {
  try {
    // @ts-ignore - TypeScript doesn't recognize import.meta.env in this context
    return import.meta.env[name];
  } catch (e) {
    return undefined;
  }
};

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private readonly FALLBACK_API_KEYS: string[] = [
    getEnvVar('VITE_GEMINI_FALLBACK_API_KEY_1'),
    getEnvVar('VITE_GEMINI_FALLBACK_API_KEY_2'),
    getEnvVar('VITE_GEMINI_FALLBACK_API_KEY_3')
  ].filter((key): key is string => key !== undefined); // Filter out undefined keys with proper typing

  initialize(apiKey: string) {
    // Beta access: if user enters "FREE", use the first fallback API key
    const trimmedKey = apiKey.trim();
    if (trimmedKey.toLowerCase() === 'free') {
      console.log('🎉 Beta access activated! Using fallback API key for testing');
      this.genAI = new GoogleGenerativeAI(this.FALLBACK_API_KEYS[0] || getEnvVar('VITE_GEMINI_FALLBACK_API_KEY_1') || '');
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(trimmedKey);
  }

  async generateStory(request: GeminiRequest, retries: number = 3): Promise<GeminiResponse> {
    if (!this.genAI) {
      throw new Error('Gemini API not initialized. Please provide an API key.');
    }

    let lastError: Error | null = null;
    let currentApiKeyIndex = 0;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const startTime = Date.now();

        // Step 1: Generate the story sentences as a JSON array (like tmp.md approach)
        const textModel = this.genAI.getGenerativeModel({
          model: "gemini-2.5-flash", // Using gemini-2.5-flash like tmp.md
          generationConfig: {
            temperature: request.options.temperature || 0.7,
            maxOutputTokens: request.options.maxTokens || 8192,
            responseMimeType: "application/json",
            responseSchema: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.STRING,
                description: "A sentence of the story.",
              },
            },
          }
        });

        const storyInstructions = `
Use a fun story about lots of tiny cats as a metaphor.
Keep sentences short but conversational, casual, and engaging.
Return the story as a JSON array of sentences. No commentary, just the JSON.
`;

        const textResult = await textModel.generateContent(request.prompt + storyInstructions);
        const sentences = JSON.parse(textResult.response.text());

        if (!Array.isArray(sentences) || sentences.length === 0) {
          throw new Error("Couldn't generate a story. Please try another prompt.");
        }

        // Step 2: Generate an image for each sentence (like tmp.md approach)
        const imageStyleInstruction = `A cute, minimal illustration with black ink on a white background.`;
        const images: string[] = [];
        const slides: StorySlide[] = [];

        // Create image generation model
        const imageModel = this.genAI.getGenerativeModel({
          model: "gemini-2.5-flash-image-preview", // Using Imagen 3.0 like tmp.md
        });

        // Generate images for each sentence
        for (let i = 0; i < sentences.length; i++) {
          const sentence = sentences[i];
          
          try {
            const imageResult = await imageModel.generateContent([
              {
                text: `${sentence}. ${imageStyleInstruction}`,
              }
            ]);
            
            // Extract image data
            const imageData = imageResult.response.text();
            images.push(imageData);
            
            // Create slide
            slides.push({
              id: `slide-${i}`,
              text: sentence,
              image: imageData,
              index: i
            });
          } catch (imageError) {
            console.error(`Failed to generate image for sentence ${i}:`, imageError);
            // Use placeholder if image generation fails
            const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2UgR2VuZXJhdGlvbiBGYWlsZWQ8L3RleHQ+PC9zdmc+';
            images.push(placeholder);
            
            // Create slide with placeholder
            slides.push({
              id: `slide-${i}`,
              text: sentence,
              image: placeholder,
              index: i
            });
          }
        }

        // Combine all text for the story content
        const storyText = sentences.join('\n\n');

        const endTime = Date.now();

        return {
          story: storyText,
          images,
          slides,
          metadata: {
            tokensUsed: this.estimateTokens(storyText),
            processingTime: endTime - startTime,
          }
        };
      } catch (error: any) {
        lastError = error;
        console.error(`Gemini API error (attempt ${attempt}/${retries}):`, error);

        // Parse error message like in "main thing" implementation
        const errorMessage = this.parseError(error);

        // Don't retry on authentication errors
        if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
          // If we're using a fallback key and have more keys to try, rotate to the next one
          if (this.FALLBACK_API_KEYS.length > 1 && currentApiKeyIndex < this.FALLBACK_API_KEYS.length - 1) {
            currentApiKeyIndex++;
            this.genAI = new GoogleGenerativeAI(this.FALLBACK_API_KEYS[currentApiKeyIndex]);
            console.log(`🔄 Rotating to fallback API key ${currentApiKeyIndex + 1}/${this.FALLBACK_API_KEYS.length}`);
            continue; // Try again with the new key
          }
          
          throw new Error('Invalid API key. Please check your Gemini API key in settings.');
        }

        // Don't retry on quota exceeded errors
        if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
          // If we're using a fallback key and have more keys to try, rotate to the next one
          if (this.FALLBACK_API_KEYS.length > 1 && currentApiKeyIndex < this.FALLBACK_API_KEYS.length - 1) {
            currentApiKeyIndex++;
            this.genAI = new GoogleGenerativeAI(this.FALLBACK_API_KEYS[currentApiKeyIndex]);
            console.log(`🔄 Rotating to fallback API key ${currentApiKeyIndex + 1}/${this.FALLBACK_API_KEYS.length}`);
            continue; // Try again with the new key
          }
          
          throw new Error('API quota exceeded. Please try again later or check your Gemini API usage.');
        }

        // Wait before retrying (exponential backoff)
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If all retries failed, throw the last error
    throw new Error(`Failed to generate story after ${retries} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Generate story with streaming updates
   * @param request Story generation request
   * @param onUpdate Callback function for streaming updates
   * @param retries Number of retry attempts
   */
  async generateStoryStream(
    request: GeminiRequest, 
    onUpdate: (update: StreamingUpdate) => void,
    retries: number = 3
  ): Promise<void> {
    if (!this.genAI) {
      throw new Error('Gemini API not initialized. Please provide an API key.');
    }

    let lastError: Error | null = null;
    let currentApiKeyIndex = 0;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const startTime = Date.now();

        // Step 1: Generate the story sentences as a JSON array (like tmp.md approach)
        const textModel = this.genAI.getGenerativeModel({
          model: "gemini-2.5-flash", // Using gemini-2.5-flash like tmp.md
          generationConfig: {
            temperature: request.options?.temperature || 0.7,
            maxOutputTokens: request.options?.maxTokens || 8192,
            responseMimeType: "application/json",
            responseSchema: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.STRING,
                description: "A sentence of the story.",
              },
            },
          }
        });

        const storyInstructions = `
Use a fun story about lots of tiny cats as a metaphor.
Keep sentences short but conversational, casual, and engaging.
Return the story as a JSON array of sentences. No commentary, just the JSON.
`;

        const textResult = await textModel.generateContent(request.prompt + storyInstructions);
        const sentences = JSON.parse(textResult.response.text());

        if (!Array.isArray(sentences) || sentences.length === 0) {
          throw new Error("Couldn't generate a story. Please try another prompt.");
        }

        // Step 2: Generate an image for each sentence (like tmp.md approach)
        const imageStyleInstruction = `A cute, minimal illustration with black ink on a white background.`;
        const images: string[] = [];
        const slides: StorySlide[] = [];

        // Create image generation model
        const imageModel = this.genAI.getGenerativeModel({
          model: "gemini-2.5-flash-image-preview", // Using Imagen 3.0 like tmp.md
        });

        // Generate images for each sentence and emit updates
        for (let i = 0; i < sentences.length; i++) {
          const sentence = sentences[i];
          
          // Emit text update immediately
          onUpdate({
            type: 'slide',
            slide: {
              id: `text-${i}`,
              text: sentence,
              image: null,
              index: i
            }
          });
          
          try {
            const imageResult = await imageModel.generateContent([
              {
                text: `${sentence}. ${imageStyleInstruction}`,
              }
            ]);
            
            // Extract image data
            const imageData = imageResult.response.text();
            images.push(imageData);
            
            // Create slide
            const newSlide: StorySlide = {
              id: `slide-${i}`,
              text: sentence,
              image: imageData,
              index: i
            };
            
            slides.push(newSlide);
            
            // Emit slide update immediately
            onUpdate({
              type: 'slide',
              slide: newSlide
            });
          } catch (imageError) {
            console.error(`Failed to generate image for sentence ${i}:`, imageError);
            // Use placeholder if image generation fails
            const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2UgR2VuZXJhdGlvbiBGYWlsZWQ8L3RleHQ+PC9zdmc+';
            images.push(placeholder);
            
            // Create slide with placeholder
            const newSlide: StorySlide = {
              id: `slide-${i}`,
              text: sentence,
              image: placeholder,
              index: i
            };
            
            slides.push(newSlide);
            
            // Emit slide update immediately
            onUpdate({
              type: 'slide',
              slide: newSlide
            });
          }
        }

        // Combine all text for the story content
        const storyText = sentences.join('\n\n');
        
        const endTime = Date.now();

        // Emit completion update
        onUpdate({
          type: 'complete',
          story: storyText,
          images,
          slides,
          metadata: {
            tokensUsed: this.estimateTokens(storyText),
            processingTime: endTime - startTime,
          }
        });

        return; // Success, exit retry loop

      } catch (error: any) {
        lastError = error;
        console.error(`Gemini API error (attempt ${attempt}/${retries}):`, error);

        // Parse error message
        const errorMessage = this.parseError(error);

        // Don't retry on authentication errors
        if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
          // If we're using a fallback key and have more keys to try, rotate to the next one
          if (this.FALLBACK_API_KEYS.length > 1 && currentApiKeyIndex < this.FALLBACK_API_KEYS.length - 1) {
            currentApiKeyIndex++;
            this.genAI = new GoogleGenerativeAI(this.FALLBACK_API_KEYS[currentApiKeyIndex]);
            console.log(`🔄 Rotating to fallback API key ${currentApiKeyIndex + 1}/${this.FALLBACK_API_KEYS.length}`);
            continue; // Try again with the new key
          }
          
          onUpdate({
            type: 'error',
            error: 'Invalid API key. Please check your Gemini API key in settings.'
          });
          throw new Error('Invalid API key. Please check your Gemini API key in settings.');
        }

        // Don't retry on quota exceeded errors
        if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
          // If we're using a fallback key and have more keys to try, rotate to the next one
          if (this.FALLBACK_API_KEYS.length > 1 && currentApiKeyIndex < this.FALLBACK_API_KEYS.length - 1) {
            currentApiKeyIndex++;
            this.genAI = new GoogleGenerativeAI(this.FALLBACK_API_KEYS[currentApiKeyIndex]);
            console.log(`🔄 Rotating to fallback API key ${currentApiKeyIndex + 1}/${this.FALLBACK_API_KEYS.length}`);
            continue; // Try again with the new key
          }
          
          onUpdate({
            type: 'error',
            error: 'API quota exceeded. Please try again later or check your Gemini API usage.'
          });
          throw new Error('API quota exceeded. Please try again later or check your Gemini API usage.');
        }

        // Wait before retrying (exponential backoff)
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If all retries failed, emit error and throw
    const finalError = `Failed to generate story after ${retries} attempts: ${lastError?.message || 'Unknown error'}`;
    onUpdate({
      type: 'error',
      error: finalError
    });
    throw new Error(finalError);
  }

  // Parse error message like in "main thing" implementation
  private parseError(error: any): string {
    try {
      const errorStr = error.toString();
      const regex = /{"error":(.*)}/gm;
      const match = regex.exec(errorStr);
      
      if (match && match[1]) {
        try {
          const errorObj = JSON.parse(match[1]);
          return errorObj.message || errorStr;
        } catch (e) {
          return errorStr;
        }
      }
      
      return error.message || errorStr;
    } catch (e) {
      return error.message || 'Unknown error';
    }
  }

  private estimateTokens(text: string): number {
    // A very rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // Handle beta access key (case-insensitive with spaces)
      const trimmedKey = apiKey.trim();
      if (trimmedKey.toLowerCase() === 'free') {
        return true;
      }

      // For testing purposes, we'll just check if the API key format is valid
      // This avoids making an actual API call that might fail due to model availability
      if (trimmedKey && trimmedKey.length > 10) {
        return true;
      }

      // If we want to actually validate with the API (uncomment this in production)
      /*
      const tempGenAI = new GoogleGenerativeAI(trimmedKey);
      const model = tempGenAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // Simple validation prompt
      const result = await model.generateContent("Hello, can you respond with 'valid' if you can understand this?");
      const text = result.response.text().toLowerCase();
      
      return text.includes('valid');
      */

      return false;
    } catch (error) {
      console.error('API key validation error:', error);
      return false;
    }
  }
}

export const geminiService = new GeminiService();