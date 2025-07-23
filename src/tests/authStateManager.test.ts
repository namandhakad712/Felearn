import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authStateManager } from '../services/authStateManager';
import { authService } from '../services/authService';
import { User } from '../types';

// Mock authService
vi.mock('../services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('Auth State Manager', () => {
  const mockUser: User = {
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

  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize and restore session if valid', async () => {
      // Mock authService to return a user
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);
      
      await authStateManager.initialize();
      
      // Check that getCurrentUser was called
      expect(authService.getCurrentUser).toHaveBeenCalled();
      
      // Check that the current user is set
      expect(authStateManager.getCurrentUser()).toEqual(mockUser);
      
      // Check that isAuthenticated returns true
      expect(authStateManager.isAuthenticated()).toBe(true);
    });
    
    it('should initialize with no user if session is invalid', async () => {
      // Mock authService to return null
      vi.mocked(authService.getCurrentUser).mockResolvedValue(null);
      
      await authStateManager.initialize();
      
      // Check that getCurrentUser was called
      expect(authService.getCurrentUser).toHaveBeenCalled();
      
      // Check that the current user is null
      expect(authStateManager.getCurrentUser()).toBeNull();
      
      // Check that isAuthenticated returns false
      expect(authStateManager.isAuthenticated()).toBe(false);
    });
  });

  describe('Auth State Management', () => {
    it('should update auth state and notify listeners', async () => {
      // Create a mock listener
      const listener = vi.fn();
      
      // Add the listener
      const unsubscribe = authStateManager.addAuthStateListener(listener);
      
      // Update auth state
      await authStateManager.updateAuthState(mockUser);
      
      // Check that the listener was called with the user
      expect(listener).toHaveBeenCalledWith(mockUser);
      
      // Check that the current user is set
      expect(authStateManager.getCurrentUser()).toEqual(mockUser);
      
      // Check that isAuthenticated returns true
      expect(authStateManager.isAuthenticated()).toBe(true);
      
      // Check that session was saved
      expect(mockSessionStorage.setItem).toHaveBeenCalled();
      
      // Unsubscribe the listener
      unsubscribe();
      
      // Update auth state again
      await authStateManager.updateAuthState(null);
      
      // Check that the listener was not called again
      expect(listener).toHaveBeenCalledTimes(2);
      
      // Check that the current user is null
      expect(authStateManager.getCurrentUser()).toBeNull();
      
      // Check that isAuthenticated returns false
      expect(authStateManager.isAuthenticated()).toBe(false);
      
      // Check that session was cleared
      expect(mockSessionStorage.removeItem).toHaveBeenCalled();
    });
    
    it('should not update auth state if user has not changed', async () => {
      // Create a mock listener
      const listener = vi.fn();
      
      // Add the listener
      authStateManager.addAuthStateListener(listener);
      
      // Update auth state
      await authStateManager.updateAuthState(mockUser);
      
      // Check that the listener was called with the user
      expect(listener).toHaveBeenCalledWith(mockUser);
      
      // Reset the mock
      listener.mockReset();
      
      // Update auth state with the same user
      await authStateManager.updateAuthState({ ...mockUser });
      
      // Check that the listener was not called again
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Session Management', () => {
    it('should restore session from storage', async () => {
      // Mock session storage
      const sessionData = {
        $id: 'test-user-id',
        email: 'test@example.com',
      };
      const expiryTime = Date.now() + 3600000; // 1 hour from now
      
      mockSessionStorage.getItem.mockImplementation((key: string) => {
        if (key === 'auth_session') {
          return JSON.stringify(sessionData);
        } else if (key === 'auth_session_expiry') {
          return expiryTime.toString();
        }
        return null;
      });
      
      // Mock authService to return a user
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);
      
      await authStateManager.initialize();
      
      // Check that getCurrentUser was called
      expect(authService.getCurrentUser).toHaveBeenCalled();
      
      // Check that the current user is set
      expect(authStateManager.getCurrentUser()).toEqual(mockUser);
    });
    
    it('should clear expired session', async () => {
      // Mock expired session storage
      const sessionData = {
        $id: 'test-user-id',
        email: 'test@example.com',
      };
      const expiryTime = Date.now() - 3600000; // 1 hour ago
      
      mockSessionStorage.getItem.mockImplementation((key: string) => {
        if (key === 'auth_session') {
          return JSON.stringify(sessionData);
        } else if (key === 'auth_session_expiry') {
          return expiryTime.toString();
        }
        return null;
      });
      
      // Mock authService to return null
      vi.mocked(authService.getCurrentUser).mockResolvedValue(null);
      
      await authStateManager.initialize();
      
      // Check that session was cleared
      expect(mockSessionStorage.removeItem).toHaveBeenCalled();
      
      // Check that the current user is null
      expect(authStateManager.getCurrentUser()).toBeNull();
    });
  });
});