import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storyService } from '../services/storyService';
import { userService } from '../services/userService';
import { databaseService } from '../services/databaseService';
import { Story, User } from '../types';

// Mock databaseService
vi.mock('../services/databaseService', () => ({
  databaseService: {
    getDocument: vi.fn(),
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
    listDocuments: vi.fn(),
    searchDocuments: vi.fn(),
    getAllUsers: vi.fn(),
    getUserStories: vi.fn(),
  },
}));

describe('Data Operations Tests', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Story Service', () => {
    const mockStory: Story = {
      $id: 'story-id',
      userId: 'user-id',
      title: 'Test Story',
      content: 'Test content',
      images: [],
      createdAt: new Date().toISOString(),
      isPinned: false,
      tags: ['test'],
    };

    it('should get a story by ID', async () => {
      // Mock databaseService.getDocument
      vi.mocked(databaseService.getDocument).mockResolvedValue(mockStory);
      
      const result = await storyService.getStory('story-id');
      
      expect(databaseService.getDocument).toHaveBeenCalledWith(
        expect.any(String),
        'story-id'
      );
      expect(result).toEqual(mockStory);
    });
    
    it('should create a new story', async () => {
      // Mock databaseService.createDocument
      vi.mocked(databaseService.createDocument).mockResolvedValue(mockStory);
      
      const result = await storyService.createStory(
        'user-id',
        'Test Story',
        'Test content',
        [],
        ['test']
      );
      
      expect(databaseService.createDocument).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          userId: 'user-id',
          title: 'Test Story',
          content: 'Test content',
        })
      );
      expect(result).toEqual(mockStory);
    });
    
    it('should update a story', async () => {
      const updatedStory = { ...mockStory, title: 'Updated Story' };
      
      // Mock databaseService.updateDocument
      vi.mocked(databaseService.updateDocument).mockResolvedValue(updatedStory);
      
      const result = await storyService.updateStory('story-id', {
        title: 'Updated Story',
      });
      
      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        expect.any(String),
        'story-id',
        expect.objectContaining({
          title: 'Updated Story',
        })
      );
      expect(result).toEqual(updatedStory);
    });
    
    it('should delete a story', async () => {
      // Mock databaseService.deleteDocument
      vi.mocked(databaseService.deleteDocument).mockResolvedValue(true);
      
      const result = await storyService.deleteStory('story-id');
      
      expect(databaseService.deleteDocument).toHaveBeenCalledWith(
        expect.any(String),
        'story-id'
      );
      expect(result).toBe(true);
    });
    
    it('should get stories by user ID', async () => {
      const mockResponse = {
        stories: [mockStory],
        total: 1,
      };
      
      // Mock databaseService.getUserStories
      vi.mocked(databaseService.getUserStories).mockResolvedValue(mockResponse);
      
      const result = await storyService.getUserStories('user-id');
      
      expect(databaseService.getUserStories).toHaveBeenCalledWith(
        'user-id',
        20,
        0
      );
      expect(result).toEqual(mockResponse);
    });
    
    it('should get pinned stories', async () => {
      const mockPinnedStory = { ...mockStory, isPinned: true };
      
      // Mock databaseService.listDocuments
      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: [mockPinnedStory],
        total: 1,
      });
      
      const result = await storyService.getPinnedStories('user-id');
      
      expect(databaseService.listDocuments).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          expect.stringContaining('equal(userId,user-id)'),
          expect.stringContaining('equal(isPinned,true)'),
        ])
      );
      expect(result).toEqual([mockPinnedStory]);
    });
    
    it('should toggle story pin status', async () => {
      const pinnedStory = { ...mockStory, isPinned: true };
      
      // Mock databaseService.updateDocument
      vi.mocked(databaseService.updateDocument).mockResolvedValue(pinnedStory);
      
      const result = await storyService.togglePinStatus('story-id', true);
      
      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        expect.any(String),
        'story-id',
        { isPinned: true }
      );
      expect(result).toEqual(pinnedStory);
    });
    
    it('should search stories', async () => {
      // Mock databaseService.searchDocuments
      vi.mocked(databaseService.searchDocuments).mockResolvedValueOnce([mockStory])
        .mockResolvedValueOnce([]);
      
      const result = await storyService.searchStories('user-id', 'test');
      
      expect(databaseService.searchDocuments).toHaveBeenCalledWith(
        expect.any(String),
        'title',
        'test',
        expect.any(Number)
      );
      expect(databaseService.searchDocuments).toHaveBeenCalledWith(
        expect.any(String),
        'content',
        'test',
        expect.any(Number)
      );
      expect(result).toEqual([mockStory]);
    });
  });

  describe('User Service', () => {
    const mockUser: User = {
      $id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      settings: {
        theme: 'light',
        language: 'en',
        onboardingCompleted: false,
      },
      geminiKey: '',
    };

    it('should get a user by ID', async () => {
      // Mock databaseService.getDocument
      vi.mocked(databaseService.getDocument).mockResolvedValue(mockUser);
      
      const result = await userService.getUser('user-id');
      
      expect(databaseService.getDocument).toHaveBeenCalledWith(
        expect.any(String),
        'user-id'
      );
      expect(result).toEqual(mockUser);
    });
    
    it('should create a new user', async () => {
      // Mock databaseService.createDocument
      vi.mocked(databaseService.createDocument).mockResolvedValue(mockUser);
      
      const result = await userService.createUser(
        'user-id',
        'test@example.com',
        'Test User'
      );
      
      expect(databaseService.createDocument).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          $id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
        }),
        'user-id'
      );
      expect(result).toEqual(mockUser);
    });
    
    it('should update a user', async () => {
      const updatedUser = { ...mockUser, name: 'Updated User' };
      
      // Mock databaseService.updateDocument
      vi.mocked(databaseService.updateDocument).mockResolvedValue(updatedUser);
      
      const result = await userService.updateUser('user-id', {
        name: 'Updated User',
      });
      
      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        expect.any(String),
        'user-id',
        expect.objectContaining({
          name: 'Updated User',
        })
      );
      expect(result).toEqual(updatedUser);
    });
    
    it('should update user settings', async () => {
      const updatedUser = {
        ...mockUser,
        settings: {
          ...mockUser.settings,
          theme: 'dark',
        },
      };
      
      // Mock userService.getUser
      vi.spyOn(userService, 'getUser').mockResolvedValue(mockUser);
      
      // Mock databaseService.updateDocument
      vi.mocked(databaseService.updateDocument).mockResolvedValue(updatedUser);
      
      const result = await userService.updateUserSettings('user-id', {
        theme: 'dark',
      });
      
      expect(userService.getUser).toHaveBeenCalledWith('user-id');
      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        expect.any(String),
        'user-id',
        expect.objectContaining({
          settings: expect.objectContaining({
            theme: 'dark',
          }),
        })
      );
      expect(result).toEqual(updatedUser);
    });
    
    it('should delete a user', async () => {
      // Mock databaseService.deleteDocument
      vi.mocked(databaseService.deleteDocument).mockResolvedValue(true);
      
      const result = await userService.deleteUser('user-id');
      
      expect(databaseService.deleteDocument).toHaveBeenCalledWith(
        expect.any(String),
        'user-id'
      );
      expect(result).toBe(true);
    });
    
    it('should get all users', async () => {
      const mockResponse = {
        users: [mockUser],
        total: 1,
      };
      
      // Mock databaseService.getAllUsers
      vi.mocked(databaseService.getAllUsers).mockResolvedValue(mockResponse);
      
      const result = await userService.getAllUsers();
      
      expect(databaseService.getAllUsers).toHaveBeenCalledWith(100, 0);
      expect(result).toEqual(mockResponse);
    });
    
    it('should search users', async () => {
      // Mock databaseService.searchDocuments
      vi.mocked(databaseService.searchDocuments).mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([]);
      
      const result = await userService.searchUsers('test');
      
      expect(databaseService.searchDocuments).toHaveBeenCalledWith(
        expect.any(String),
        'name',
        'test',
        expect.any(Number)
      );
      expect(databaseService.searchDocuments).toHaveBeenCalledWith(
        expect.any(String),
        'email',
        'test',
        expect.any(Number)
      );
      expect(result).toEqual([mockUser]);
    });
  });
});