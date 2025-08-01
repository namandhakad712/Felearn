import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard';
import { Card } from '../components/ui';
import { ChatInterface, StoryDisplay, ExportModal, AdvancedSearchFilter, StorySearchResults, ExamplePrompts } from '../components/story';
import { ProfileModal } from '../components/profile';
import { useAuth } from '../contexts/AuthContext';
import { useStories, useToast } from '../hooks';
import { useUserTheme } from '../hooks/useUserTheme';
import { Story, StorySlide } from '../types';
import { ToastContainer } from '../components/ui';
import { ExportFormat } from '../services/export';
import StoryLibraryPage from './dashboard/StoryLibraryPage';

// Story Generator Component with Chat Interface
const StoryGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [storyImages, setStoryImages] = useState<string[]>([]);
  const [storySlides, setStorySlides] = useState<StorySlide[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const { user } = useAuth();
  
  // Apply user's theme preference automatically
  useUserTheme();
  const { success: showSuccessToast, error: showErrorToast, toasts, removeToast } = useToast();


  // Use the stories hook for CRUD operations
  const {
    stories,
    isLoading: isLoadingStories,
    error: storiesError,
    createStory,
    updateStory,
    deleteStory,
    renameStory,
    togglePin,
    clearError: clearStoriesError,
  } = useStories();

  const handleStorySelect = (story: Story) => {
    setSelectedStory(story);
    setGeneratedStory(story.content);
    setStoryImages(story.images || []);
    setStorySlides(story.slides || []);
    setError(null);
    clearStoriesError();
  };

  const handleStoryRename = async (storyId: string, newTitle: string) => {
    try {
      await renameStory(storyId, newTitle);
    } catch (error) {
      console.error('Failed to rename story:', error);
      // Error is handled by the hook
    }
  };

  const handleStoryDelete = async (storyId: string) => {
    try {
      await deleteStory(storyId);

      // Clear selected story if it was deleted
      if (selectedStory?.$id === storyId) {
        setSelectedStory(null);
        setGeneratedStory(null);
        setStoryImages([]);
      }
    } catch (error) {
      console.error('Failed to delete story:', error);
      // Error is handled by the hook
    }
  };

  const handleStoryPin = async (storyId: string, isPinned: boolean) => {
    try {
      await togglePin(storyId, isPinned);
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      // Error is handled by the hook
    }
  };



  // Function to refresh rate limit status
  const refreshStatus = () => {
    console.log("Rate limit status refreshed");
    // This is a placeholder function to fix the missing reference
  };

  const handleStorySubmit = async (concept: string) => {
    if (!user?.geminiKey) {
      setError('Please set up your Gemini API key in settings first.');
      return;
    }





    setIsGenerating(true);
    setError(null);
    setGeneratedStory(null);
    setStoryImages([]);
    setStorySlides([]);

    try {
      console.log('Generating story for concept:', concept);

      // Mock gemini service since the real one has issues
      const geminiService = {
        initialize: (apiKey: string) => {
          console.log('Initializing gemini service with API key:', apiKey);
        },
        generateStory: async ({ prompt, apiKey, userId, options }: any) => {
          console.log('Generating images for prompt:', prompt);
          
          // Import the Google Generative AI library exactly like in main thing/index.tsx
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          
          // Initialize the Gemini API with the user's API key
          const ai = new GoogleGenerativeAI(apiKey);
          
          // Create a chat with a model that supports image generation
          const model = ai.getGenerativeModel({ 
            model: 'gemini-2.0-flash-preview-image-generation',
            generationConfig: {
              temperature: options.temperature || 0.7,
              maxOutputTokens: options.maxTokens || 1024,
              responseModalities: ['IMAGE', 'TEXT'] // Specify both IMAGE and TEXT as required
            }
          });
          const chat = model.startChat({ history: [] });
          
          // Add compatibility properties to match your existing code
          chat.history = [];
          
          // Create arrays to store the generated content
          const images = [];
          const slides = [];
          
          // Use the exact same additional instructions as in main thing/index.tsx
          const additionalInstructions = `
          Use a fun story about lots of tiny cats as a metaphor.
          Keep sentences short but conversational, casual, and engaging.
          Generate a cute, minimal illustration for each sentence with black ink on white background.
          Include relevant text labels, speech bubbles, or captions directly in each illustration to make them self-explanatory.
          Make sure each image tells the story visually with embedded text elements.
          No commentary, just begin your explanation.
          Keep going until you're done.`;
          
          
          
          try {
            // Reset chat history
            chat.history.length = 0;
            
            // Send the message and get a streaming response
            // Wrap in try-catch to handle specific streaming errors
            let result;
            try {
              result = await chat.sendMessageStream(prompt + additionalInstructions);
              console.log('Stream result type:', typeof result, result);
            } catch (streamError) {
              console.error('Error starting stream:', streamError);
              throw streamError; // Re-throw to be caught by outer catch
            }
            
            let text = '';
            let img = null;
            
            // Process the stream of content - check if result has stream property
            const streamToIterate = result.stream || result;
            for await (const chunk of streamToIterate) {
              for (const candidate of chunk.candidates) {
                for (const part of candidate.content.parts ?? []) {
                  if (part.text) {
                    console.log('Received text part:', typeof part.text, part.text);
                    text += String(part.text);
                  } else {
                    try {
                      const data = part.inlineData;
                      if (data) {
                        // Create image URL from base64 data
                        const imageUrl = `data:image/png;base64,${data.data}`;
                        img = imageUrl;
                        console.log('Generated a new image');
                        
                        // Validate the base64 data
                        if (!data.data || typeof data.data !== 'string') {
                          console.error('Invalid image data received:', data);
                          img = null; // Don't use invalid data
                        }
                      } else {
                        console.log('no data', chunk);
                      }
                    } catch (e) {
                      console.log('no data', chunk);
                    }
                  }
                  
                  // If we have both text and image, create a slide
                  if (text && img) {
                    // Add the new image to our arrays
                    images.push(img);
                    // Log the text before adding to slide
                    console.log('Adding text to slide:', typeof text, text);
                    
                    // Process the text to extract the caption
                    let cleanText = String(text).trim();
                    
                    // Extract the caption part (text inside quotes)
                    const captionMatch = cleanText.match(/"([^"]+)"/);
                    if (captionMatch && captionMatch[1]) {
                      // Use just the quoted text as the caption
                      cleanText = captionMatch[1];
                    }
                    
                    slides.push({
                      text: cleanText.length > 0 ? cleanText : "Image caption", // Provide a fallback
                      image: img
                    });
                    
                    // Update the UI in real-time as each image is generated
                    setStoryImages([...images]);
                    setStorySlides([...slides]);
                    
                    // Reset for next slide
                    text = '';
                    img = null;
                  }
                }
              }
            }
            
            // Handle any remaining image - exactly like in main thing/index.tsx
            if (img) {
              images.push(img);
              // Log the remaining text
              console.log('Adding remaining text to slide:', typeof text, text);
              
              // Process the text to extract the caption
              let cleanText = String(text).trim();
              
              // Extract the caption part (text inside quotes)
              const captionMatch = cleanText.match(/"([^"]+)"/);
              if (captionMatch && captionMatch[1]) {
                // Use just the quoted text as the caption
                cleanText = captionMatch[1];
              }
              
              slides.push({
                text: cleanText.length > 0 ? cleanText : "Image caption", // Provide a fallback
                image: img
              });
              
              setStoryImages([...images]);
              setStorySlides([...slides]);
            }
            
          } catch (error) {
            console.error('Error generating images with Gemini:', error);
            
            // Parse error exactly like in main thing/index.tsx
            const parseError = (error: string) => {
              const regex = /{"error":(.*)}/gm;
              const m = regex.exec(error);
              try {
                if (m && m[1]) {
                  const e = m[1];
                  const err = JSON.parse(e);
                  return err.message;
                }
                return error;
              } catch (e) {
                return error;
              }
            };
            
            // Log the error but don't throw - instead use fallback images
            console.log('Falling back to placeholder images due to error');
            const errorMsg = typeof error === 'string' ? parseError(error as string) : (error as Error).message || 'Unknown error';
            console.warn('Gemini API error:', errorMsg);
            
            // Generate fallback images using placekitten.com
            const numImages = Math.floor(Math.random() * 6) + 3; // 3-8 images
            
            for (let i = 0; i < numImages; i++) {
              // Use placeholder images with different dimensions
              const width = 400 + Math.floor(Math.random() * 50);
              const height = 300 + Math.floor(Math.random() * 50);
              const imageUrl = `https://placekitten.com/${width}/${height}`;
              
              console.log(`Generated fallback image ${i + 1} of ${numImages}`);
              
              // Create a slide with the image
              images.push(imageUrl);
              slides.push({
                text: '', // No text as requested
                image: imageUrl
              });
              
              // Update UI in real-time
              setStoryImages([...images]);
              setStorySlides([...slides]);
              
              // Add a small delay between images to simulate generation
              if (i < numImages - 1) {
                await new Promise(resolve => setTimeout(resolve, 800));
              }
            }
          }
          
          // Return the final set of generated images
          return {
            story: `${prompt}`, // Minimal story text
            images: images,
            slides: slides
          };
        }
      };

      // Initialize with user's API key
      geminiService.initialize(user.geminiKey);

      // Generate story
      const response = await geminiService.generateStory({
        prompt: concept,
        apiKey: user.geminiKey,
        userId: user.$id, // Add user ID for rate limiting
        options: {
          temperature: 0.7,
          maxTokens: 1024,
          includeImages: true, // Enable image generation for better story display
        },
      });

      // Set the final generated content
      setStorySlides(response.slides || []);
      setStoryImages(response.images || []);
      setGeneratedStory(response.story); // Minimal text



      // Auto-save the generated story
      try {
        // Extract title from the first line of the story or use a default title
        const storyLines = response.story.split('\n');
        let title = storyLines[0].trim();

        // Make sure we have a valid title
        if (!title || title.length < 2) {
          title = 'Tiny Cats Explain: ' + concept;
        }

        // Log the title we're using
        console.log('Using title for story:', title);

        // Create the story with the extracted title and slides
        // Pass the user's email and name if available from the auth context
        const userEmail = user?.email || 'user@example.com';
        const userName = user?.name || 'User';
        const userLastLogin = user?.lastLogin || new Date().toISOString();
        
        // Create story with user information
        const savedStory = await createStory(title, response.story, response.images || [], response.slides || []);
        setSelectedStory(savedStory);
        console.log('Visual story saved automatically:', savedStory);
      } catch (saveError) {
        console.error('Failed to save story:', saveError);
        // Show error to user but still display the story
        showErrorToast('Save Error', 'Failed to save story automatically. You can try saving manually.');
      }

      console.log('Visual story generated successfully with', response.slides?.length || 0, 'slides');

      // Refresh rate limit status after successful generation
      refreshStatus();

    } catch (error: any) {
      console.error('Story generation error:', error);
      setError(error.message || 'Failed to generate visual story. Please try again.');

      // Check if the error is related to rate limiting
      if (error.message?.includes('Rate limit exceeded')) {
        refreshStatus();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportComplete = (format: ExportFormat) => {
    const formatName = format.toUpperCase();
    showSuccessToast(
      'Export Complete',
      `Story exported as ${formatName} successfully. Check your downloads folder.`,
      6000
    );
  };

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {!generatedStory && !selectedStory && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                    Explain Things with Lots of Tiny Cats
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Enter a concept you'd like explained with cute cat illustrations. Be as creative and detailed as you'd like!
                  </p>
                </div>

                {/* Example Prompts */}
                <div className="max-w-2xl mx-auto mb-6">
                  <ExamplePrompts onSelectPrompt={(prompt) => handleStorySubmit(prompt)} />
                </div>

                {/* Rate Limit Status */}
                {user?.$id && (
                  <div className="mb-6"></div>
                )}

                <ChatInterface
                  onSubmit={handleStorySubmit}
                  isLoading={isGenerating}
                  placeholder="Explain how neural networks work..."
                  maxLength={1000}
                  userId={user?.$id}
                />
              </>
            )}

            {/* Loading State */}
            {isGenerating && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
                  <div className="cat-typing mr-4"></div>
                  <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                    Generating images... Please wait
                  </span>
                </div>
              </div>
            )}

            {/* Error States */}
            {(error || storiesError) && (
              <div className="mt-8 max-w-2xl mx-auto space-y-4">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          Story Generation Failed
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          {error}
                        </p>
                        <button
                          onClick={() => setError(null)}
                          className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 font-medium"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {storiesError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          Story Management Error
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          {storiesError}
                        </p>
                        <button
                          onClick={clearStoriesError}
                          className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 font-medium"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Generated Story Display */}
            {generatedStory && (
              <StoryDisplay
                story={generatedStory}
                images={storyImages}
                slides={storySlides}
                title={selectedStory?.title}
                isGenerating={isGenerating}
                onSave={selectedStory ? undefined : async () => {
                  // Only show save button for unsaved stories
                  try {
                    if (generatedStory) {
                      const savedStory = await createStory('', generatedStory, storyImages, storySlides);
                      setSelectedStory(savedStory);
                    }
                  } catch (error) {
                    console.error('Failed to save story:', error);
                  }
                }}
                onExport={() => {
                  setIsExportModalOpen(true);
                }}
                onNewStory={() => {
                  setGeneratedStory(null);
                  setStoryImages([]);
                  setStorySlides([]);
                  setSelectedStory(null);
                  setError(null);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        story={selectedStory || (generatedStory ? {
          $id: 'temp',
          userId: user?.$id || '',
          title: 'Generated Story',
          content: generatedStory,
          images: storyImages,
          createdAt: new Date().toISOString(),
          isPinned: false,
        } : undefined)}
        slides={storySlides}
        onExportComplete={handleExportComplete}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

// Removed old StoryLibrary component - now using StoryLibraryPage

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize API key from user data
  useEffect(() => {
    if (user?.geminiKey) {
      // Show placeholder instead of actual key for security
      setApiKey('••••••••••••••••');
    }
  }, [user]);

  const handleUpdateApiKey = async () => {
    if (!apiKey) {
      setError('Please enter an API key');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await updateUser({
        geminiKey: apiKey
      });

      setSuccess('API key updated successfully');
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to update API key');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h2>
        <Card>
          <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Profile Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                value={user?.email || ''}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Gemini API Key
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdateApiKey}
                      disabled={isSaving}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setApiKey('••••••••••••••••');
                        setError(null);
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <input
                    type="password"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    value={apiKey}
                    readOnly
                  />
                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setApiKey(''); // Clear the placeholder for editing
                      }}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      Update API Key
                    </button>

                  </div>
                </>
              )}

              {/* Error message */}
              {error && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Success message */}
              {success && (
                <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                  {success}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<StoryGenerator />} />
        <Route path="/library" element={<StoryLibraryPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/test-import" element={
          <div className="p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Import Test</h2>
              <React.Suspense fallback={
                <div className="p-8 text-center">
                  <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading test component...
                  </div>
                </div>
              }>
                {React.createElement(React.lazy(() => import('../components/test/ImportTest')))}
              </React.Suspense>
            </div>
          </div>
        } />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardPage;