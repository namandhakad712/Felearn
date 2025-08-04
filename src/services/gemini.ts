import { GoogleGenerativeAI } from '@google/generative-ai';
// Note: Modality export doesn't exist in current version
import { GeminiRequest, GeminiResponse, StorySlide } from '../types';
// import { marked } from 'marked'; // Removed unused import

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private readonly EASTER_EGG_KEY = "bynaman";
  private readonly FALLBACK_API_KEY = "AIzaSyBE-m0-Np0mqdwHrGg1XNue4cz5qC3ecDA";

  initialize(apiKey: string) {
    // Easter egg: if user enters "bynaman", use the fallback API key
    if (apiKey === this.EASTER_EGG_KEY) {
      console.log('🐱 Easter egg activated! Using Naman\'s API key for testing');
      this.genAI = new GoogleGenerativeAI(this.FALLBACK_API_KEY);
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateStory(request: GeminiRequest, retries: number = 3): Promise<GeminiResponse> {
    if (!this.genAI) {
      throw new Error('Gemini API not initialized. Please provide a valid API key.');
    }

    let lastError: any;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const model = this.genAI.getGenerativeModel({ 
          model: "gemini-2.0-flash-preview-image-generation",
          generationConfig: {
            temperature: request.options.temperature || 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: request.options.maxTokens || 8192,
          },
        });

        // Enhanced prompt with better structure
        const enhancedPrompt = this.buildEnhancedPrompt(request);
        
        console.log(`🎯 Attempted ${attempt}/${retries}: Generating story with prompt length: ${enhancedPrompt.length}`);

        // Create proper request structure with contents.parts
        const requestContent = {
          contents: [{
            role: "user",
            parts: [{
              text: enhancedPrompt
            }]
          }]
        };

        const result = await model.generateContentStream(requestContent);
        
        const response: GeminiResponse = {
          story: '',
          slides: [],
          images: [],
          metadata: {
            tokensUsed: 0,
            processingTime: 0
          }
        };

        let fullText = '';
        let currentSlide = '';
        let slideCount = 0;
        const maxSlides = 10; // Limit slides to prevent infinite generation
        let totalTokensUsed = 0; // Track total tokens used
        const startTime = Date.now(); // Track processing time

        // Estimate tokens for the prompt
        const estimateTokens = (text: string): number => {
          return Math.ceil(text.length / 4);
        };

        // Add prompt tokens to total
        totalTokensUsed += estimateTokens(enhancedPrompt);

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullText += chunkText;
          currentSlide += chunkText;

          // Check for slide breaks (double newlines or specific markers)
          if (chunkText.includes('\n\n') || chunkText.includes('---')) {
            if (currentSlide.trim() && slideCount < maxSlides) {
              response.slides!.push({
                text: currentSlide.trim(),
                image: null // Will be populated later
              });
              slideCount++;
              currentSlide = '';
            }
          }
        }

        // Add the last slide if there's content
        if (currentSlide.trim() && slideCount < maxSlides) {
          response.slides!.push({
            text: currentSlide.trim(),
            image: null
          });
        }

        // If no slides were created, create one from the full text
        if (response.slides!.length === 0 && fullText.trim()) {
          response.slides!.push({
            text: fullText.trim(),
            image: null
          });
        }

        response.story = fullText;
        
        // Update metadata with actual token count and processing time
        response.metadata.tokensUsed = totalTokensUsed + estimateTokens(fullText);
        response.metadata.processingTime = Date.now() - startTime; // Calculate actual processing time
        
        console.log(`✅ Story generated successfully on attempt ${attempt} with ${response.slides!.length} slides`);
        return response;

      } catch (error: any) {
        lastError = error;
        console.error(`❌ Attempt ${attempt}/${retries} failed:`, error);
        
        // Check if it's a network error or API error
        const isNetworkError = error.message?.includes('network') || 
                             error.message?.includes('timeout') ||
                             error.message?.includes('fetch');
        
        const isApiError = error.message?.includes('400') || 
                          error.message?.includes('403') ||
                          error.message?.includes('429');
        
        if (isApiError && attempt < retries) {
          // Wait before retrying for API errors
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        } else if (isNetworkError && attempt < retries) {
          // Wait longer for network errors
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        } else if (attempt === retries) {
          // Last attempt failed, throw the error
          throw this.parseError(error);
        }
      }
    }

    throw this.parseError(lastError);
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

  // Build enhanced prompt with better structure
  private buildEnhancedPrompt(request: GeminiRequest): string {
    const basePrompt = request.prompt;
    const additionalInstructions = this.additionalInstructions();
    
    return `${basePrompt}

${additionalInstructions}

Please create a story with:
- Clear, engaging narrative
- Short, conversational sentences
- Natural slide breaks (use "---" to separate slides)
- Maximum 10 slides
- Each slide should be self-contained but connected to the overall story`;
  }

  // private async generateImages(prompt: string, apiKey: string): Promise<string[]> {
  //   try {
  //     if (!this.genAI) {
  //       throw new Error('Gemini API not initialized');
  //     }
  //     
  //     // For now, return placeholder images until the actual image generation is implemented
  //     // In a production app, you would use these prompts with the image generation model
  //     const storyThemes = [
  //       'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop&crop=center',
  //       'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&crop=center',
  //       'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&h=400&fit=crop&crop=center',
  //       'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=400&fit=crop&crop=center',
  //     ];
  //     
  //     // Return placeholder images
  //     return [
  //       storyThemes[Math.floor(Math.random() * storyThemes.length)],
  //       storyThemes[Math.floor(Math.random() * storyThemes.length)],
  //       storyThemes[Math.floor(Math.random() * storyThemes.length)],
  //     ];
  //   } catch (error) {
  //     console.error('Error generating images:', error);
  //     // Fallback to placeholder images if image generation fails
  //     return [
  //       'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop&crop=center',
  //       'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&crop=center',
  //     ];
  //   }
  // }

  // private estimateTokens(text: string): number {
  //   // A very rough estimate: ~4 characters per token
  //   return Math.ceil(text.length / 4);
  // }

  // async validateApiKey(apiKey: string): Promise<boolean> {
  //   try {
  //     // Easter egg: if user enters "bynaman", use the fallback API key for validation
  //     const actualApiKey = apiKey === this.EASTER_EGG_KEY ? this.FALLBACK_API_KEY : apiKey;

  //     // For testing purposes, we'll just check if the API key format is valid
  //     // This avoids making an actual API call that might fail due to model availability
  //     if (actualApiKey && actualApiKey.length > 10) {
  //       return true;
  //     }

  //     // If we want to actually validate with the API (uncomment this in production)
  //     /*
  //     const tempGenAI = new GoogleGenerativeAI(actualApiKey);
  //     const model = tempGenAI.getGenerativeModel({ model: "gemini-2.5-flash-lite-preview-06-17" }); // Updated model name
  //     
  //     // Simple validation prompt
  //     const result = await model.generateContent("Hello, can you respond with 'valid' if you can understand this?");
  //     const text = result.response.text().toLowerCase();
  //     
  //     return text.includes('valid');
  //     */

  //     return false;
  //   } catch (error) {
  //     console.error('API key validation error:', error);
  //     return false;
  //   }
  // }
}

export const geminiService = new GeminiService();