import { describe, it, expect } from 'vitest';
import DataTransformation from '../dataTransformation';
import { User, Story } from '../../types';

describe('Data Transformation Utilities', () => {
  describe('User Data Validation', () => {
    it('should validate and transform user data', () => {
      const userData: Partial<User> = {
        email: 'test@example.com',
      };
      
      const validatedData = DataTransformation.validateUserData(userData);
      
      expect(validatedData).toEqual(expect.objectContaining({
        email: 'test@example.com',
        name: 'test', // Default name from email
        createdAt: expect.any(String),
        lastLogin: expect.any(String),
        settings: expect.objectContaining({
          theme: 'light',
          language: 'en',
          onboardingCompleted: false,
        }),
        geminiKey: '',
      }));
    });
    
    it('should throw an error if email is missing', () => {
      const userData: Partial<User> = {
        name: 'Test User',
      };
      
      expect(() => DataTransformation.validateUserData(userData)).toThrow('User email is required');
    });
    
    it('should parse settings from string', () => {
      const userData: Partial<User> = {
        email: 'test@example.com',
        settings: '{"theme":"dark","language":"fr"}',
      } as any;
      
      const validatedData = DataTransformation.validateUserData(userData);
      
      expect(validatedData.settings).toEqual({
        theme: 'dark',
        language: 'fr',
      });
    });
    
    it('should handle invalid settings string', () => {
      const userData: Partial<User> = {
        email: 'test@example.com',
        settings: 'invalid-json',
      } as any;
      
      const validatedData = DataTransformation.validateUserData(userData);
      
      expect(validatedData.settings).toEqual({
        theme: 'light',
        language: 'en',
        onboardingCompleted: false,
      });
    });
  });

  describe('Story Data Validation', () => {
    it('should validate and transform story data', () => {
      const storyData: Partial<Story> = {
        userId: 'user-id',
        title: 'Test Story',
        content: 'Test content',
      };
      
      const validatedData = DataTransformation.validateStoryData(storyData);
      
      expect(validatedData).toEqual(expect.objectContaining({
        userId: 'user-id',
        title: 'Test Story',
        content: 'Test content',
        createdAt: expect.any(String),
        images: [],
        tags: [],
        isPinned: false,
      }));
    });
    
    it('should throw an error if userId is missing', () => {
      const storyData: Partial<Story> = {
        title: 'Test Story',
        content: 'Test content',
      };
      
      expect(() => DataTransformation.validateStoryData(storyData)).toThrow('Story userId is required');
    });
    
    it('should throw an error if title is missing', () => {
      const storyData: Partial<Story> = {
        userId: 'user-id',
        content: 'Test content',
      };
      
      expect(() => DataTransformation.validateStoryData(storyData)).toThrow('Story title is required');
    });
    
    it('should throw an error if content is missing', () => {
      const storyData: Partial<Story> = {
        userId: 'user-id',
        title: 'Test Story',
      };
      
      expect(() => DataTransformation.validateStoryData(storyData)).toThrow('Story content is required');
    });
    
    it('should parse images from string', () => {
      const storyData: Partial<Story> = {
        userId: 'user-id',
        title: 'Test Story',
        content: 'Test content',
        images: '["image1.jpg","image2.jpg"]',
      } as any;
      
      const validatedData = DataTransformation.validateStoryData(storyData);
      
      expect(validatedData.images).toEqual(['image1.jpg', 'image2.jpg']);
    });
    
    it('should handle invalid images string', () => {
      const storyData: Partial<Story> = {
        userId: 'user-id',
        title: 'Test Story',
        content: 'Test content',
        images: 'invalid-json',
      } as any;
      
      const validatedData = DataTransformation.validateStoryData(storyData);
      
      expect(validatedData.images).toEqual([]);
    });
  });

  describe('Firebase Timestamp Conversion', () => {
    it('should convert Firebase timestamp to ISO string', () => {
      // Mock Firebase timestamp
      const timestamp = {
        seconds: 1626912000,
        nanoseconds: 0,
        toDate: () => new Date(1626912000 * 1000),
      };
      
      const result = DataTransformation.convertFirebaseTimestamp(timestamp);
      
      expect(result).toBe(new Date(1626912000 * 1000).toISOString());
    });
    
    it('should handle timestamp as seconds', () => {
      const result = DataTransformation.convertFirebaseTimestamp(1626912000);
      
      expect(result).toBe(new Date(1626912000 * 1000).toISOString());
    });
    
    it('should handle timestamp as string', () => {
      const dateString = '2021-07-22T00:00:00.000Z';
      const result = DataTransformation.convertFirebaseTimestamp(dateString);
      
      expect(result).toBe(dateString);
    });
    
    it('should return current date for undefined timestamp', () => {
      const result = DataTransformation.convertFirebaseTimestamp(undefined);
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('Firebase to Appwrite Conversion', () => {
    it('should convert Firebase data to Appwrite format', () => {
      // Mock Firebase data
      const firebaseData = {
        id: 'doc-id',
        name: 'Test Document',
        createdAt: {
          seconds: 1626912000,
          nanoseconds: 0,
          toDate: () => new Date(1626912000 * 1000),
        },
        _privateField: 'private',
        ref: { /* Firebase reference */ },
        nestedObject: {
          field: 'value',
          timestamp: {
            seconds: 1626912000,
            nanoseconds: 0,
            toDate: () => new Date(1626912000 * 1000),
          },
        },
        array: [
          {
            field: 'value',
            timestamp: {
              seconds: 1626912000,
              nanoseconds: 0,
              toDate: () => new Date(1626912000 * 1000),
            },
          },
        ],
      };
      
      const result = DataTransformation.convertFirebaseToAppwrite(firebaseData);
      
      expect(result).toEqual({
        id: 'doc-id',
        name: 'Test Document',
        createdAt: new Date(1626912000 * 1000).toISOString(),
        nestedObject: {
          field: 'value',
          timestamp: new Date(1626912000 * 1000).toISOString(),
        },
        array: [
          {
            field: 'value',
            timestamp: new Date(1626912000 * 1000).toISOString(),
          },
        ],
      });
      
      // Check that private fields and ref are removed
      expect(result).not.toHaveProperty('_privateField');
      expect(result).not.toHaveProperty('ref');
    });
    
    it('should handle arrays', () => {
      const firebaseArray = [
        {
          id: 'doc-1',
          name: 'Document 1',
        },
        {
          id: 'doc-2',
          name: 'Document 2',
        },
      ];
      
      const result = DataTransformation.convertFirebaseToAppwrite(firebaseArray);
      
      expect(result).toEqual([
        {
          id: 'doc-1',
          name: 'Document 1',
        },
        {
          id: 'doc-2',
          name: 'Document 2',
        },
      ]);
    });
    
    it('should handle primitive values', () => {
      expect(DataTransformation.convertFirebaseToAppwrite('string')).toBe('string');
      expect(DataTransformation.convertFirebaseToAppwrite(123)).toBe(123);
      expect(DataTransformation.convertFirebaseToAppwrite(true)).toBe(true);
      expect(DataTransformation.convertFirebaseToAppwrite(null)).toBe(null);
      expect(DataTransformation.convertFirebaseToAppwrite(undefined)).toBe(undefined);
    });
  });
});