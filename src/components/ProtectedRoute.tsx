import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getOnboardingSession } from '@/utils/onboardingUtils';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireOnboarding?: boolean;
}

/**
 * Protected Route Component
 * Redirects to login page if user is not authenticated
 * Redirects to onboarding if user hasn't completed onboarding
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/auth/login',
  requireOnboarding = true,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check email verification for email/password users
  if (user && !user.emailVerification) {
    console.log('🚫 User email not verified, redirecting to login');
    return <Navigate to="/auth/login" state={{ from: location, needsVerification: true }} replace />;
  }

  // Check onboarding completion (skip for onboarding page itself)
  if (requireOnboarding && user && !user.onboardingcompleted && location.pathname !== '/onboarding') {
    // Check if there's an active onboarding session
    const onboardingSession = getOnboardingSession();
    
    if (onboardingSession) {
      // If session is completed, update user state and continue
      if (onboardingSession.completed) {
        console.log('✅ Onboarding session completed, updating user state...');
        // The user state will be updated by the onboarding page
        return <Navigate to="/onboarding" state={{ from: location }} replace />;
      }
    }
    
    console.log('🚀 User needs onboarding, redirecting to onboarding page');
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // Render children if authenticated and onboarded
  return <>{children}</>;
};

export default ProtectedRoute;