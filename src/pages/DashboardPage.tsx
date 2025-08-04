import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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

      // Use the real gemini service
      const { geminiService } = await import('../services/gemini');
      
      // Initialize the service with user's API key
      geminiService.initialize(user.geminiKey);

      // Generate story with proper request structure
      const response = await geminiService.generateStory({
        prompt: concept,
        apiKey: user.geminiKey,
        userId: user.$id,
        options: {
          temperature: 0.8,
          maxTokens: 8192,
          includeImages: true
        }
      });

      // Set the final generated content
      setStorySlides(response.slides || []);
      setStoryImages(response.images || []);
      setGeneratedStory(response.story); // Minimal text



      // Auto-save the generated story (only if not already saved)
      if (!selectedStory) {
        try {
        // Extract title from the first line of the story or use a default title
        const storyLines = response.story.split('\n');
        let title = storyLines[0].trim();

        // Make sure we have a valid title and limit its length
        if (!title || title.length < 2) {
          title = 'Tiny Cats Explain: ' + concept;
        }
        
        // Limit title to 300 characters to avoid database constraint issues
        if (title.length > 300) {
          title = title.substring(0, 297) + '...';
        }

        // Log the title we're using
        console.log('Using title for story:', title);
        console.log('Title length:', title.length);
        console.log('Response tokens:', response.metadata?.tokensUsed);
        console.log('Tokens being saved:', response.metadata?.tokensUsed || 0);

        // Create story with user information
        const savedStory = await createStory(
          title, 
          response.story, 
          response.images || [], 
          response.slides || [], 
          response.metadata?.tokensUsed || 0
        );
        setSelectedStory(savedStory);
        console.log('Visual story saved automatically:', savedStory);
      } catch (saveError) {
        console.error('Failed to save story:', saveError);
        // Show error to user but still display the story
        showErrorToast('Save Error', 'Failed to save story automatically. You can try saving manually.');
      }
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
  const { user, updateUser, updatePassword } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

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

  const handlePasswordChange = async () => {
    setPasswordError(null);
    
    // Validation
    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }
    
    if (!newPassword) {
      setPasswordError('Please enter a new password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    
    setIsSaving(true);
    
    try {
      await updatePassword(newPassword, currentPassword);
      
      setPasswordSuccess('Password updated successfully');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess(null);
      }, 3000);
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to update password');
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

            {/* Password Change Section */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Password
              </label>
              {isChangingPassword ? (
                <div className="space-y-3">
                  <input
                    type="password"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <input
                    type="password"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <input
                    type="password"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePasswordChange}
                      disabled={isSaving}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      onClick={() => {
                        setIsChangingPassword(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setPasswordError(null);
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
                    value="••••••••••••••••"
                    readOnly
                  />
                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      Change Password
                    </button>
                  </div>
                </>
              )}

              {/* Password Error message */}
              {passwordError && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {passwordError}
                </div>
              )}

              {/* Password Success message */}
              {passwordSuccess && (
                <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                  {passwordSuccess}
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
        <Route path="library" element={<StoryLibraryPage />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<StoryGenerator />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardPage;