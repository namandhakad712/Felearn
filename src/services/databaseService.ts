import { Databases, ID, Query } from 'appwrite';
import { appwriteClient } from './appwrite';
import { APPWRITE_CONFIG } from '../config/appwrite';
import AppwriteErrorHandler from '../utils/appwriteErrorHandler';
import { User, Story, AdminLog } from '../types';

/**
 * Interface for database operations
 */
export interface DataService {
  getDocument<T>(collectionId: string, documentId: string): Promise<T>;
  createDocument<T>(collectionId: string, data: any, documentId?: string, permissions?: string[]): Promise<T>;
  updateDocument<T>(collectionId: string, documentId: string, data: any): Promise<T>;
  deleteDocument(collectionId: string, documentId: string): Promise<boolean>;
  listDocuments<T>(collectionId: string, queries?: any[]): Promise<{
    documents: T[];
    total: number;
  }>;
}

/**
 * Appwrite Database Service
 * Handles all database operations using Appwrite SDK
 */
export class AppwriteDatabaseService implements DataService {
  private databases: Databases;
  private databaseId: string;
  
  constructor() {
    this.databases = new Databases(appwriteClient);
    this.databaseId = APPWRITE_CONFIG.databaseId;
  }

  /**
   * Get a document from a collection
   * @param collectionId Collection ID
   * @param documentId Document ID
   * @returns Promise with the document data
   */
  async getDocument<T>(collectionId: string, documentId: string): Promise<T> {
    try {
      const document = await this.databases.getDocument(
        this.databaseId,
        collectionId,
        documentId
      );
      
      return this.processDocument(document) as T;
    } catch (error) {
      console.error(`Get document error (${collectionId}/${documentId}):`, error);
      const errorInfo = AppwriteErrorHandler.handleDatabaseError(error);
      throw new Error(errorInfo.message);
    }
  }

  /**
   * Create a new document in a collection
   * @param collectionId Collection ID
   * @param data Document data
   * @param documentId Optional document ID (generates a unique ID if not provided)
   * @param permissions Optional document permissions
   * @returns Promise with the created document
   */
  async createDocument<T>(
    collectionId: string, 
    data: any, 
    documentId?: string,
    permissions?: string[]
  ): Promise<T> {
    try {
      // Process data before saving (e.g., convert objects to JSON strings)
      const processedData = this.prepareDataForStorage(data);
      
      const document = await this.databases.createDocument(
        this.databaseId,
        collectionId,
        documentId || ID.unique(),
        processedData,
        permissions
      );
      
      const processedDocument = this.processDocument(document) as T;
      
      // Debug logging for stories collection
      if (collectionId.includes('stories')) {
        console.log('📄 Raw document from database:', document);
        console.log('📄 Processed document:', processedDocument);
      }
      
      return processedDocument;
    } catch (error) {
      console.error(`Create document error (${collectionId}):`, error);
      const errorInfo = AppwriteErrorHandler.handleDatabaseError(error);
      throw new Error(errorInfo.message);
    }
  }

  /**
   * Update an existing document
   * @param collectionId Collection ID
   * @param documentId Document ID
   * @param data Document data to update
   * @returns Promise with the updated document
   */
  async updateDocument<T>(collectionId: string, documentId: string, data: any): Promise<T> {
    try {
      // Process data before saving (e.g., convert objects to JSON strings)
      const processedData = this.prepareDataForStorage(data);
      
      const document = await this.databases.updateDocument(
        this.databaseId,
        collectionId,
        documentId,
        processedData
      );
      
      return this.processDocument(document) as T;
    } catch (error) {
      console.error(`Update document error (${collectionId}/${documentId}):`, error);
      const errorInfo = AppwriteErrorHandler.handleDatabaseError(error);
      throw new Error(errorInfo.message);
    }
  }

