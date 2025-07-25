import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AuthPage from '@/pages/AuthPage';
import EmailVerificationPage from '@/pages/EmailVerificationPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import OnboardingPage from '@/pages/OnboardingPage';
import OAuthCallbackPage from '@/pages/OAuthCallbackPage';
import DashboardPage from '@/pages/DashboardPage';
import { useAuth } from '@/contexts/AuthContext';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = React.useState(true);
  const [needsOnboarding, setNeedsOnboarding] = React.useState(false);

  React.useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user && isAuthenticated) {
        try {
          // Import here to avoid circular dependency
          const { databaseService } = await import('@/services/database');
          const userDoc = await databaseService.getUserDocument(user.$id);
          
          if (!userDoc) {
            // User document doesn't exist, create it and require onboarding
            console.log('User document not found, creating and requiring onboarding');
            try {
              const { extractNameFromEmail } = await import('@/utils/userUtils');
              await databaseService.createUserDocument(user.$id, {
                email: user.email,
                name: extractNameFromEmail(user.email),
                geminiKey: '',
                lastLogin: new Date().toISOString(),
                isAdmin: false,
                createdAt: new Date().toISOString(),
                emailVerification: user.emailVerification || false,
                disabled: false,
                onboardingcompleted: false
              });
            } catch (createError) {
              console.error('Failed to create user document:', createError);
            }
            setNeedsOnboarding(true);
          } else if (!userDoc.onboardingcompleted) {
            setNeedsOnboarding(true);
          } else {
            setNeedsOnboarding(false);
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // If we can't check, assume onboarding is needed
          setNeedsOnboarding(true);
        }
      }
      setCheckingOnboarding(false);
    };

    if (isAuthenticated && user) {
      checkOnboardingStatus();
    } else {
      setCheckingOnboarding(false);
    }
  }, [user, isAuthenticated]);

  if (isLoading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check if user needs onboarding (only for non-onboarding routes)
  if (needsOnboarding && !window.location.pathname.includes('/onboarding')) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// Public Route component (redirects to dashboard if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/auth/login"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />
          <Route
            path="/auth/register"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />
          <Route
            path="/auth/verify"
            element={
              <PublicRoute>
                <EmailVerificationPage />
              </PublicRoute>
            }
          />
          <Route
            path="/auth/reset-password"
            element={<ResetPasswordPage />}
          />
          <Route
            path="/auth/callback"
            element={<OAuthCallbackPage />}
          />

          {/* Onboarding Route - Protected */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to login */}
          <Route
            path="/"
            element={<Navigate to="/auth/login" replace />}
          />

          {/* Catch all route - redirect to login */}
          <Route
            path="*"
            element={<Navigate to="/auth/login" replace />}
          />
        </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;