import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Databases, ID, Query } from 'appwrite';
import { databaseService } from '../databaseService';
import { APPWRITE_CONFIG } from '../../config/appwrite';

// Mock Appwrite SDK
vi.mock('appwrite', () => {
  const mockCreateDocument = vi.fn();
  const mockGetDocument = vi.fn();
  const mockUpdateDocument = vi.fn();
  const mockDeleteDocument = vi.fn();
  const mockListDocuments = vi.fn();
  
  return {
    Client: vi.fn().mockImplementation(() => ({
      setEndpoint: vi.fn().mockReturnThis(),
      setProject: vi.fn().mockReturnThis(),
    })),
    Databases: vi.fn().mockImplementation(() => ({
      createDocument: mockCreateDocument,
      getDocument: mockGetDocument,
      updateDocument: mockUpdateDocument,
      deleteDocument: mockDeleteDocument,
      listDocuments: mockListDocuments,
    })),
    ID: {
      unique: vi.fn().mockReturnValue('unique-id'),
    },
    Query: {
      equal: vi.fn().mockImplementation((field, value) => `equal(${field},${value})`),
      limit: vi.fn().mockImplementation(value => `limit(${value})`),
      offset: vi.fn().mockImplementation(value => `offset(${value})`),
      orderDesc: vi.fn().mockImplementation(field => `orderDesc(${field})`),
      orderAsc: vi.fn().mockImplementation(field => `orderAsc(${field})`),
      search: vi.fn().mockImplementation((field, value) => `search(${field},${value})`),
    },
  };
});

// Mock config
vi.mock('../../config/appwrite', () => ({
  APPWRITE_CONFIG: {
    databaseId: 'test-database',
    collections: {
      users: 'users',
      stories: 'stories',
      adminLogs: 'admin_logs',
      errorLogs: 'error_logs',
    },
  },
}));

describe('Database Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CRUD Operations', () => {
    it('should get a document', async () => {
      const mockDocument = {
        $id: 'doc-id',
        name: 'Test Document',
      };
      
      const { getDocument } = vi.mocked(Databases).mock.results[0].value as any;
      getDocument.mockResolvedValue(mockDocument);
      
      const result = await databaseService.getDocument('test-collection', 'doc-id');
      
      expect(getDocument).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        'test-collection',
        'doc-id'
      );
      expect(result).toEqual(mockDocument);
    });
    
    it('should handle errors when getting a document', async () => {
      const { getDocument } = vi.mocked(Databases).mock.results[0].value as any;
      getDocument.mockRejectedValue(new Error('Document not found'));
      
      await expect(
        databaseService.getDocument('test-collection', 'doc-id')
      ).rejects.toThrow();
    });
    
    it('should create a document', async () => {
      const mockDocument = {
        $id: 'doc-id',
        name: 'Test Document',
      };
      
      const { createDocument } = vi.mocked(Databases).mock.results[0].value as any;
      createDocument.mockResolvedValue(mockDocument);
      
      const result = await databaseService.createDocument(
        'test-collection',
        { name: 'Test Document' }
      );
      
      expect(createDocument).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        'test-collection',
        expect.any(String),
        { name: 'Test Document' },
        undefined
      );
      expect(result).toEqual(mockDocument);
    });
    
    it('should create a document with a specific ID', async () => {
      const mockDocument = {
        $id: 'custom-id',
        name: 'Test Document',
      };
      
      const { createDocument } = vi.mocked(Databases).mock.results[0].value as any;
      createDocument.mockResolvedValue(mockDocument);
      
      const result = await databaseService.createDocument(
        'test-collection',
        { name: 'Test Document' },
        'custom-id'
      );
      
      expect(createDocument).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        'test-collection',
        'custom-id',
        { name: 'Test Document' },
        undefined
      );
      expect(result).toEqual(mockDocument);
    });
    
    it('should update a document', async () => {
      const mockDocument = {
        $id: 'doc-id',
        name: 'Updated Document',
      };
      
      const { updateDocument } = vi.mocked(Databases).mock.results[0].value as any;
      updateDocument.mockResolvedValue(mockDocument);
      
      const result = await databaseService.updateDocument(
        'test-collection',
        'doc-id',
        { name: 'Updated Document' }
      );
      
      expect(updateDocument).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        'test-collection',
        'doc-id',
        { name: 'Updated Document' }
      );
      expect(result).toEqual(mockDocument);
    });
    
    it('should delete a document', async () => {
      const { deleteDocument } = vi.mocked(Databases).mock.results[0].value as any;
      deleteDocument.mockResolvedValue({});
      
      const result = await databaseService.deleteDocument('test-collection', 'doc-id');
      
      expect(deleteDocument).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        'test-collection',
        'doc-id'
      );
      expect(result).toBe(true);
    });
    
    it('should list documents', async () => {
      const mockResponse = {
        documents: [
          { $id: 'doc-1', name: 'Document 1' },
          { $id: 'doc-2', name: 'Document 2' },
        ],
        total: 2,
      };
      
      const { listDocuments } = vi.mocked(Databases).mock.results[0].value as any;
      listDocuments.mockResolvedValue(mockResponse);
      
      const result = await databaseService.listDocuments('test-collection');
      
      expect(listDocuments).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        'test-collection',
        []
      );
      expect(result).toEqual({
        documents: [
          { $id: 'doc-1', name: 'Document 1' },
          { $id: 'doc-2', name: 'Document 2' },
        ],
        total: 2,
      });
    });
    
    it('should list documents with queries', async () => {
      const mockResponse = {
        documents: [
          { $id: 'doc-1', name: 'Document 1' },
        ],
        total: 1,
      };
      
      const { listDocuments } = vi.mocked(Databases).mock.results[0].value as any;
      listDocuments.mockResolvedValue(mockResponse);
      
      const queries = [
        Query.equal('name', 'Document 1'),
        Query.limit(10),
      ];
      
      const result = await databaseService.listDocuments('test-collection', queries);
      
      expect(listDocuments).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        'test-collection',
        queries
      );
      expect(result).toEqual({
        documents: [
          { $id: 'doc-1', name: 'Document 1' },
        ],
        total: 1,
      });
    });
  });

  describe('Data Processing', () => {
    it('should process user document settings from string to object', async () => {
      const mockDocument = {
        $id: 'user-id',
        email: 'test@example.com',
        settings: '{"theme":"light","language":"en"}',
        $collectionId: APPWRITE_CONFIG.collections.users,
      };
      
      const { getDocument } = vi.mocked(Databases).mock.results[0].value as any;
      getDocument.mockResolvedValue(mockDocument);
      
      const result = await databaseService.getDocument(APPWRITE_CONFIG.collections.users, 'user-id');
      
      expect(result).toEqual({
        $id: 'user-id',
        email: 'test@example.com',
        settings: {
          theme: 'light',
          language: 'en',
        },
        $collectionId: APPWRITE_CONFIG.collections.users,
      });
    });
    
    it('should process story document images from string to array', async () => {
      const mockDocument = {
        $id: 'story-id',
        title: 'Test Story',
        images: '["image1.jpg","image2.jpg"]',
        $collectionId: APPWRITE_CONFIG.collections.stories,
      };
      
      const { getDocument } = vi.mocked(Databases).mock.results[0].value as any;
      getDocument.mockResolvedValue(mockDocument);
      
      const result = await databaseService.getDocument(APPWRITE_CONFIG.collections.stories, 'story-id');
      
      expect(result).toEqual({
        $id: 'story-id',
        title: 'Test Story',
        images: ['image1.jpg', 'image2.jpg'],
        $collectionId: APPWRITE_CONFIG.collections.stories,
      });
    });
    
    it('should prepare data for storage by converting objects to strings', async () => {
      const mockDocument = {
        $id: 'doc-id',
        name: 'Test Document',
      };
      
      const { createDocument } = vi.mocked(Databases).mock.results[0].value as any;
      createDocument.mockResolvedValue(mockDocument);
      
      await databaseService.createDocument(
        APPWRITE_CONFIG.collections.users,
        {
          name: 'Test User',
          settings: {
            theme: 'dark',
            language: 'en',
          },
        }
      );
      
      expect(createDocument).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        expect.any(String),
        expect.objectContaining({
          name: 'Test User',
          settings: '{"theme":"dark","language":"en"}',
        }),
        undefined
      );
    });
  });

  describe('Specialized Queries', () => {
    it('should search documents', async () => {
      const mockResponse = {
        documents: [
          { $id: 'doc-1', name: 'Test Document' },
        ],
        total: 1,
      };
      
      const { listDocuments } = vi.mocked(Databases).mock.results[0].value as any;
      listDocuments.mockResolvedValue(mockResponse);
      
      const result = await databaseService.searchDocuments(
        'test-collection',
        'name',
        'Test'
      );
      
      expect(listDocuments).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        'test-collection',
        [
          expect.stringContaining('search(name,Test)'),
          expect.stringContaining('limit(10)'),
        ]
      );
      expect(result).toEqual([
        { $id: 'doc-1', name: 'Test Document' },
      ]);
    });
    
    it('should get all users', async () => {
      const mockResponse = {
        documents: [
          { 
            $id: 'user-1', 
            email: 'user1@example.com',
            settings: '{"theme":"light","language":"en"}',
          },
          { 
            $id: 'user-2', 
            email: 'user2@example.com',
            settings: '{"theme":"dark","language":"fr"}',
          },
        ],
        total: 2,
      };
      
      const { listDocuments } = vi.mocked(Databases).mock.results[0].value as any;
      listDocuments.mockResolvedValue(mockResponse);
      
      const result = await databaseService.getAllUsers();
      
      expect(listDocuments).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        expect.arrayContaining([
          expect.stringContaining('limit(100)'),
          expect.stringContaining('offset(0)'),
          expect.stringContaining('orderDesc($createdAt)'),
        ])
      );
      expect(result).toEqual({
        users: [
          { 
            $id: 'user-1', 
            email: 'user1@example.com',
            settings: {
              theme: 'light',
              language: 'en',
            },
          },
          { 
            $id: 'user-2', 
            email: 'user2@example.com',
            settings: {
              theme: 'dark',
              language: 'fr',
            },
          },
        ],
        total: 2,
      });
    });
    
    it('should get user stories', async () => {
      const mockResponse = {
        documents: [
          { 
            $id: 'story-1', 
            title: 'Story 1',
            userId: 'user-1',
            images: '[]',
          },
          { 
            $id: 'story-2', 
            title: 'Story 2',
            userId: 'user-1',
            images: '["image.jpg"]',
          },
        ],
        total: 2,
      };
      
      const { listDocuments } = vi.mocked(Databases).mock.results[0].value as any;
      listDocuments.mockResolvedValue(mockResponse);
      
      const result = await databaseService.getUserStories('user-1');
      
      expect(listDocuments).toHaveBeenCalledWith(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.stories,
        expect.arrayContaining([
          expect.stringContaining('equal(userId,user-1)'),
          expect.stringContaining('limit(20)'),
          expect.stringContaining('offset(0)'),
          expect.stringContaining('orderDesc(createdAt)'),
        ])
      );
      expect(result).toEqual({
        stories: [
          { 
            $id: 'story-1', 
            title: 'Story 1',
            userId: 'user-1',
            images: [],
          },
          { 
            $id: 'story-2', 
            title: 'Story 2',
            userId: 'user-1',
            images: ['image.jpg'],
          },
        ],
        total: 2,
      });
    });
  });
});