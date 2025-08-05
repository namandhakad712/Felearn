import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
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
    console.log('🚀 User needs onboarding, redirecting to onboarding page');
    console.log('🔍 User onboarding status:', user.onboardingcompleted);
    console.log('🔍 Full user object:', user);
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // Render children if authenticated and onboarded
  return <>{children}</>;
};

export default ProtectedRoute;