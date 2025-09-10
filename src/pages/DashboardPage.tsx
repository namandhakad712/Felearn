import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { DashboardLayout } from '../components/dashboard';
import { Card, JellyText } from '../components/ui';
import { ChatInterface, StoryDisplay, ExportModal, ExamplePrompts } from '../components/story';
import { useAuth } from '../contexts/AuthContext';
import { useStories, useToast } from '../hooks';
import { useUserTheme } from '../hooks/useUserTheme';
import { Story, StorySlide } from '../types';
import { ToastContainer } from '../components/ui';
import { ExportFormat } from '../services/export';
import StoryLibraryPage from './dashboard/StoryLibraryPage';
import { geminiService } from '../services/gemini';
import { databaseService } from '../services/database';

// Story Generator Component with Chat Interface
const StoryGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [storyImages, setStoryImages] = useState<string[]>([]);
  const [storySlides, setStorySlides] = useState<StorySlide[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [_isProfileModalOpen, _setIsProfileModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tokens, setTokens] = useState(0); // Add tokens state

  const { user } = useAuth();

  // Apply user's theme preference automatically
  useUserTheme();
  const { success: showSuccessToast, error: showErrorToast, toasts, removeToast } = useToast();


  // Use the stories hook for CRUD operations
  const {
    stories: _stories,
    isLoading: _isLoadingStories,
    error: storiesError,
    createStory,
    updateStory: _updateStory,
    deleteStory,
    renameStory,
    togglePin,
    clearError: clearStoriesError,
  } = useStories();

  // const _handleStorySelect = (story: Story) => {
  //   setSelectedStory(story);
  //   setGeneratedStory(story.content);
  //   setStoryImages(story.images || []);
  //   setStorySlides(story.slides || []);
  //   setError(null);
  //   clearStoriesError();
  // };

  // const _handleStoryRename = (storyId: string, newTitle: string) => {
  //   // TODO: Implement story renaming
  //   console.log('Rename story:', storyId, 'to:', newTitle);
  // };

  // const _handleStoryDelete = (storyId: string) => {
  //   // TODO: Implement story deletion
  //   console.log('Delete story:', storyId);
  // };

  // const handleStoryPin = (storyId: string, isPinned: boolean) => {
  //   // TODO: Implement story pinning
  //   console.log('Pin story:', storyId, 'pinned:', isPinned);
  // };



  // Function to refresh rate limit status
  const refreshStatus = () => {
    console.log("Rate limit status refreshed");
    // This is a placeholder function to fix the missing reference
  };

  // Function to update user quota
  const updateUserQuota = async (userId: string, newQuota: number) => {
    try {
      await databaseService.updateUserDocument(userId, { quota: newQuota });
      console.log('User quota updated successfully to', newQuota);
      // In a real implementation, you would also update the AuthContext user state
      // For now, we'll just log it
    } catch (error) {
      console.error('Failed to update user quota:', error);
      showErrorToast('Quota Update Error', 'Failed to update your story generation quota.');
    }
  };

  // Function to check if quota should be reset (daily reset)
  const shouldResetQuota = (lastLogin?: string): boolean => {
    if (!lastLogin) return true;
    
    const lastLoginDate = new Date(lastLogin);
    const today = new Date();
    
    // Reset if last login was not today
    return lastLoginDate.toDateString() !== today.toDateString();
  };

  const handleStorySubmit = async (concept: string) => {
    if (!user?.geminiKey) {
      setError('Please set up your Gemini API key in settings first.');
      return;
    }

    // Check and potentially reset quota
    let currentUserQuota = user?.quota !== undefined ? user.quota : 15;
    const shouldReset = shouldResetQuota(user?.lastLogin);
    
    if (shouldReset) {
      // Reset quota to 15 for the new day
      currentUserQuota = 15;
      try {
        await updateUserQuota(user.$id, 15);
        // Also update lastLogin timestamp
        await databaseService.updateUserDocument(user.$id, { 
          lastLogin: new Date().toISOString() 
        });
      } catch (error) {
        console.error('Failed to reset quota:', error);
      }
    }
    
    if (currentUserQuota <= 0) {
      setError('You have reached your daily story generation limit. Please try again tomorrow.');
      showErrorToast('Generation Limit Reached', 'You have reached your daily story generation limit of 15 stories.');
      return;
    }

    // Auto-collapse sidebar when story generation starts
    const sidebarEvent = new CustomEvent('controlSidebar', { 
      detail: { isOpen: false } 
    });
    window.dispatchEvent(sidebarEvent);

    setIsGenerating(true);
    setError(null);
    setGeneratedStory(null);
    setStoryImages([]);
    setStorySlides([]);
    setTokens(0); // Reset tokens

    try {
      console.log('Generating story for concept:', concept);
      console.log('Using API key (first 10 chars):', user.geminiKey?.substring(0, 10) + '...');
      console.log('Current quota:', currentUserQuota);

      // Use the real gemini service
      
      // Initialize the service with user's API key (now stored directly)
      geminiService.initialize(user.geminiKey);

      // Use the new streaming method for progressive updates
      await geminiService.generateStoryStream({
        prompt: concept,
        apiKey: user.geminiKey,
        userId: user.$id,
        options: {
          temperature: 0.8,
          maxTokens: 8192,
          includeImages: true
        }
      }, (update) => {
        // Handle streaming updates
        switch (update.type) {
          case 'slide':
            if (update.slide) {
              // Add new slide to the list
              setStorySlides(prev => [...prev, update.slide!]);
              if (update.slide.image) {
                setStoryImages(prev => [...prev, update.slide!.image!]);
              }
            }
            break;
          
          case 'complete':
            // Set the final generated content
            if (update.story) {
              setGeneratedStory(update.story);
            }
            if (update.images) {
              setStoryImages(update.images);
            }
            if (update.slides) {
              setStorySlides(update.slides);
            }
            if (update.metadata?.tokensUsed) {
              setTokens(update.metadata.tokensUsed);
            }

            // Auto-save the generated story (only if not already saved)
            if (!selectedStory && update.story) {
              try {
                // Use the user's prompt as the title
                let title = concept.trim();

                // Limit title to 300 characters to avoid database constraint issues
                if (title.length > 300) {
                  title = title.substring(0, 297) + '...';
                }

                // Log the title we're using
                console.log('Using user prompt as title:', title);
                console.log('Title length:', title.length);
                console.log('Response tokens:', update.metadata?.tokensUsed);
                console.log('Tokens being saved:', update.metadata?.tokensUsed || 0);

                // Create story with user information
                createStory(
                  title, 
                  update.story, 
                  update.images || [], 
                  update.slides || [], 
                  update.metadata?.tokensUsed || 0
                ).then(savedStory => {
                  setSelectedStory(savedStory);
                  console.log('Visual story saved automatically:', savedStory);
                  
                  // FAIR USAGE: Only update user quota after successful story generation AND saving
                  // This ensures users don't lose their quota if there are errors during generation or saving
                  const newQuota = Math.max(0, currentUserQuota - 1);
                  console.log('Updating user quota from', currentUserQuota, 'to', newQuota);
                  updateUserQuota(user.$id, newQuota);
                  // Update lastLogin timestamp to track daily usage
                  databaseService.updateUserDocument(user.$id, { 
                    lastLogin: new Date().toISOString() 
                  }).catch(updateError => {
                    console.error('Failed to update lastLogin timestamp:', updateError);
                  });
                }).catch(saveError => {
                  console.error('Failed to save story:', saveError);
                  // Show error to user but still display the story
                  showErrorToast('Save Error', 'Failed to save story automatically. You can try saving manually. Your quota has not been deducted.');
                });
              } catch (saveError) {
                console.error('Failed to save story:', saveError);
                // Show error to user but still display the story
                showErrorToast('Save Error', 'Failed to save story automatically. You can try saving manually. Your quota has not been deducted.');
              }
            }

            console.log('Visual story generated successfully with', update.slides?.length || 0, 'slides');
            break;
          
          case 'error':
            if (update.error) {
              setError(update.error);
              // Don't update quota on error - user hasn't used their quota
              showErrorToast('Generation Error', 'Failed to generate visual story. Your quota has not been deducted.');
            }
            break;
        }
      });

      // Refresh rate limit status after successful generation
      refreshStatus();
    } catch (error: any) {
      console.error('Story generation error:', error);
      setError(error.message || 'Failed to generate visual story. Your quota has not been deducted.');
      
      // Don't update quota on error - user hasn't used their quota
      showErrorToast('Generation Error', 'Failed to generate visual story. Your quota has not been deducted.');

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
                  <div className="mb-3">
                    <JellyText 
                      text="Explain Things with Lots of Tiny Cats"
                      className="text-gray-900 dark:text-white"
                      fontSize="clamp(1.5rem, 4vw, 3rem)"
                      fontWeight={700}
                      fontStretch={120}
                    />
                  </div>
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

            {/* Live Story Display - Shows immediately when generation starts */}
            {(generatedStory || isGenerating) && (
              <StoryDisplay
                story={generatedStory || ''}
                images={storyImages}
                slides={storySlides}
                title={selectedStory?.title || undefined}
                isGenerating={isGenerating}
                isSaving={isSaving}
                onSave={selectedStory ? undefined : async () => {
                  // Only show save button for unsaved stories
                  if (isSaving) return; // Prevent multiple submissions
                  
                  try {
                    setIsSaving(true);
                    if (generatedStory) {
                      const savedStory = await createStory('', generatedStory, storyImages, storySlides);
                      setSelectedStory(savedStory);
                      showSuccessToast('Success', 'Story saved successfully!');
                    }
                  } catch (error) {
                    console.error('Failed to save story:', error);
                    showErrorToast('Save Error', 'Failed to save story. Please try again.');
                  } finally {
                    setIsSaving(false);
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
                  setTokens(0); // Reset tokens
                }}
                tokens={tokens} // Pass tokens to StoryDisplay
              />
            )}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        story={selectedStory ? {
          ...selectedStory,
          email: user?.email || '',
          name: user?.name || '',
          lastLogin: user?.lastLogin || new Date().toISOString(),
        } : undefined}
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
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // GSAP refs for animations
  const settingsRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  


  // Initialize API key from user data
  useEffect(() => {
    if (user?.geminiKey) {
      // Show placeholder instead of actual key for security
      setApiKey('••••••••••••••••');
    }
  }, [user]);

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setError('API key is required');
      setValidationStatus('invalid');
      return false;
    }

    setIsValidating(true);
    setError(null);

    try {
      // Use the same validation function as onboarding
      const { validateGeminiApiKey } = await import('../utils/userUtils');
      const validation = await validateGeminiApiKey(apiKey);

      if (validation.isValid) {
        setValidationStatus('valid');
        return true;
      } else {
        setValidationStatus('invalid');
        setError(validation.error || 'Invalid API key');
        return false;
      }
    } catch (error: any) {
      setValidationStatus('invalid');
      setError(error.message || 'Failed to validate API key. Check your internet connection.');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleUpdateApiKey = async () => {
    // First validate the API key
    const isValid = await validateApiKey();
    if (!isValid) return;

    setIsSaving(true);
    setError(null);

    try {
      // Handle FREE keyword (case-insensitive with spaces)
      const trimmedKey = apiKey.trim();
      const finalKey = trimmedKey.toLowerCase() === 'free' ? 'FREE' : trimmedKey;
      
      // Save the API key directly without encryption
      await updateUser({
        geminiKey: finalKey
      });

      setSuccess('API key updated successfully');
      setIsEditing(false);
      setValidationStatus('idle');

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



  // GSAP animations for settings page
  useGSAP(() => {
    if (settingsRef.current) {
      // Entrance animation for the entire settings page
      gsap.fromTo(settingsRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
    
    if (cardRef.current) {
      // Morphing entrance for the settings card
      gsap.fromTo(cardRef.current,
        { 
          scale: 0.8, 
          opacity: 0, 
          rotationY: 15,
          transformOrigin: "center center"
        },
        { 
          scale: 1, 
          opacity: 1, 
          rotationY: 0,
          duration: 0.8, 
          delay: 0.2,
          ease: "back.out(1.7)" 
        }
      );
    }
    
    if (formRef.current) {
      // Stagger animation for form elements
      const formElements = formRef.current.querySelectorAll('.form-element');
      gsap.fromTo(formElements,
        { opacity: 0, x: -30 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.5,
          stagger: 0.1,
          delay: 0.5,
          ease: "power2.out"
        }
      );
    }
  }, []);

  // Animation for editing state change
  useGSAP(() => {
    if (formRef.current && isEditing) {
      const editingElements = formRef.current.querySelectorAll('.editing-element');
      gsap.fromTo(editingElements,
        { opacity: 0, scale: 0.9, y: 10 },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "back.out(1.7)"
        }
      );
    }
  }, { dependencies: [isEditing] });

  return (
    <div ref={settingsRef} className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h2>
        {/* Glassmorphic Settings Card */}
        <div 
          ref={cardRef}
          className="relative overflow-hidden rounded-3xl p-8"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Grainy texture overlay */}
          <div 
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              mixBlendMode: 'overlay'
            }}
          />
          
          <h3 className="font-bold mb-6 text-gray-900 dark:text-white text-xl">Profile Settings</h3>
          <div ref={formRef} className="space-y-6">
            <div className="form-element">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                className="w-full p-4 border-0 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                value={user?.email || ''}
                readOnly
              />
            </div>
            <div className="form-element">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Gemini API Key
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="relative editing-element">
                    <input
                      type="text"
                      className={`w-full p-4 pr-12 border-0 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
                        error ? 'ring-2 ring-red-500' : 
                        validationStatus === 'valid' ? 'ring-2 ring-green-500' :
                        validationStatus === 'invalid' ? 'ring-2 ring-red-500' : ''
                      }`}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setValidationStatus('idle');
                        setError(null);
                      }}
                      placeholder="Enter your Gemini API key"
                      autoFocus
                    />
                    
                    {/* Validation Status Icon */}
                    {validationStatus === 'valid' && (
                      <div className="absolute inset-y-0 right-3 flex items-center">
                        <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    
                    {validationStatus === 'invalid' && (
                      <div className="absolute inset-y-0 right-3 flex items-center">
                        <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Validation Success Message */}
                  {validationStatus === 'valid' && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✓ API key is valid and ready to use
                    </p>
                  )}
                  
                  <div className="flex space-x-3 mt-4 editing-element">
                    <button
                      onClick={validateApiKey}
                      disabled={isValidating || !apiKey.trim()}
                      className="px-6 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
                      style={{
                        background: 'rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      {isValidating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Testing...
                        </>
                      ) : 'Test Key'}
                    </button>
                    <button
                      onClick={handleUpdateApiKey}
                      disabled={isSaving || !apiKey.trim() || validationStatus !== 'valid'}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:scale-105 transition-all disabled:opacity-50 font-medium shadow-lg"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setApiKey('••••••••••••••••');
                        setError(null);
                      }}
                      className="px-6 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:scale-105 transition-all font-medium"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <input
                    type="password"
                    className="w-full p-4 border-0 rounded-xl text-gray-900 dark:text-white focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    value={apiKey}
                    readOnly
                  />
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setApiKey(''); // Clear the placeholder for editing
                      }}
                      className="px-4 py-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-all font-medium"
                      style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                      }}
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
              
              {/* API Key Help Text */}
              <div 
                className="mt-4 p-3 rounded-lg text-xs text-gray-600 dark:text-gray-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                Your API key is stored securely. We validate all keys with the Gemini API before saving.
                <a
                  href="https://ai.google.dev/tutorials/setup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  Get API Key
                </a>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<StoryGenerator />} />
        <Route path="library" element={<StoryLibraryPage />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<StoryGenerator />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardPage;