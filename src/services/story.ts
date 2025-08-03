import { Story } from '../types';
import { appwriteService } from './appwrite';

/**
 * Story service for handling story CRUD operations
 */
export class StoryService {
  /**
   * Create a new story
   */
  async createStory(title: string, content: string, images: string[] = [], slides: StorySlide[] = []): Promise<Story> {
    try {
      console.log('Creating story:', { title, content, images, slides: slides.length });

      // Extract title from content if not provided
      const finalTitle = title || this.extractTitleFromContent(content);

      const story = await appwriteService.createStory(finalTitle, content, images, slides);
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
      // Fetching user stories

      const stories = await appwriteService.getStories();
      // Stories fetched successfully

      // Sort stories by creation date (newest first) and pinned status
      return stories.sort((a, b) => {
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
   * Get a specific story by ID
   */
  async getStory(storyId: string): Promise<Story> {
    try {
      console.log('Fetching story:', storyId);

      const story = await appwriteService.getStory(storyId);
      console.log('Story fetched successfully:', story);

      return story;
    } catch (error) {
      console.error('Error fetching story:', error);
      throw new Error('Failed to load story. Please try again.');
    }
  }

  /**
   * Update an existing story
   */
  async updateStory(storyId: string, updates: Partial<Story>): Promise<Story> {
    try {
      console.log('Updating story:', storyId, updates);

      const updatedStory = await appwriteService.updateStory(storyId, updates);
      console.log('Story updated successfully:', updatedStory);

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
      console.log('Deleting story:', storyId);

      const result = await appwriteService.deleteStory(storyId);
      console.log('Story deleted successfully');

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
   * Extract title from story content
   */
  private extractTitleFromContent(content: string): string {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      // Remove common markdown headers
      const cleanTitle = firstLine.replace(/^#+\s*/, '').trim();
      return cleanTitle || 'Untitled Story';
    }
    return 'Untitled Story';
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