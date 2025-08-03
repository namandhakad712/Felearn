import { useState, useEffect, useCallback } from 'react';
import { Story, StorySlide } from '../types';
import { storyService } from '../services';
import { useAuth } from '../contexts/AuthContext';

interface UseStoriesReturn {
  stories: Story[];
  isLoading: boolean;
  error: string | null;
  createStory: (title: string, content: string, images?: string[], slides?: StorySlide[], tokens?: number) => Promise<Story>;
  updateStory: (storyId: string, updates: Partial<Story>) => Promise<Story>;
  deleteStory: (storyId: string) => Promise<boolean>;
  renameStory: (storyId: string, newTitle: string) => Promise<Story>;
  togglePin: (storyId: string, isPinned: boolean) => Promise<Story>;
  refreshStories: () => Promise<void>;
  clearError: () => void;
}

export const useStories = (): UseStoriesReturn => {
  // Import auth context to get user information
  const { user } = useAuth?.() || { user: null };
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stories on mount
  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use getUserStories instead of getStories since getStories doesn't exist
      // Use the authenticated user's ID if available
      const userId = user?.$id || 'current-user'; // Use actual user ID if available
      const result = await storyService.getUserStories(userId);
      setStories(result.stories || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load stories');
      console.error('Error loading stories:', err);
      // Set empty array to prevent further errors
      setStories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createStory = useCallback(async (title: string, content: string, images: string[] = [], slides: StorySlide[] = [], tokens: number = 0): Promise<Story> => {
    try {
      setError(null);
      
      // Simple validation since storyService.validateStoryData doesn't exist
      const validateStoryData = (title: string, content: string) => {
        const errors = [];
        if (!content || content.trim() === '') {
          errors.push('Story content is required');
        }
        return { isValid: errors.length === 0, errors };
      };
      
      const validation = validateStoryData(title, content);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Extract title from content if not provided
      const extractTitleFromContent = (content: string): string => {
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          const firstLine = lines[0].trim();
          const cleanTitle = firstLine.replace(/^#+\s*/, '').trim();
          return cleanTitle || 'Untitled Story';
        }
        return 'Untitled Story';
      };

      // Create optimistic story for immediate UI update
      const optimisticStory: Story = {
        $id: `temp-${Date.now()}`,
        userId: user?.$id || 'current-user',
        title: title || extractTitleFromContent(content),
        content,
        images: images || [],
        slides: slides || [],
        createdAt: new Date().toISOString(),
        isPinned: false,
        tags: [],
        // Add required fields with user information from auth context
        email: user?.email || 'user@example.com',
        name: user?.name || 'User',
        lastLogin: user?.lastLogin || new Date().toISOString(),
        tokens: tokens || 0, // ✅ Add token count
      };

      // Optimistic update
      setStories(prev => [optimisticStory, ...prev]);

      try {
        // Get the current user ID from the auth context
        const userId = user?.$id || 'current-user'; // Use actual user ID if available
        
        // Get user email and name from auth context
        const email = user?.email || 'user@example.com';
        const name = user?.name || 'User';
        const lastLogin = user?.lastLogin || new Date().toISOString();
        
        // Extract tags from slides if available
        const tags: string[] = [];
        
        // Upload images to Appwrite Storage if they are base64 strings
        let processedImages = images;
        if (images && images.length > 0) {
          console.log('Uploading images to storage...');
          try {
            // Import appwriteService for image upload
            const { appwriteService } = await import('../services/appwrite');
            processedImages = await appwriteService.uploadStoryImages(images);
            console.log('Images uploaded successfully:', processedImages.length);
          } catch (uploadError) {
            console.error('Failed to upload images, using original:', uploadError);
            // Keep original images as fallback
            processedImages = images;
          }
        }
        
        // Create story in database with user information from auth context
        // The function now expects (userId, title, content, images, tags, email, name, lastLogin, slides, tokens)
        console.log('🔄 useStories: Creating story with tokens:', tokens);
        const createdStory = await storyService.createStory(userId, title, content, processedImages, tags, email, name, lastLogin, slides, tokens);
        console.log('✅ useStories: Story created with tokens:', createdStory.tokens);
        
        // Update the story with processed images
        createdStory.images = processedImages;
        
        // Replace optimistic story with real story
        setStories(prev => prev.map(story => 
          story.$id === optimisticStory.$id ? createdStory : story
        ));

        return createdStory;
      } catch (error) {
        // Remove optimistic story on error
        setStories(prev => prev.filter(story => story.$id !== optimisticStory.$id));
        throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create story');
      throw err;
    }
  }, []);

  const updateStory = useCallback(async (storyId: string, updates: Partial<Story>): Promise<Story> => {
    try {
      setError(null);

      // Optimistic update
      const originalStory = stories.find(s => s.$id === storyId);
      if (!originalStory) {
        throw new Error('Story not found');
      }

      const optimisticStory = { ...originalStory, ...updates };
      setStories(prev => prev.map(story => 
        story.$id === storyId ? optimisticStory : story
      ));

      try {
        // Update story in database
        const updatedStory = await storyService.updateStory(storyId, updates);
        
        // Replace optimistic update with real data
        setStories(prev => prev.map(story => 
          story.$id === storyId ? updatedStory : story
        ));

        return updatedStory;
      } catch (error) {
        // Revert optimistic update on error
        setStories(prev => prev.map(story => 
          story.$id === storyId ? originalStory : story
        ));
        throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update story');
      throw err;
    }
  }, [stories]);

  const deleteStory = useCallback(async (storyId: string): Promise<boolean> => {
    try {
      setError(null);

      // Store original story for potential rollback
      const originalStory = stories.find(s => s.$id === storyId);
      if (!originalStory) {
        throw new Error('Story not found');
      }

      // Optimistic update - remove story immediately
      setStories(prev => prev.filter(story => story.$id !== storyId));

      try {
        // Delete story from database
        const result = await storyService.deleteStory(storyId);
        return result;
      } catch (error) {
        // Restore story on error
        setStories(prev => {
          const index = prev.findIndex(s => new Date(s.createdAt) < new Date(originalStory.createdAt));
          if (index === -1) {
            return [...prev, originalStory];
          }
          return [...prev.slice(0, index), originalStory, ...prev.slice(index)];
        });
        throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete story');
      throw err;
    }
  }, [stories]);

  const renameStory = useCallback(async (storyId: string, newTitle: string): Promise<Story> => {
    try {
      return await updateStory(storyId, { title: newTitle });
    } catch (err: any) {
      setError(err.message || 'Failed to rename story');
      throw err;
    }
  }, [updateStory]);

  const togglePin = useCallback(async (storyId: string, isPinned: boolean): Promise<Story> => {
    try {
      const updatedStory = await updateStory(storyId, { isPinned });
      
      // Re-sort stories to move pinned stories to top
      setStories(prev => [...prev].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }));

      return updatedStory;
    } catch (err: any) {
      setError(err.message || 'Failed to update pin status');
      throw err;
    }
  }, [updateStory]);

  const refreshStories = useCallback(async () => {
    await loadStories();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    stories,
    isLoading,
    error,
    createStory,
    updateStory,
    deleteStory,
    renameStory,
    togglePin,
    refreshStories,
    clearError,
  };
};