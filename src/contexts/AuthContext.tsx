import React, { createContext, useContext, useState, useEffect } from 'react';
// import { Models } from 'appwrite'; // Unused import
import { authService, AuthResponse } from '@/services/auth';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  completePasswordReset: (userId: string, secret: string, password: string) => Promise<AuthResponse>;
  updatePassword: (newPassword: string, oldPassword: string) => Promise<AuthResponse>;
  createOAuthSession: (provider: string) => Promise<void>;
  refreshUser: () => Promise<User | null>;
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
  refreshUser: async () => null,
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    console.log('🔄 refreshUser called');
    try {
      const currentUser = await authService.getCurrentUser();
      console.log('🔄 User authenticated successfully');
      if (currentUser) {
        // Merge with database user document
        try {
          console.log('🔍 Fetching user document from database...');
          const { databaseService } = await import('@/services/database');
          const userDoc = await databaseService.getUserDocument(currentUser.$id);
          
          console.log('🔍 User document retrieved successfully');
          
          if (userDoc) {
            // Check if email verification status needs to be synced
            if (currentUser.emailVerification !== userDoc.emailVerification) {
              console.log('🔄 Email verification status mismatch - syncing database');
              console.log('🔄 Auth emailVerification:', currentUser.emailVerification);
              console.log('🔄 DB emailVerification:', userDoc.emailVerification);
              
              try {
                const { databaseService: dbService } = await import('@/services/database');
                await dbService.updateUserDocument(currentUser.$id, {
                  emailVerification: currentUser.emailVerification
                });
                console.log('✅ Email verification status synced to database');
                
                // Update the userDoc for merging
                userDoc.emailVerification = currentUser.emailVerification;
              } catch (syncError) {
                console.error('❌ Failed to sync email verification status:', syncError);
              }
            }
            
            // Merge auth user with database document
            const mergedUser = {
              ...currentUser,
              geminiKey: userDoc.geminiKey,
              name: userDoc.name,
              bio: userDoc.bio,
              isAdmin: userDoc.isAdmin,
              settings: userDoc.settings,
              onboardingcompleted: userDoc.onboardingcompleted,
              lastLogin: userDoc.lastLogin,
              emailVerification: currentUser.emailVerification // Use auth system as source of truth
            };
            console.log('✅ Successfully merged user data:', mergedUser);
            console.log('✅ Onboarding status from DB:', userDoc.onboardingcompleted);
            console.log('✅ Email verification status:', mergedUser.emailVerification);
            setUser(mergedUser as any);
            return mergedUser;
          } else {
                    console.log('❌ No user document found in database');
          }
        } catch (dbError) {
          console.error('❌ Error fetching user document:', dbError);
          console.error('❌ This means the user object will not have database fields like onboardingcompleted');
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
        console.log('🔄 Login successful, refreshing user data to get database fields...');
        // Don't just set the auth user - refresh to get database data merged
        await refreshUser();
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
        console.log('🔄 Registration successful, refreshing user data to get database fields...');
        // Don't just set the auth user - refresh to get database data merged
        await refreshUser();
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
              console.log('🔄 Updating user data...');
      await authService.updateUser(data);
      
      // Always refresh user data to get the latest from database
      const updatedUser = await refreshUser();
      console.log('🔄 User data refreshed successfully');
      
      // Also update local state immediately for better UX
      if (user) {
        const newUserState = {
          ...user,
          ...data
        } as any;
        console.log('🔄 User state updated locally');
        setUser(newUserState);
      }
    } catch (error) {
      console.error('Failed to update user data');
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