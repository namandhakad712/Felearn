import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import LoadingSpinner from './LoadingSpinner';

// Lazy load components for better performance
const AuthPage = lazy(() => import('../pages/AuthPage'));
const EmailVerificationPage = lazy(() => import('../pages/EmailVerificationPage'));
const OAuthCallbackPage = lazy(() => import('../pages/OAuthCallbackPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const OnboardingPage = lazy(() => import('../pages/OnboardingPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));

function AppRoutes() {
  const { isLoading } = useAuth();

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
        <Route path="/auth/:type" element={<AuthPage />} />
        <Route path="/auth/verify" element={<EmailVerificationPage />} />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/test-oauth" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">OAuth Test Page</h1>
              <p className="text-gray-600">If you can see this, the React app is working!</p>
              <p className="text-sm text-gray-500 mt-2">URL: {window.location.href}</p>
            </div>
          </div>
        } />
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
        {/* Redirect root to auth since landing page is handled by index.html */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;