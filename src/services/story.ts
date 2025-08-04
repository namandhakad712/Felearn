import { appwriteService } from './appwrite';
import { databaseService } from './databaseService';
import { Story, StorySlide } from '../types';
import { APPWRITE_CONFIG } from '../config/appwrite';

/**
 * Story Service
 * Handles all story-related operations
 */
class StoryService {
  /**
   * Create a new story
   */
  async createStory(title: string, content: string, images: string[] = [], slides: StorySlide[] = []): Promise<Story> {
    try {
      console.log('Creating story:', { title, content, images, slides: slides.length });

      // Extract title from content if not provided
      const finalTitle = title || this.extractTitleFromContent(content);

      // Get current user for story data
      const currentUser = await appwriteService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Create story document
      const storyData = {
        userId: currentUser.$id,
        email: currentUser.email,
        name: currentUser.name,
        lastLogin: currentUser.accessedAt,
        title: finalTitle,
        content,
        images,
        slides,
        createdAt: new Date().toISOString(),
        isPinned: false,
        tags: [],
        tokens: this.calculateTokens(content)
      };

      const story = await databaseService.createDocument<Story>(
        APPWRITE_CONFIG.collections.stories,
        storyData
      );
      
      console.log('Story created successfully:', story);
      return story;
    } catch (error) {
      console.error('Error creating story:', error);
      throw new Error('Failed to create story. Please try again.');
    }
  }

  /**
   * Get all stories for the current user
   */
  async getStories(): Promise<Story[]> {
    try {
      // Get current user
      const currentUser = await appwriteService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Fetch stories for current user
      const result = await databaseService.listDocuments<Story>(
        APPWRITE_CONFIG.collections.stories,
        [/* Add user filter here if needed */]
      );
      
      const stories = result.documents;
      console.log('Stories fetched successfully:', stories.length);

      // Sort stories by creation date (newest first) and pinned status
      return stories.sort((a: any, b: any) => {
        // Pinned stories first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // Then by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw new Error('Failed to load stories. Please refresh the page.');
    }
  }

  /**
   * Get a single story by ID
   */
  async getStory(storyId: string): Promise<Story> {
    try {
      const story = await databaseService.getDocument<Story>(
        APPWRITE_CONFIG.collections.stories,
        storyId
      );
      return story;
    } catch (error) {
      console.error('Error getting story:', error);
      throw new Error('Failed to load story. Please try again.');
    }
  }

  /**
   * Update a story
   */
  async updateStory(storyId: string, updates: Partial<Story>): Promise<Story> {
    try {
      const updatedStory = await databaseService.updateDocument<Story>(
        APPWRITE_CONFIG.collections.stories,
        storyId,
        updates
      );
      return updatedStory;
    } catch (error) {
      console.error('Error updating story:', error);
      throw new Error('Failed to update story. Please try again.');
    }
  }

  /**
   * Delete a story
   */
  async deleteStory(storyId: string): Promise<boolean> {
    try {
      const result = await databaseService.deleteDocument(
        APPWRITE_CONFIG.collections.stories,
        storyId
      );
      return result;
    } catch (error) {
      console.error('Error deleting story:', error);
      throw new Error('Failed to delete story. Please try again.');
    }
  }

  /**
   * Pin or unpin a story
   */
  async toggleStoryPin(storyId: string, isPinned: boolean): Promise<Story> {
    try {
      console.log('Toggling story pin:', storyId, isPinned);

      const updatedStory = await this.updateStory(storyId, { isPinned });
      console.log('Story pin status updated successfully');

      return updatedStory;
    } catch (error) {
      console.error('Error toggling story pin:', error);
      throw new Error('Failed to update story pin status. Please try again.');
    }
  }

  /**
   * Rename a story
   */
  async renameStory(storyId: string, newTitle: string): Promise<Story> {
    try {
      console.log('Renaming story:', storyId, newTitle);

      if (!newTitle.trim()) {
        throw new Error('Story title cannot be empty');
      }

      const updatedStory = await this.updateStory(storyId, { title: newTitle.trim() });
      console.log('Story renamed successfully');

      return updatedStory;
    } catch (error) {
      console.error('Error renaming story:', error);
      throw new Error('Failed to rename story. Please try again.');
    }
  }

  /**
   * Search stories by title or content
   */
  async searchStories(query: string): Promise<Story[]> {
    try {
      // Searching stories

      const allStories = await this.getStories();

      if (!query.trim()) {
        return allStories;
      }

      const searchTerm = query.toLowerCase().trim();
      const filteredStories = allStories.filter(story =>
        story.title.toLowerCase().includes(searchTerm) ||
        story.content.toLowerCase().includes(searchTerm) ||
        (story.tags && story.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );

      // Search completed
      return filteredStories;
    } catch (error) {
      console.error('Error searching stories:', error);
      throw new Error('Failed to search stories. Please try again.');
    }
  }

  /**
   * Get stories with specific filters
   */
  async getFilteredStories(filter: 'all' | 'pinned' | 'recent'): Promise<Story[]> {
    try {
      // Getting filtered stories

      const allStories = await this.getStories();

      switch (filter) {
        case 'pinned':
          return allStories.filter(story => story.isPinned);

        case 'recent': {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return allStories.filter(story => new Date(story.createdAt) > weekAgo);
        }

        case 'all':
        default:
          return allStories;
      }
    } catch (error) {
      console.error('Error getting filtered stories:', error);
      throw new Error('Failed to load filtered stories. Please try again.');
    }
  }

  /**
   * Batch operations for multiple stories
   */
  async batchDeleteStories(storyIds: string[]): Promise<boolean> {
    try {
      // Batch deleting stories

      const deletePromises = storyIds.map(id => this.deleteStory(id));
      await Promise.all(deletePromises);

      console.log('Batch delete completed successfully');
      return true;
    } catch (error) {
      console.error('Error in batch delete:', error);
      throw new Error('Failed to delete some stories. Please try again.');
    }
  }

  /**
   * Get story statistics
   */
  async getStoryStats(): Promise<{
    total: number;
    pinned: number;
    recent: number;
    withImages: number;
  }> {
    try {
      const stories = await this.getStories();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      return {
        total: stories.length,
        pinned: stories.filter(s => s.isPinned).length,
        recent: stories.filter(s => new Date(s.createdAt) > weekAgo).length,
        withImages: stories.filter(s => s.images && s.images.length > 0).length,
      };
    } catch (error) {
      console.error('Error getting story stats:', error);
      return { total: 0, pinned: 0, recent: 0, withImages: 0 };
    }
  }

  /**
   * Calculate tokens used for content (simple word count approximation)
   */
  private calculateTokens(content: string): number {
    // Simple approximation: 1 token ≈ 4 characters
    return Math.ceil(content.length / 4);
  }

  /**
   * Extract title from content
   */
  private extractTitleFromContent(content: string): string {
    // Extract first line or first 50 characters as title
    const firstLine = content.split('\n')[0];
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine || 'Untitled Story';
  }

  /**
   * Validate story data
   */
  validateStoryData(title: string, content: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!title.trim()) {
      errors.push('Story title is required');
    } else if (title.length > 200) {
      errors.push('Story title must be less than 200 characters');
    }

    if (!content.trim()) {
      errors.push('Story content is required');
    } else if (content.length < 10) {
      errors.push('Story content must be at least 10 characters');
    } else if (content.length > 50000) {
      errors.push('Story content must be less than 50,000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Create and export a singleton instance
export const storyService = new StoryService();