import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';
import LoadingSpinner from './LoadingSpinner';
import LandingPage from '../pages/LandingPage';

// Lazy load components for better performance
const AuthPage = lazy(() => import('../pages/AuthPage'));
const EmailVerificationPage = lazy(() => import('../pages/EmailVerificationPage'));
const OnboardingPage = lazy(() => import('../pages/OnboardingPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading page..." />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/:type" element={<AuthPage />} />
        <Route path="/auth/verify" element={<EmailVerificationPage />} />
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        {/* Removed admin routes as these components were deleted */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;