  /**
   * Delete a document
   * @param collectionId Collection ID
   * @param documentId Document ID
   * @returns Promise indicating success
   */
  async deleteDocument(collectionId: string, documentId: string): Promise<boolean> {
    try {
      await this.databases.deleteDocument(
        this.databaseId,
        collectionId,
        documentId
      );
      
      return true;
    } catch (error) {
      console.error(`Delete document error (${collectionId}/${documentId}):`, error);
      const errorInfo = AppwriteErrorHandler.handleDatabaseError(error);
      throw new Error(errorInfo.message);
    }
  }

  /**
   * List documents in a collection with optional queries
   * @param collectionId Collection ID
   * @param queries Optional query parameters
   * @returns Promise with the documents and total count
   */
  async listDocuments<T>(
    collectionId: string, 
    queries: any[] = []
  ): Promise<{ documents: T[]; total: number }> {
    try {
      const response = await this.databases.listDocuments(
        this.databaseId,
        collectionId,
        queries
      );
      
      // Process each document (e.g., parse JSON strings to objects)
      const processedDocuments = response.documents.map(doc => 
        this.processDocument(doc)
      );
      
      return {
        documents: processedDocuments as T[],
        total: response.total
      };
    } catch (error) {
      console.error(`List documents error (${collectionId}):`, error);
      const errorInfo = AppwriteErrorHandler.handleDatabaseError(error);
      throw new Error(errorInfo.message);
    }
  }

  /**
   * Get all users (admin only)
   * @param limit Optional limit of users to return
   * @param offset Optional offset for pagination
   * @returns Promise with users and total count
   */
  async getAllUsers(limit: number = 100, offset: number = 0): Promise<{ users: User[]; total: number }> {
    const queries = [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc('$createdAt')
    ];
    
    const result = await this.listDocuments<User>(
      APPWRITE_CONFIG.collections.users,
      queries
    );
    
    return {
      users: result.documents,
      total: result.total
    };
  }

  /**
   * Get user stories
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
    const queries = [
      Query.equal('userId', userId),
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc('createdAt')
    ];
    
    const result = await this.listDocuments<Story>(
      APPWRITE_CONFIG.collections.stories,
      queries
    );
    
    return {
      stories: result.documents,
      total: result.total
    };
  }

  /**
   * Get admin logs (admin only)
   * @param limit Optional limit of logs to return
   * @param offset Optional offset for pagination
   * @returns Promise with admin logs and total count
   */
  async getAdminLogs(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ logs: AdminLog[]; total: number }> {
    const queries = [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc('timestamp')
    ];
    
    const result = await this.listDocuments<AdminLog>(
      APPWRITE_CONFIG.collections.adminLogs,
      queries
    );
    
    return {
      logs: result.documents,
      total: result.total
    };
  }

  /**
   * Search documents in a collection
   * @param collectionId Collection ID
   * @param field Field to search in
   * @param query Search query
   * @param limit Optional limit of results
   * @returns Promise with matching documents
   */
  async searchDocuments<T>(
    collectionId: string,
    field: string,
    query: string,
    limit: number = 10
  ): Promise<T[]> {
    try {
      // Use Appwrite's search capabilities
      const response = await this.databases.listDocuments(
        this.databaseId,
        collectionId,
        [
          Query.search(field, query),
          Query.limit(limit)
        ]
      );
      
      // Process each document
      return response.documents.map(doc => 
        this.processDocument(doc)
      ) as T[];
    } catch (error) {
      console.error(`Search documents error (${collectionId}/${field}/${query}):`, error);
      const errorInfo = AppwriteErrorHandler.handleDatabaseError(error);
      throw new Error(errorInfo.message);
    }
  }

