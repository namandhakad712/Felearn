import React, { createContext, useContext, useState, useEffect } from 'react';
import { Models } from 'appwrite';
import { AuthService, AuthResponse } from '@/services/auth';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  completePasswordReset: (userId: string, secret: string, password: string) => Promise<AuthResponse>;
  updatePassword: (newPassword: string, oldPassword: string) => Promise<AuthResponse>;
  createOAuthSession: (provider: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: any) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ success: false, message: 'AuthContext not initialized' }),
  register: async () => ({ success: false, message: 'AuthContext not initialized' }),
  logout: async () => {},
  resetPassword: async () => ({ success: false, message: 'AuthContext not initialized' }),
  completePasswordReset: async () => ({ success: false, message: 'AuthContext not initialized' }),
  updatePassword: async () => ({ success: false, message: 'AuthContext not initialized' }),
  createOAuthSession: async () => { throw new Error('AuthContext not initialized'); },
  refreshUser: async () => {},
  updateUser: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authService = new AuthService();

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        // Merge with database user document
        try {
          const { databaseService } = await import('@/services/database');
          const userDoc = await databaseService.getUserDocument(currentUser.$id);
          
          if (userDoc) {
            // Merge auth user with database document
            const mergedUser = {
              ...currentUser,
              geminiKey: userDoc.geminiKey,
              name: userDoc.name,
              bio: userDoc.bio,
              isAdmin: userDoc.isAdmin,
              settings: userDoc.settings,
              onboardingcompleted: userDoc.onboardingcompleted,
              lastLogin: userDoc.lastLogin
            };
            setUser(mergedUser as any);
            return mergedUser;
          }
        } catch (dbError) {
          console.error('Error fetching user document:', dbError);
        }
      }
      
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await authService.login(email, password);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } catch (error: any) {
      // Re-throw the error so AuthPage can handle auto-registration
      throw error;
    }
  };

  const register = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await authService.register(email, password);
      if (response.success && !response.requiresVerification) {
        setUser(response.user || null);
      }
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      // Redirect to main website after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    return await authService.resetPassword(email);
  };

  const completePasswordReset = async (userId: string, secret: string, password: string): Promise<AuthResponse> => {
    return await authService.completePasswordReset(userId, secret, password);
  };

  const updatePassword = async (newPassword: string, oldPassword: string): Promise<AuthResponse> => {
    return await authService.updatePassword(newPassword, oldPassword);
  };

  const createOAuthSession = async (provider: string) => {
    return await authService.createOAuthSession(provider);
  };

  const updateUser = async (data: any) => {
    try {
      await authService.updateUser(data);
      // Only refresh user if not during onboarding to prevent step reset
      if (!data.onboardingcompleted) {
        await refreshUser(); // Refresh merged user data after update
      } else {
        // For onboarding completion, just update the user state directly
        if (user) {
          setUser({
            ...user,
            ...data
          } as any);
        }
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    resetPassword,
    completePasswordReset,
    updatePassword,
    createOAuthSession,
    refreshUser,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};