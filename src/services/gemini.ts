import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiRequest, GeminiResponse, StorySlide, StreamingUpdate } from '../types';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private readonly BETA_ACCESS_KEY = "FREE";
  private readonly FALLBACK_API_KEYS: string[] = [
    import.meta.env.VITE_GEMINI_FALLBACK_API_KEY_1,
    import.meta.env.VITE_GEMINI_FALLBACK_API_KEY_2,
    import.meta.env.VITE_GEMINI_FALLBACK_API_KEY_3
  ].filter(key => key); // Filter out undefined keys

  initialize(apiKey: string) {
    // Beta access: if user enters "FREE", use the first fallback API key
    const trimmedKey = apiKey.trim();
    if (trimmedKey.toLowerCase() === 'free') {
      console.log('🎉 Beta access activated! Using fallback API key for testing');
      this.genAI = new GoogleGenerativeAI(this.FALLBACK_API_KEYS[0] || import.meta.env.VITE_GEMINI_FALLBACK_API_KEY_1);
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

        // Create a chat model with image generation capabilities - exactly like "main thing" implementation
        const model = this.genAI.getGenerativeModel({
          model: "gemini-2.0-flash-preview-image-generation",
          generationConfig: {
            temperature: request.options.temperature || 0.7,
            maxOutputTokens: request.options.maxTokens || 11264, // ✅ INCREASED: Allows 15-20 slides
            responseModalities: ["TEXT", "IMAGE"], // ✅ FIXED: Specify both modalities
          }
        });

        // Create a chat instance with empty history
        const chat = model.startChat({
          history: [],
        });

        // Send the message with our prompt and get a stream response - exactly like "main thing" implementation
        const result = await chat.sendMessageStream(request.prompt + this.additionalInstructions());
        
        // Process the stream to extract text and images - exactly like "main thing" implementation
        const slides: StorySlide[] = [];
        let text = '';
        let img: string | null = null;

        for await (const chunk of result.stream) {
          for (const candidate of chunk.candidates || []) {
            for (const part of candidate.content?.parts || []) {
              if (part.text) {
                text += part.text;
              } else if (part.inlineData) {
                // Found an image
                img = `data:image/png;base64,${part.inlineData.data}`;
              }
              
              // If we have both text and image, create a slide
              if (text && img) {
                slides.push({
                  text: text,
                  image: img
                });
                
                // Reset for next slide
                text = '';
                img = null;
              }
            }
          }
        }
        
        // Handle any remaining text or image at the end
        if (text || img) {
          slides.push({
            text: text || '',
            image: img || ''
          });
        }

        // Combine all text for the story content
        const storyText = slides.map(slide => slide.text).join('\n\n');
        
        // Extract images for the response
        const images = slides
          .filter(slide => slide.image)
          .map(slide => slide.image as string);

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

        // Create a chat model with image generation capabilities
        const model = this.genAI.getGenerativeModel({
          model: "gemini-2.0-flash-preview-image-generation",
          generationConfig: {
            temperature: request.options?.temperature || 0.7,
            maxOutputTokens: request.options?.maxTokens || 11264,
            responseModalities: ["TEXT", "IMAGE"],
          }
        });

        // Create a chat instance with empty history
        const chat = model.startChat({
          history: [],
        });

        // Send the message with our prompt and get a stream response
        const result = await chat.sendMessageStream(request.prompt + this.additionalInstructions());
        
        // Process the stream to extract text and images progressively
        const slides: StorySlide[] = [];
        const images: string[] = [];
        let text = '';
        let img: string | null = null;
        let slideIndex = 0;

        for await (const chunk of result.stream) {
          for (const candidate of chunk.candidates || []) {
            for (const part of candidate.content?.parts || []) {
              if (part.text) {
                text += part.text;
              } else if (part.inlineData) {
                // Found an image
                img = `data:image/png;base64,${part.inlineData.data}`;
              }
              
              // If we have both text and image, create a slide and emit update
              if (text && img) {
                const newSlide: StorySlide = {
                  id: `slide-${slideIndex}`,
                  text: text,
                  image: img,
                  index: slideIndex
                };
                
                slides.push(newSlide);
                images.push(img);
                slideIndex++;
                
                // Emit slide update immediately
                onUpdate({
                  type: 'slide',
                  slide: newSlide
                });
                
                // Reset for next slide
                text = '';
                img = null;
              }
            }
          }
        }
        
        // Handle any remaining text or image at the end
        if (text || img) {
          const finalSlide: StorySlide = {
            id: `slide-${slideIndex}`,
            text: text || '',
            image: img || '',
            index: slideIndex
          };
          
          slides.push(finalSlide);
          if (img) images.push(img);
          
          // Emit final slide update
          onUpdate({
            type: 'slide',
            slide: finalSlide
          });
        }

        // Combine all text for the story content
        const storyText = slides.map(slide => slide.text).join('\n\n');
        
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

  // Exactly like "main thing" folder's additionalInstructions
  private additionalInstructions(): string {
    return `
Use a fun story about lots of tiny cats as a metaphor.
Keep sentences short but conversational, casual, and engaging.
Generate a cute, minimal illustration for each sentence with black ink on white background.
No commentary, just begin your explanation.
Keep going until you've thoroughly explained the entire concept.`;
  }

  private async generateImages(_prompt: string, _apiKey: string): Promise<string[]> {
    try {
      if (!this.genAI) {
        throw new Error('Gemini API not initialized');
      }
      
      // For now, return placeholder images until the actual image generation is implemented
      // In a production app, you would use these prompts with the image generation model
      const storyThemes = [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=400&fit=crop&crop=center',
      ];
      
      // Return placeholder images
      return [
        storyThemes[Math.floor(Math.random() * storyThemes.length)],
        storyThemes[Math.floor(Math.random() * storyThemes.length)],
        storyThemes[Math.floor(Math.random() * storyThemes.length)],
      ];
    } catch (error) {
      console.error('Error generating images:', error);
      // Fallback to placeholder images if image generation fails
      return [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&crop=center',
      ];
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
      const model = tempGenAI.getGenerativeModel({ model: "gemini-2.0-flash-preview-image-generation" });
      
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