  /**
   * Process a document before returning it to the application
   * (e.g., parse JSON strings to objects)
   * @param document Document from Appwrite
   * @returns Processed document
   */
  private processDocument(document: any): any {
    const processedDoc = { ...document };
    
    // Process User document
    if (document.$collectionId === APPWRITE_CONFIG.collections.users) {
      // Parse settings from string to object if it's a string
      if (typeof processedDoc.settings === 'string') {
        try {
          processedDoc.settings = JSON.parse(processedDoc.settings);
        } catch (e) {
          console.error('Error parsing settings JSON:', e);
          processedDoc.settings = {
            theme: 'light',
            language: 'en',
            onboardingCompleted: false
          };
        }
      }
    }
    
    // Process Story document
    if (document.$collectionId === APPWRITE_CONFIG.collections.stories) {
      // Parse images from string to array if it's a string
      if (typeof processedDoc.images === 'string') {
        try {
          processedDoc.images = JSON.parse(processedDoc.images);
        } catch (e) {
          console.error('Error parsing images JSON:', e);
          processedDoc.images = [];
        }
      }
      
      // Parse tags from string to array if it's a string
      if (typeof processedDoc.tags === 'string') {
        try {
          processedDoc.tags = JSON.parse(processedDoc.tags);
        } catch (e) {
          console.error('Error parsing tags JSON:', e);
          processedDoc.tags = [];
        }
      }
      
      // Parse slides from string to array if it's a string
      if (typeof processedDoc.slides === 'string') {
        try {
          const slidesData = JSON.parse(processedDoc.slides);
          // Reconstruct slides with proper image URLs
          processedDoc.slides = slidesData.map((slide: any, index: number) => ({
            text: slide.text || '',
            image: processedDoc.images && processedDoc.images[index] ? processedDoc.images[index] : null
          }));
        } catch (e) {
          console.error('Error parsing slides JSON:', e);
          processedDoc.slides = [];
        }
      }
    }
    
    // Process Error Log document
    if (document.$collectionId === APPWRITE_CONFIG.collections.errorLogs) {
      // Parse context from string to object if it's a string
      if (typeof processedDoc.context === 'string') {
        try {
          processedDoc.context = JSON.parse(processedDoc.context);
        } catch (e) {
          console.error('Error parsing error context JSON:', e);
          processedDoc.context = {};
        }
      }
    }
    
    // Process Admin Log document
    if (document.$collectionId === APPWRITE_CONFIG.collections.adminLogs) {
      // Parse details from string to object if it's a string
      if (typeof processedDoc.details === 'string') {
        try {
          processedDoc.details = JSON.parse(processedDoc.details);
        } catch (e) {
          console.error('Error parsing admin log details JSON:', e);
          processedDoc.details = {};
        }
      }
    }
    
    return processedDoc;
  }

  /**
   * Prepare data for storage in Appwrite
   * (e.g., convert objects to JSON strings)
   * @param data Data to prepare
   * @returns Processed data ready for storage
   */
  private prepareDataForStorage(data: any): any {
    const processedData = { ...data };
    
    // Convert settings object to string if it exists
    if (processedData.settings && typeof processedData.settings === 'object') {
      processedData.settings = JSON.stringify(processedData.settings);
    }
    
    // Convert images array to string if it exists
    if (processedData.images && Array.isArray(processedData.images)) {
      // Since images are now URLs from storage, we can store them directly
      processedData.images = JSON.stringify(processedData.images);
    }
    
    // Convert slides array to string if it exists
    if (processedData.slides && Array.isArray(processedData.slides)) {
      // Process slides to store captions with image references
      const processedSlides = processedData.slides.map((slide, _index) => ({
        text: slide.text || '',
        imageIndex: _index, // Reference to the image in the images array
        // Don't store the full base64 image data, just the caption and reference
      }));
      
      processedData.slides = JSON.stringify(processedSlides);
    }
    
    // Convert tags array to string if it exists
    if (processedData.tags && Array.isArray(processedData.tags)) {
      processedData.tags = JSON.stringify(processedData.tags);
    }
    
    // Convert context object to string if it exists
    if (processedData.context && typeof processedData.context === 'object') {
      processedData.context = JSON.stringify(processedData.context);
    }
    
    // Convert details object to string if it exists
    if (processedData.details && typeof processedData.details === 'object') {
      processedData.details = JSON.stringify(processedData.details);
    }
    
    return processedData;
  }
}

// Create and export a singleton instance
export const databaseService = new AppwriteDatabaseService();