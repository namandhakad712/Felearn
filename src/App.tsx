import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
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

  // Debug logging
  React.useEffect(() => {
    console.log('🛡️ ProtectedRoute state:', {
      isAuthenticated,
      isLoading,
      user: user ? { id: user.$id, email: user.email } : null,
      checkingOnboarding,
      needsOnboarding,
      currentPath: window.location.pathname
    });
  }, [isAuthenticated, isLoading, user, checkingOnboarding, needsOnboarding]);

  React.useEffect(() => {
    const checkOnboardingStatus = async () => {
      console.log('🔍 Checking onboarding status for user:', user?.$id);
      
      if (user && isAuthenticated) {
        try {
          // Import here to avoid circular dependency
          const { databaseService } = await import('@/services/database');
          const userDoc = await databaseService.getUserDocument(user.$id);
          
          // User document retrieved
          
          if (!userDoc) {
            // User document doesn't exist, create it and require onboarding
            // User document not found, creating and requiring onboarding
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
              console.log('✅ User document created');
            } catch (createError) {
              console.error('❌ Failed to create user document:', createError);
            }
            setNeedsOnboarding(true);
          } else if (!userDoc.onboardingcompleted) {
            console.log('⚠️ User needs onboarding (onboardingcompleted: false)');
            setNeedsOnboarding(true);
          } else {
            console.log('✅ User onboarding completed');
            setNeedsOnboarding(false);
          }
        } catch (error) {
          console.error('❌ Error checking onboarding status:', error);
          // If we can't check, assume onboarding is needed
          setNeedsOnboarding(true);
        }
      }
      setCheckingOnboarding(false);
    };

    if (isAuthenticated && user) {
      checkOnboardingStatus();
    } else {
      console.log('⏳ Waiting for authentication or user data');
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
  // For HashRouter, check the hash instead of pathname
  const currentPath = window.location.pathname;
  const currentHash = window.location.hash;
  const isOnOnboardingPage = currentHash.includes('/onboarding');
  
  console.log('🔄 Redirect check:', {
    needsOnboarding,
    currentPath,
    currentHash,
    isOnOnboardingPage,
    shouldRedirect: needsOnboarding && !isOnOnboardingPage
  });
  
  if (needsOnboarding && !isOnOnboardingPage) {
    console.log('🔄 Redirecting to onboarding...');
    console.log('🔄 Current URL:', window.location.href);
    console.log('🔄 Current hash:', window.location.hash);
    return <Navigate to="/onboarding" replace />;
  }

  console.log('✅ Rendering protected content for path:', currentPath, 'hash:', currentHash);
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

          {/* Catch all route - redirect to login */}
          <Route
            path="*"
            element={<Navigate to="/auth/login" replace />}
          />
        </Routes>
        </AuthProvider>
      </ThemeProvider>
      <Analytics />
      <SpeedInsights />
    </Router>
  );
};

export default App;