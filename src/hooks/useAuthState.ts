import { useState, useEffect } from 'react';
import useAuthFix from './useAuthFix';
import { User } from '../types';

const useAuth = useAuthFix;

/**
 * Hook for accessing only the authentication state
 * This is useful when you only need to know if a user is authenticated
 * 
 * @returns Authentication state
 */
export const useAuthState = () => {
  const { user, isLoading } = useAuth();
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
};

/**
 * Hook for accessing authentication state with a loading state
 * This is useful when you need to show a loading indicator while authentication is being checked
 * 
 * @returns Authentication state with loading state
 */
export const useAuthStateWithLoading = () => {
  const { user, isLoading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    if (!isLoading) {
      // Once the initial loading is done, set initializing to false
      setIsInitializing(false);
    }
  }, [isLoading]);
  
  return {
    user,
    isLoading: isLoading || isInitializing,
    isInitialized: !isInitializing,
    isAuthenticated: !!user,
  };
};

/**
 * Hook for accessing user profile data
 * This is useful when you only need the user's profile data
 * 
 * @returns User profile data
 */
export const useUserProfile = () => {
  const { user } = useAuth();
  
  return user;
};

/**
 * Hook for checking if the current user has specific roles or permissions
 * 
 * @param requiredRoles - Roles to check for (optional)
 * @returns Boolean indicating if the user has the required roles
 */
export const useHasRole = (requiredRoles?: string[]) => {
  const { user } = useAuth();
  
  if (!user || !requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  
  // Check if the user is an admin (has all roles)
  if (user.isAdmin) {
    return true;
  }
  
  // For now, we don't have a roles system, so we'll just check if the user is authenticated
  return !!user;
};

export default useAuthState;