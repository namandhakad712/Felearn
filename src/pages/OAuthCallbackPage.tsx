import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/services/auth';

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Starting OAuth callback handling...');
        console.log('📍 Current URL:', window.location.href);
        console.log('📍 URL hash:', window.location.hash);
        console.log('📍 URL pathname:', window.location.pathname);
        console.log('📍 URL search:', window.location.search);
        
        const authService = new AuthService();
        
        // Check if we have a user before handling callback
        try {
          const currentUser = await authService.getCurrentUser();
          console.log('👤 Current user before callback:', currentUser ? 'Found' : 'Not found');
          if (currentUser) {
            console.log('👤 User details:', {
              id: currentUser.$id,
              email: currentUser.email,
              name: currentUser.name,
              emailVerification: currentUser.emailVerification
            });
          }
        } catch (userError) {
          console.log('❌ Error getting current user:', userError);
        }
        
        const result = await authService.handleOAuthCallback();
        console.log('✅ OAuth callback result:', result);
        
        if (result.success) {
          console.log('🔄 Refreshing user data...');
        await refreshUser(); // Refresh user data with merged database info
          console.log('✅ User refreshed, navigating to dashboard...');
        navigate('/dashboard');
        } else {
          throw new Error(result.message || 'OAuth authentication failed');
        }
      } catch (error: any) {
        console.error('❌ OAuth callback error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          type: error.type,
          stack: error.stack
        });
        setError(error.message || 'OAuth authentication failed');
        setTimeout(() => {
          console.log('🔄 Redirecting to login due to error...');
          navigate('/auth/login');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [navigate, refreshUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign in...</h2>
          <p className="text-gray-600">Please wait while we set up your account.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallbackPage;