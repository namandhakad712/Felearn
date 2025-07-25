import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * Hook for accessing authentication state and methods
 * This is a wrapper around the AuthContext that provides type safety and convenience
 * 
 * @returns Authentication state and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;