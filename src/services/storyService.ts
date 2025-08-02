import { ID, Query } from 'appwrite';
import { databaseService } from './databaseService';
import { APPWRITE_CONFIG } from '../config/appwrite';
import { Story, StorySlide } from '../types';

/**
 * Story Service
 * Handles all story-related database operations
 */
export class StoryService {
  private readonly collectionId: string;
  
  constructor() {
    this.collectionId = APPWRITE_CONFIG.collections.stories;
  }

  /**
   * Get a story by ID
   * @param storyId Story ID
   * @returns Promise with the story data
   */
  async getStory(storyId: string): Promise<Story> {
    return databaseService.getDocument<Story>(this.collectionId, storyId);
  }

  /**
   * Create a new story
   * @param userId User ID
   * @param title Story title
   * @param content Story content
   * @param images Optional array of image URLs
   * @param tags Optional array of tags
   * @returns Promise with the created story
   */
  async createStory(
    userId: string,
    title: string,
    content: string,
    images: string[] = [],
    tags: string[] = [],
    email: string = 'user@example.com', // Default email as fallback
    name: string = 'User', // Default name as fallback
    lastLogin: string = new Date().toISOString(), // Default lastLogin as current time
    slides: StorySlide[] = [] // Add slides parameter
  ): Promise<Story> {
    const storyData: Partial<Story> = {
      userId,
      title,
      content,
      images,
      slides, // Add slides to the data being saved
      tags,
      email, // Add required email field
      name, // Add required name field
      lastLogin, // Add required lastLogin field
      createdAt: new Date().toISOString(),
      isPinned: false
    };
    
    return databaseService.createDocument<Story>(
      this.collectionId,
      storyData
    );
  }

  /**
   * Update a story
   * @param storyId Story ID
   * @param storyData Story data to update
   * @returns Promise with the updated story
   */
  async updateStory(storyId: string, storyData: Partial<Story>): Promise<Story> {
    return databaseService.updateDocument<Story>(
      this.collectionId,
      storyId,
      storyData
    );
  }

  /**
   * Delete a story and its associated images
   * @param storyId Story ID
   * @returns Promise indicating success
   */
  async deleteStory(storyId: string): Promise<boolean> {
    try {
      // 1. First get the story to access its images
      const story = await this.getStory(storyId);
      
      // 2. Delete all associated image files from storage
      if (story.images && story.images.length > 0) {
        console.log(`Deleting ${story.images.length} images for story ${storyId}`);
        console.log('Image URLs to delete:', story.images);
        
        // Import appwrite service for file deletion
        const { appwriteService } = await import('./appwrite');
        
        // Delete each image file
        const deletePromises = story.images.map(async (imageUrl) => {
          try {
            // Extract file ID from Appwrite URL using proper regex
            const extractFileId = (url: string): string | null => {
              try {
                console.log(`Extracting file ID from URL: ${url}`);
                
                // If it's already just a file ID (no URL structure), return it
                if (!url.includes('/') && !url.includes('?')) {
                  console.log(`URL appears to be a direct file ID: ${url}`);
                  return url;
                }
                
                // Match patterns like: /files/file-id/view or /files/file-id/preview
                const match = url.match(/\/files\/([^\/\?]+)(?:\/(?:view|preview))?/);
                const extractedId = match ? match[1] : null;
                console.log(`Extracted file ID: ${extractedId}`);
                return extractedId;
              } catch (error) {
                console.error('Error extracting file ID from URL:', url, error);
                return null;
              }
            };

            const fileId = extractFileId(imageUrl);
            if (!fileId) {
              console.warn(`Could not extract file ID from URL: ${imageUrl}`);
              return;
            }

            await appwriteService.deleteFile(fileId);
            console.log(`Deleted image: ${fileId}`);
          } catch (error) {
            console.error(`Failed to delete image ${imageUrl}:`, error);
            // Continue with other deletions even if one fails
          }
        });
        
        await Promise.all(deletePromises);
      }
      
      // 3. Delete the story document from database
      const result = await databaseService.deleteDocument(this.collectionId, storyId);
      
      console.log(`Story ${storyId} and its images deleted successfully`);
      return result;
      
    } catch (error) {
      console.error(`Error deleting story ${storyId}:`, error);
      throw error;
    }
  }

  /**
   * Get stories by user ID
   * @param userId User ID
   * @param limit Optional limit of stories to return
   * @param offset Optional offset for pagination
   * @returns Promise with stories and total count
   */
  async getUserStories(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ stories: Story[]; total: number }> {
    const result = await databaseService.listDocuments<Story>(
      this.collectionId,
      [
        Query.equal('userId', userId),
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc('createdAt')
      ]
    );
    
    return {
      stories: result.documents,
      total: result.total
    };
  }

  /**
   * Get pinned stories by user ID
   * @param userId User ID
   * @param limit Optional limit of stories to return
   * @returns Promise with pinned stories
   */
  async getPinnedStories(userId: string, limit: number = 5): Promise<Story[]> {
    const result = await databaseService.listDocuments<Story>(
      this.collectionId,
      [
        Query.equal('userId', userId),
        Query.equal('isPinned', true),
        Query.limit(limit),
        Query.orderDesc('createdAt')
      ]
    );
    
    return result.documents;
  }

  /**
   * Toggle story pin status
   * @param storyId Story ID
   * @param isPinned Whether the story should be pinned
   * @returns Promise with the updated story
   */
  async togglePinStatus(storyId: string, isPinned: boolean): Promise<Story> {
    return this.updateStory(storyId, { isPinned });
  }

  /**
   * Search stories by title or content
   * @param userId User ID
   * @param query Search query
   * @param limit Optional limit of results
   * @returns Promise with matching stories
   */
  async searchStories(userId: string, query: string, limit: number = 10): Promise<Story[]> {
    // Search in both title and content fields
    const titleResults = await databaseService.searchDocuments<Story>(
      this.collectionId,
      'title',
      query,
      limit
    );
    
    const contentResults = await databaseService.searchDocuments<Story>(
      this.collectionId,
      'content',
      query,
      limit
    );
    
    // Combine results, filter by userId, and remove duplicates
    const combinedResults = [...titleResults, ...contentResults]
      .filter(story => story.userId === userId);
    
    const uniqueResults = combinedResults.filter((story, index, self) =>
      index === self.findIndex(s => s.$id === story.$id)
    );
    
    return uniqueResults.slice(0, limit);
  }

  /**
   * Get stories by tag
   * @param userId User ID
   * @param tag Tag to filter by
   * @param limit Optional limit of stories to return
   * @returns Promise with matching stories
   */
  async getStoriesByTag(userId: string, tag: string, limit: number = 20): Promise<Story[]> {
    // First get all user stories since Appwrite doesn't support array contains
    const { stories } = await this.getUserStories(userId, 100);
    
    // Filter stories that have the tag
    const filteredStories = stories.filter(story => 
      story.tags && story.tags.includes(tag)
    );
    
    return filteredStories.slice(0, limit);
  }
}

// Create and export a singleton instance
export const storyService = new StoryService();