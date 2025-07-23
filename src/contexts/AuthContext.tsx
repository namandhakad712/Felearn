import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authService, authStateManager, userService } from '../services';

// Define the context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<{ success: boolean; message: string; requiresVerification?: boolean }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithOAuth: (provider: string) => void;
  updateUser: (userData: Partial<User>) => Promise<User>;
  verifyEmail: (userId: string, secret: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => { throw new Error('Not implemented'); },
  register: async () => { throw new Error('Not implemented'); },
  logout: async () => { throw new Error('Not implemented'); },
  resetPassword: async () => { throw new Error('Not implemented'); },
  loginWithOAuth: () => { throw new Error('Not implemented'); },
  updateUser: async () => { throw new Error('Not implemented'); },
  verifyEmail: async () => { throw new Error('Not implemented'); },
  resendVerificationEmail: async () => { throw new Error('Not implemented'); },
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize the auth state manager
        await authStateManager.initialize();
        
        // Set initial user state
        setUser(authStateManager.getCurrentUser());
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    initialize();

    // Set up listener for auth state changes
    const unsubscribe = authStateManager.addAuthStateListener((newUser) => {
      setUser(newUser);
    });

    // Clean up listener on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Authentication methods
  const login = async (email: string, password: string): Promise<User> => {
    const user = await authService.login(email, password);
    await authStateManager.updateAuthState(user);
    return user;
  };

  const register = async (email: string, password: string): Promise<{ success: boolean; message: string; requiresVerification?: boolean }> => {
    const result = await authService.register(email, password);
    // Don't update auth state yet - user needs to verify email first
    return result;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    await authStateManager.updateAuthState(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    await authService.resetPassword(email);
  };

  // OAuth login method
  const loginWithOAuth = (provider: string): void => {
    authService.loginWithOAuth(provider);
  };

  // Email verification methods
  const verifyEmail = async (userId: string, secret: string): Promise<void> => {
    await authService.verifyEmail(userId, secret);
  };

  const resendVerificationEmail = async (): Promise<void> => {
    await authService.resendVerificationEmail();
  };

  // Update user method
  const updateUser = async (userData: Partial<User>): Promise<User> => {
    if (!user || !user.$id) {
      throw new Error('No authenticated user');
    }
    
    try {
      // Try to update the user document
      const updatedUser = await userService.updateUser(user.$id, userData);
      await authStateManager.updateAuthState(updatedUser);
      return updatedUser;
    } catch (error: any) {
      // If the document doesn't exist, create it
      if (error.message && (
          error.message.includes('not found') || 
          error.message.includes('could not be found')
      )) {
        console.log('User document not found, creating a new one...');
        
        // Create a new user document with the provided data and basic user info
        const newUserData: Partial<User> = {
          ...userData,
          $id: user.$id,
          email: user.email || '',
          name: user.name || user.email?.split('@')[0] || '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        
        // If settings are being updated, ensure they have default values
        if (userData.settings) {
          newUserData.settings = {
            theme: 'light',
            language: 'en',
            onboardingCompleted: false,
            ...userData.settings
          };
        }
        
        try {
          // Create the user document
          const createdUser = await userService.createUser(
            user.$id, 
            newUserData.email || '', 
            newUserData.name
          );
          
          // If there are additional fields to update beyond what createUser handles
          if (Object.keys(userData).some(key => key !== 'email' && key !== 'name')) {
            // Update with the remaining fields
            const finalUser = await userService.updateUser(user.$id, userData);
            await authStateManager.updateAuthState(finalUser);
            return finalUser;
          }
          
          await authStateManager.updateAuthState(createdUser);
          return createdUser;
        } catch (createError: any) {
          console.error('Error creating user document:', createError);
          
          // Return a mock user with the updated data as a fallback
          const mockUser: User = {
            ...user,
            ...userData,
            $id: user.$id,
            email: user.email || '',
            name: user.name || user.email?.split('@')[0] || '',
            settings: {
              theme: 'light',
              language: 'en',
              onboardingCompleted: true,
              ...(userData.settings || {})
            }
          };
          
          await authStateManager.updateAuthState(mockUser);
          return mockUser;
        }
      }
      
      // For other errors, rethrow
      throw error;
    }
  };

  // Context value
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    resetPassword,
    loginWithOAuth,
    updateUser,
    verifyEmail,
    resendVerificationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};