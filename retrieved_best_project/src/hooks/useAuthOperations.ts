import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthErrorHandler } from '../utils/authErrorHandler';
import { AuthErrorDisplay, ErrorDisplayData } from '../utils/authErrorDisplay';

/**
 * Hook for login operations
 * This provides a convenient way to handle login with loading and error states
 * 
 * @returns Login function, loading state, and error state
 */
export const useLogin = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorDisplayData | null>(null);
  
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await login(email, password);
      return true;
    } catch (err) {
      const errorDisplayData = AuthErrorDisplay.getErrorDisplayData(err, 'login');
      setError(errorDisplayData);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    login: handleLogin,
    isLoading,
    error,
  };
};

/**
 * Hook for registration operations
 * This provides a convenient way to handle registration with loading and error states
 * 
 * @returns Registration function, loading state, and error state
 */
export const useRegister = () => {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorDisplayData | null>(null);
  
  const handleRegister = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await register(email, password);
      return true;
    } catch (err) {
      const errorDisplayData = AuthErrorDisplay.getErrorDisplayData(err, 'registration');
      setError(errorDisplayData);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    register: handleRegister,
    isLoading,
    error,
  };
};

/**
 * Hook for logout operations
 * This provides a convenient way to handle logout with loading and error states
 * 
 * @returns Logout function, loading state, and error state
 */
export const useLogout = () => {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorDisplayData | null>(null);
  
  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await logout();
      return true;
    } catch (err) {
      const errorDisplayData = AuthErrorDisplay.getErrorDisplayData(err, 'logout');
      setError(errorDisplayData);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    logout: handleLogout,
    isLoading,
    error,
  };
};

/**
 * Hook for password reset operations
 * This provides a convenient way to handle password reset with loading and error states
 * 
 * @returns Password reset function, loading state, and error state
 */
export const usePasswordReset = () => {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorDisplayData | null>(null);
  
  const handlePasswordReset = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await resetPassword(email);
      return true;
    } catch (err) {
      const errorDisplayData = AuthErrorDisplay.getErrorDisplayData(err, 'password_reset');
      setError(errorDisplayData);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    resetPassword: handlePasswordReset,
    isLoading,
    error,
  };
};

/**
 * Hook for user profile update operations
 * This provides a convenient way to handle profile updates with loading and error states
 * 
 * @returns Profile update function, loading state, and error state
 */
export const useUpdateProfile = () => {
  const { updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorDisplayData | null>(null);
  
  const handleUpdateProfile = async (userData: Partial<any>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await updateUser(userData);
      return true;
    } catch (err) {
      const errorDisplayData = AuthErrorDisplay.getErrorDisplayData(err, 'profile_update');
      setError(errorDisplayData);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    updateProfile: handleUpdateProfile,
    isLoading,
    error,
  };
};

export default {
  useLogin,
  useRegister,
  useLogout,
  usePasswordReset,
  useUpdateProfile,
};