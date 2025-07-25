import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '../services/authService';
import { authStateManager } from '../services/authStateManager';
import { User } from '../types';

// Mock the appwriteService that authService depends on
vi.mock('../services/appwrite', () => {
  const mockUser = {
    $id: 'test-user-id',
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
  
  return {
    appwriteService: {
      register: vi.fn().mockResolvedValue(mockUser),
      login: vi.fn().mockResolvedValue({ userId: 'test-user-id' }),
      logout: vi.fn().mockResolvedValue({}),
      resetPassword: vi.fn().mockResolvedValue({}),
      getCurrentUser: vi.fn().mockResolvedValue(mockUser),
      createUserDocument: vi.fn().mockResolvedValue(mockUser),
      getUserDocument: vi.fn().mockResolvedValue(mockUser),
      updateUser: vi.fn().mockImplementation((data) => Promise.resolve({ ...mockUser, ...data })),
      deleteUser: vi.fn().mockResolvedValue(true),
    },
  };
});

// Mock authStateManager
vi.mock('../services/authStateManager', () => {
  return {
    authStateManager: {
      initialize: vi.fn().mockResolvedValue({}),
      getCurrentUser: vi.fn(),
      isAuthenticated: vi.fn(),
      updateAuthState: vi.fn().mockResolvedValue({}),
      addAuthStateListener: vi.fn().mockReturnValue(() => {}),
    },
  };
});

describe('Authentication Flow Integration Tests', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    vi.mocked(authStateManager.getCurrentUser).mockReturnValue(null);
    vi.mocked(authStateManager.isAuthenticated).mockReturnValue(false);
  });

  describe('Registration Flow', () => {
    it('should register a new user and update auth state', async () => {
      const email = 'newuser@example.com';
      const password = 'SecurePassword123!';
      
      const user = await authService.register(email, password);
      
      // Check that appwriteService.register was called with correct params
      const { appwriteService } = await import('../services/appwrite');
      expect(appwriteService.register).toHaveBeenCalledWith(email, password);
      
      // Check that login was called after registration
      expect(appwriteService.login).toHaveBeenCalledWith(email, password);
      
      // Check that getCurrentUser was called
      expect(appwriteService.getCurrentUser).toHaveBeenCalled();
      
      // Check that auth state was updated
      expect(authStateManager.updateAuthState).toHaveBeenCalledWith(expect.objectContaining({
        $id: 'test-user-id',
        email: 'test@example.com',
      }));
      
      // Check that the user was returned
      expect(user).toEqual(expect.objectContaining({
        $id: 'test-user-id',
        email: 'test@example.com',
      }));
    });
    
    it('should throw an error if registration fails', async () => {
      const email = 'existing@example.com';
      const password = 'SecurePassword123!';
      
      // Mock registration to fail
      const { appwriteService } = await import('../services/appwrite');
      vi.mocked(appwriteService.register).mockRejectedValueOnce(new Error('Email already exists'));
      
      await expect(authService.register(email, password)).rejects.toThrow();
      
      // Check that auth state was not updated
      expect(authStateManager.updateAuthState).not.toHaveBeenCalled();
    });
  });

  describe('Login Flow', () => {
    it('should login a user and update auth state', async () => {
      const email = 'existing@example.com';
      const password = 'SecurePassword123!';
      
      const user = await authService.login(email, password);
      
      // Check that appwriteService.login was called with correct params
      const { appwriteService } = await import('../services/appwrite');
      expect(appwriteService.login).toHaveBeenCalledWith(email, password);
      
      // Check that getCurrentUser was called
      expect(appwriteService.getCurrentUser).toHaveBeenCalled();
      
      // Check that auth state was updated
      expect(authStateManager.updateAuthState).toHaveBeenCalledWith(expect.objectContaining({
        $id: 'test-user-id',
        email: 'test@example.com',
      }));
      
      // Check that the user was returned
      expect(user).toEqual(expect.objectContaining({
        $id: 'test-user-id',
        email: 'test@example.com',
      }));
    });
    
    it('should throw an error if login fails', async () => {
      const email = 'wrong@example.com';
      const password = 'WrongPassword123!';
      
      // Mock login to fail
      const { appwriteService } = await import('../services/appwrite');
      vi.mocked(appwriteService.login).mockRejectedValueOnce(new Error('Invalid credentials'));
      
      await expect(authService.login(email, password)).rejects.toThrow();
      
      // Check that auth state was not updated
      expect(authStateManager.updateAuthState).not.toHaveBeenCalled();
    });
  });

  describe('Logout Flow', () => {
    it('should logout a user and update auth state', async () => {
      // Mock user is authenticated
      vi.mocked(authStateManager.getCurrentUser).mockReturnValue({
        $id: 'test-user-id',
        email: 'test@example.com',
      } as User);
      vi.mocked(authStateManager.isAuthenticated).mockReturnValue(true);
      
      await authService.logout();
      
      // Check that appwriteService.logout was called
      const { appwriteService } = await import('../services/appwrite');
      expect(appwriteService.logout).toHaveBeenCalled();
      
      // Check that auth state was updated to null
      expect(authStateManager.updateAuthState).toHaveBeenCalledWith(null);
    });
    
    it('should throw an error if logout fails', async () => {
      // Mock user is authenticated
      vi.mocked(authStateManager.getCurrentUser).mockReturnValue({
        $id: 'test-user-id',
        email: 'test@example.com',
      } as User);
      vi.mocked(authStateManager.isAuthenticated).mockReturnValue(true);
      
      // Mock logout to fail
      const { appwriteService } = await import('../services/appwrite');
      vi.mocked(appwriteService.logout).mockRejectedValueOnce(new Error('Logout failed'));
      
      await expect(authService.logout()).rejects.toThrow();
    });
  });

  describe('Password Reset Flow', () => {
    it('should send a password reset email', async () => {
      const email = 'reset@example.com';
      
      await authService.resetPassword(email);
      
      // Check that appwriteService.resetPassword was called with correct params
      const { appwriteService } = await import('../services/appwrite');
      expect(appwriteService.resetPassword).toHaveBeenCalledWith(email);
    });
    
    it('should throw an error if password reset fails', async () => {
      const email = 'nonexistent@example.com';
      
      // Mock resetPassword to fail
      const { appwriteService } = await import('../services/appwrite');
      vi.mocked(appwriteService.resetPassword).mockRejectedValueOnce(new Error('User not found'));
      
      await expect(authService.resetPassword(email)).rejects.toThrow();
    });
  });

  describe('Authentication State Persistence', () => {
    it('should get the current user', async () => {
      // Mock user is authenticated
      const mockUser = {
        $id: 'test-user-id',
        email: 'test@example.com',
      } as User;
      vi.mocked(authStateManager.getCurrentUser).mockReturnValue(mockUser);
      
      const user = await authService.getCurrentUser();
      
      expect(user).toEqual(mockUser);
    });
    
    it('should check if user is authenticated', async () => {
      // Mock user is authenticated
      vi.mocked(authStateManager.isAuthenticated).mockReturnValue(true);
      
      const isAuthenticated = await authService.isAuthenticated();
      
      expect(isAuthenticated).toBe(true);
    });
    
    it('should return false if user is not authenticated', async () => {
      // Mock user is not authenticated
      vi.mocked(authStateManager.isAuthenticated).mockReturnValue(false);
      
      const isAuthenticated = await authService.isAuthenticated();
      
      expect(isAuthenticated).toBe(false);
    });
  });
});