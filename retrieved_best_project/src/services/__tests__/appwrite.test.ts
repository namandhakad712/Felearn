import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Client, Account, Databases, Storage, ID } from 'appwrite';
import { appwriteService } from '../appwrite';
import { APPWRITE_CONFIG } from '../../config/appwrite';

// Mock Appwrite SDK
vi.mock('appwrite', () => {
  const mockCreateDocument = vi.fn();
  const mockGetDocument = vi.fn();
  const mockUpdateDocument = vi.fn();
  const mockDeleteDocument = vi.fn();
  const mockListDocuments = vi.fn();
  
  const mockCreateEmailSession = vi.fn();
  const mockCreateOAuth2Session = vi.fn();
  const mockDeleteSession = vi.fn();
  const mockCreate = vi.fn();
  const mockCreateRecovery = vi.fn();
  const mockGet = vi.fn();
  
  const mockCreateFile = vi.fn();
  const mockGetFilePreview = vi.fn();
  const mockDeleteFile = vi.fn();
  
  return {
    Client: vi.fn().mockImplementation(() => ({
      setEndpoint: vi.fn().mockReturnThis(),
      setProject: vi.fn().mockReturnThis(),
    })),
    Account: vi.fn().mockImplementation(() => ({
      create: mockCreate,
      createEmailSession: mockCreateEmailSession,
      createOAuth2Session: mockCreateOAuth2Session,
      deleteSession: mockDeleteSession,
      createRecovery: mockCreateRecovery,
      get: mockGet,
    })),
    Databases: vi.fn().mockImplementation(() => ({
      createDocument: mockCreateDocument,
      getDocument: mockGetDocument,
      updateDocument: mockUpdateDocument,
      deleteDocument: mockDeleteDocument,
      listDocuments: mockListDocuments,
    })),
    Storage: vi.fn().mockImplementation(() => ({
      createFile: mockCreateFile,
      getFilePreview: mockGetFilePreview,
      deleteFile: mockDeleteFile,
    })),
    ID: {
      unique: vi.fn().mockReturnValue('unique-id'),
    },
    Query: {
      equal: vi.fn().mockReturnValue('equal-query'),
      limit: vi.fn().mockReturnValue('limit-query'),
      orderDesc: vi.fn().mockReturnValue('order-desc-query'),
    },
  };
});

// Mock config
vi.mock('../../config/appwrite', () => ({
  APPWRITE_CONFIG: {
    endpoint: 'https://test.appwrite.io/v1',
    projectId: 'test-project',
    databaseId: 'test-database',
    collections: {
      users: 'users',
      stories: 'stories',
      adminLogs: 'admin_logs',
      errorLogs: 'error_logs',
    },
    buckets: {
      storyImages: 'storytelling-images',
    },
  },
}));

