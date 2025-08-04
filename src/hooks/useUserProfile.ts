import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';

/**
 * Hook for user profile operations
 * This provides a convenient way to handle user profile operations
 * 
 * @returns User profile functions and state
 */
export const useUserProfile = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * Update the user profile
   * @param userData User data to update
   * @returns Promise indicating success
   */
  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await updateUser(userData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Profile update failed'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Delete the user account
   * @returns Promise indicating success
   */
  const deleteUserAccount = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implement account deletion when the method is available
      throw new Error('Account deletion not implemented');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Account deletion failed'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    user,
    updateProfile,
    deleteUserAccount,
    isLoading,
    error
  };
};