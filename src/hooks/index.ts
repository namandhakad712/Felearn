// Re-export all hooks
import useAuthFix from './useAuthFix';
export const useAuth = useAuthFix;

// Import hooks directly to avoid circular dependencies
import useAuthState, { 
  useAuthStateWithLoading, 
  useUserProfile, 
  useHasRole 
} from './useAuthState';
export { 
  useAuthState, 
  useAuthStateWithLoading, 
  useUserProfile, 
  useHasRole 
};

import { 
  useLogin, 
  useRegister, 
  useLogout, 
  usePasswordReset, 
  useUpdateProfile 
} from './useAuthOperations';
export { 
  useLogin, 
  useRegister, 
  useLogout, 
  usePasswordReset, 
  useUpdateProfile 
};

// Create a mock useAuthPersistence hook to prevent import errors
export const useAuthPersistence = () => ({
  persistenceType: 'LOCAL',
  setPersistence: async () => true,
  setAuthPersistence: async () => true,
  isLoading: false,
  error: null
});

import { 
  useAuthSession, 
  useSessionExpiryWarning 
} from './useAuthSession';
export { 
  useAuthSession, 
  useSessionExpiryWarning 
};

import { useColorScheme } from './useColorScheme';
export { useColorScheme };

import { useStories } from './useStories';
export { useStories };

// Create a mock useToast hook to prevent import errors
export const useToast = () => {
  return {
    success: (title: string, message?: string, duration?: number) => {
      console.log('Toast Success:', title, message);
      alert(`${title}${message ? `\n${message}` : ''}`);
    },
    error: (title: string, message?: string, duration?: number) => {
      console.error('Toast Error:', title, message);
      alert(`Error: ${title}${message ? `\n${message}` : ''}`);
    },
    info: (title: string, message?: string, duration?: number) => {
      console.info('Toast Info:', title, message);
      alert(`Info: ${title}${message ? `\n${message}` : ''}`);
    },
    warning: (title: string, message?: string, duration?: number) => {
      console.warn('Toast Warning:', title, message);
      alert(`Warning: ${title}${message ? `\n${message}` : ''}`);
    },
    toasts: [],
    removeToast: (id: string) => {}
  };
};

// Export a default object with all hooks
const hooks = {
  useAuth,
  useAuthState,
  useAuthStateWithLoading,
  useUserProfile,
  useHasRole,
  useLogin,
  useRegister,
  useLogout,
  usePasswordReset,
  useUpdateProfile,
  useAuthPersistence,
  useAuthSession,
  useSessionExpiryWarning,
  useColorScheme,
  useStories,
  useToast,
};

export default hooks;