describe('Appwrite Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const mockUser = {
        $id: 'user-id',
        email: 'test@example.com',
      };
      
      const { create } = vi.mocked(Account).mock.results[0].value as any;
      create.mockResolvedValue(mockUser);
      
      const result = await appwriteService.register('test@example.com', 'password123');
      
      expect(create).toHaveBeenCalledWith(expect.any(String), 'test@example.com', 'password123');
      expect(result).toEqual(mockUser);
    });
    
    it('should throw an error if registration fails', async () => {
      const { create } = vi.mocked(Account).mock.results[0].value as any;
      create.mockRejectedValue(new Error('Registration failed'));
      
      await expect(
        appwriteService.register('test@example.com', 'password123')
      ).rejects.toThrow('Registration failed');
    });
    
    it('should login a user', async () => {
      const mockSession = {
        $id: 'session-id',
        userId: 'user-id',
      };
      
      const { createEmailSession } = vi.mocked(Account).mock.results[0].value as any;
      createEmailSession.mockResolvedValue(mockSession);
      
      const result = await appwriteService.login('test@example.com', 'password123');
      
      expect(createEmailSession).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(result).toEqual(mockSession);
    });
    
    it('should throw an error if login fails', async () => {
      const { createEmailSession } = vi.mocked(Account).mock.results[0].value as any;
      createEmailSession.mockRejectedValue(new Error('Invalid credentials'));
      
      await expect(
        appwriteService.login('test@example.com', 'password123')
      ).rejects.toThrow('Invalid credentials');
    });
    
    it('should logout a user', async () => {
      const { deleteSession } = vi.mocked(Account).mock.results[0].value as any;
      deleteSession.mockResolvedValue({});
      
      await appwriteService.logout();
      
      expect(deleteSession).toHaveBeenCalledWith('current');
    });
    
    it('should throw an error if logout fails', async () => {
      const { deleteSession } = vi.mocked(Account).mock.results[0].value as any;
      deleteSession.mockRejectedValue(new Error('Logout failed'));
      
      await expect(
        appwriteService.logout()
      ).rejects.toThrow('Logout failed');
    });
    
    it('should send a password reset email', async () => {
      const { createRecovery } = vi.mocked(Account).mock.results[0].value as any;
      createRecovery.mockResolvedValue({});
      
      await appwriteService.resetPassword('test@example.com');
      
      expect(createRecovery).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String)
      );
    });
    
    it('should throw an error if password reset fails', async () => {
      const { createRecovery } = vi.mocked(Account).mock.results[0].value as any;
      createRecovery.mockRejectedValue(new Error('Password reset failed'));
      
      await expect(
        appwriteService.resetPassword('test@example.com')
      ).rejects.toThrow('Password reset failed');
    });
    
    it('should get the current user', async () => {
      const mockUser = {
        $id: 'user-id',
        email: 'test@example.com',
      };
      
      const { get } = vi.mocked(Account).mock.results[0].value as any;
      get.mockResolvedValue(mockUser);
      
      const { getDocument } = vi.mocked(Databases).mock.results[0].value as any;
      getDocument.mockResolvedValue({
        $id: 'user-id',
        email: 'test@example.com',
        settings: '{"theme":"light","language":"en","onboardingCompleted":false}',
      });
      
      const result = await appwriteService.getCurrentUser();
      
      expect(get).toHaveBeenCalled();
      expect(getDocument).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        'user-id'
      );
      expect(result).toEqual({
        $id: 'user-id',
        email: 'test@example.com',
        settings: {
          theme: 'light',
          language: 'en',
          onboardingCompleted: false,
        },
      });
    });
    
    it('should return null if getting current user fails', async () => {
      const { get } = vi.mocked(Account).mock.results[0].value as any;
      get.mockRejectedValue(new Error('Not authenticated'));
      
      const result = await appwriteService.getCurrentUser();
      
      expect(result).toBeNull();
    });
  });

  describe('User Operations', () => {
    it('should create a user document', async () => {
      const mockUser = {
        $id: 'user-id',
        email: 'test@example.com',
        name: 'test',
        createdAt: expect.any(String),
        lastLogin: expect.any(String),
        settings: expect.any(String),
      };
      
      const { createDocument } = vi.mocked(Databases).mock.results[0].value as any;
      createDocument.mockResolvedValue(mockUser);
      
      const result = await appwriteService.createUserDocument('user-id', 'test@example.com');
      
      expect(createDocument).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        'user-id',
        expect.objectContaining({
          $id: 'user-id',
          email: 'test@example.com',
        })
      );
      expect(result).toEqual(mockUser);
    });
    
    it('should get a user document', async () => {
      const mockUser = {
        $id: 'user-id',
        email: 'test@example.com',
      };
      
      const { getDocument } = vi.mocked(Databases).mock.results[0].value as any;
      getDocument.mockResolvedValue(mockUser);
      
      const result = await appwriteService.getUserDocument('user-id');
      
      expect(getDocument).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        'user-id'
      );
      expect(result).toEqual(mockUser);
    });
    
    it('should update a user', async () => {
      const mockUser = {
        $id: 'user-id',
        email: 'test@example.com',
        name: 'Updated Name',
      };
      
      const { updateDocument } = vi.mocked(Databases).mock.results[0].value as any;
      updateDocument.mockResolvedValue(mockUser);
      
      // Mock getCurrentUser
      vi.spyOn(appwriteService, 'getCurrentUser').mockResolvedValue({
        $id: 'user-id',
        email: 'test@example.com',
      } as any);
      
      const result = await appwriteService.updateUser({
        name: 'Updated Name',
      });
      
      expect(updateDocument).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        'user-id',
        expect.objectContaining({
          name: 'Updated Name',
        })
      );
      expect(result).toEqual(mockUser);
    });
    
    it('should throw an error if updating user without authentication', async () => {
      // Mock getCurrentUser to return null
      vi.spyOn(appwriteService, 'getCurrentUser').mockResolvedValue(null);
      
      await expect(
        appwriteService.updateUser({ name: 'Updated Name' })
      ).rejects.toThrow('No authenticated user');
    });
    
    it('should delete a user', async () => {
      const { deleteDocument } = vi.mocked(Databases).mock.results[0].value as any;
      deleteDocument.mockResolvedValue({});
      
      // Mock getCurrentUser
      vi.spyOn(appwriteService, 'getCurrentUser').mockResolvedValue({
        $id: 'user-id',
        email: 'test@example.com',
        isAdmin: true,
      } as any);
      
      const result = await appwriteService.deleteUser('user-id');
      
      expect(deleteDocument).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        'user-id'
      );
      expect(result).toBe(true);
    });
    
    it('should throw an error if deleting another user without admin rights', async () => {
      // Mock getCurrentUser to return a non-admin user
      vi.spyOn(appwriteService, 'getCurrentUser').mockResolvedValue({
        $id: 'different-user-id',
        email: 'test@example.com',
        isAdmin: false,
      } as any);
      
      await expect(
        appwriteService.deleteUser('user-id')
      ).rejects.toThrow('Unauthorized: Cannot delete another user\'s document');
    });
  });

  describe('Story Operations', () => {
    it('should create a story', async () => {
      const mockStory = {
        $id: 'story-id',
        userId: 'user-id',
        title: 'Test Story',
        content: 'Test content',
        images: '[]',
        createdAt: expect.any(String),
        isPinned: false,
      };
      
      const { createDocument } = vi.mocked(Databases).mock.results[0].value as any;
      createDocument.mockResolvedValue(mockStory);
      
      // Mock getCurrentUser
      vi.spyOn(appwriteService, 'getCurrentUser').mockResolvedValue({
        $id: 'user-id',
        email: 'test@example.com',
      } as any);
      
      const result = await appwriteService.createStory('Test Story', 'Test content');
      
      expect(createDocument).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.stories,
        expect.any(String),
        expect.objectContaining({
          userId: 'user-id',
          title: 'Test Story',
          content: 'Test content',
        })
      );
      expect(result).toEqual(mockStory);
    });
    
    it('should throw an error if creating story without authentication', async () => {
      // Mock getCurrentUser to return null
      vi.spyOn(appwriteService, 'getCurrentUser').mockResolvedValue(null);
      
      await expect(
        appwriteService.createStory('Test Story', 'Test content')
      ).rejects.toThrow('No authenticated user');
    });
    
    it('should get stories for the current user', async () => {
      const mockStories = {
        documents: [
          {
            $id: 'story-id',
            userId: 'user-id',
            title: 'Test Story',
            content: 'Test content',
            images: '[]',
          },
        ],
        total: 1,
      };
      
      const { listDocuments } = vi.mocked(Databases).mock.results[0].value as any;
      listDocuments.mockResolvedValue(mockStories);
      
      // Mock getCurrentUser
      vi.spyOn(appwriteService, 'getCurrentUser').mockResolvedValue({
        $id: 'user-id',
        email: 'test@example.com',
      } as any);
      
      const result = await appwriteService.getStories();
      
      expect(listDocuments).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.stories,
        expect.arrayContaining([expect.any(String)])
      );
      expect(result).toEqual([
        {
          $id: 'story-id',
          userId: 'user-id',
          title: 'Test Story',
          content: 'Test content',
          images: [],
        },
      ]);
    });
    
    it('should throw an error if getting stories without authentication', async () => {
      // Mock getCurrentUser to return null
      vi.spyOn(appwriteService, 'getCurrentUser').mockResolvedValue(null);
      
      await expect(
        appwriteService.getStories()
      ).rejects.toThrow('No authenticated user');
    });
    
    it('should get a single story', async () => {
      const mockStory = {
        $id: 'story-id',
        userId: 'user-id',
        title: 'Test Story',
        content: 'Test content',
        images: '[]',
      };
      
      const { getDocument } = vi.mocked(Databases).mock.results[0].value as any;
      getDocument.mockResolvedValue(mockStory);
      
      const result = await appwriteService.getStory('story-id');
      
      expect(getDocument).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.stories,
        'story-id'
      );
      expect(result).toEqual({
        $id: 'story-id',
        userId: 'user-id',
        title: 'Test Story',
        content: 'Test content',
        images: [],
      });
    });
    
    it('should update a story', async () => {
      const mockStory = {
        $id: 'story-id',
        userId: 'user-id',
        title: 'Updated Story',
        content: 'Test content',
        images: '[]',
      };
      
      const { updateDocument } = vi.mocked(Databases).mock.results[0].value as any;
      updateDocument.mockResolvedValue(mockStory);
      
      const result = await appwriteService.updateStory('story-id', {
        title: 'Updated Story',
      });
      
      expect(updateDocument).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.stories,
        'story-id',
        expect.objectContaining({
          title: 'Updated Story',
        })
      );
      expect(result).toEqual({
        $id: 'story-id',
        userId: 'user-id',
        title: 'Updated Story',
        content: 'Test content',
        images: [],
      });
    });
    
    it('should delete a story', async () => {
      const { deleteDocument } = vi.mocked(Databases).mock.results[0].value as any;
      deleteDocument.mockResolvedValue({});
      
      const result = await appwriteService.deleteStory('story-id');
      
      expect(deleteDocument).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.stories,
        'story-id'
      );
      expect(result).toBe(true);
    });
  });

  describe('File Storage', () => {
    it('should upload a file', async () => {
      const mockFile = {
        $id: 'file-id',
      };
      
      const { createFile } = vi.mocked(Storage).mock.results[0].value as any;
      createFile.mockResolvedValue(mockFile);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await appwriteService.uploadFile(file);
      
      expect(createFile).toHaveBeenCalledWith(
        APPWRITE_CONFIG.buckets.storyImages,
        expect.any(String),
        file
      );
      expect(result).toBe('file-id');
    });
    
    it('should get a file preview', () => {
      const { getFilePreview } = vi.mocked(Storage).mock.results[0].value as any;
      getFilePreview.mockReturnValue('file-preview-url');
      
      const result = appwriteService.getFilePreview('file-id');
      
      expect(getFilePreview).toHaveBeenCalledWith(
        APPWRITE_CONFIG.buckets.storyImages,
        'file-id'
      );
      expect(result).toBe('file-preview-url');
    });
    
    it('should delete a file', async () => {
      const { deleteFile } = vi.mocked(Storage).mock.results[0].value as any;
      deleteFile.mockResolvedValue({});
      
      const result = await appwriteService.deleteFile('file-id');
      
      expect(deleteFile).toHaveBeenCalledWith(
        APPWRITE_CONFIG.buckets.storyImages,
        'file-id'
      );
      expect(result).toBe(true);
    });
  });
});