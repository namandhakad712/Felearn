import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/auth';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [isRequestingNew, setIsRequestingNew] = useState(false);

  // Helper function to get parameter from multiple sources
  const getParam = (paramNames: string[]): string | null => {
    // First try React Router search params (hash-based)
    for (const name of paramNames) {
      const value = searchParams.get(name);
      if (value) return value;
    }
    
    // Then try main URL search params (before hash)
    const mainSearch = window.location.search;
    if (mainSearch) {
      const mainParams = new URLSearchParams(mainSearch);
      for (const name of paramNames) {
        const value = mainParams.get(name);
        if (value) return value;
      }
    }
    
    // Then try hash params if available
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const hashSearch = hash.split('?')[1];
      const hashParams = new URLSearchParams(hashSearch);
      for (const name of paramNames) {
        const value = hashParams.get(name);
        if (value) return value;
      }
    }
    
    return null;
  };

  // Get all parameters for debugging
  const reactRouterParams = Object.fromEntries(searchParams.entries());
  const mainUrlParams = new URLSearchParams(window.location.search);
  const allMainParams = Object.fromEntries(mainUrlParams.entries());
  
  // Get verification parameters from URL
  // Appwrite uses different parameter names in verification URLs
  const userId = getParam(['userId', 'user', 'id', 'userID', 'uid']);
  const secret = getParam(['secret', 'token', 'code', 'verification', 'verify']);

  // Handler to request new verification email
  const handleRequestNewVerification = async () => {
    setIsRequestingNew(true);
    try {
      const authService = new AuthService();
      const result = await authService.sendEmailVerification();
      
      if (result.success) {
        setMessage('New verification email sent! Please check your inbox and click the new verification link.');
        setStatus('success');
      } else {
        setMessage(result.message || 'Failed to send verification email. Please try again.');
      }
    } catch (error: any) {
      console.error('Error requesting new verification:', error);
      setMessage('Failed to send verification email. Please try logging in again to request a new verification email.');
    } finally {
      setIsRequestingNew(false);
    }
  };

  useEffect(() => {
    const handleVerification = async () => {
      // Debug: Log all URL parameters
      const fullUrl = window.location.href;
      const hashParams = window.location.hash;
      
      console.log('🔍 Full URL:', fullUrl);
      console.log('🔍 Hash params:', hashParams);
      console.log('🔍 React Router params:', reactRouterParams);
      console.log('🔍 Main URL params:', allMainParams);
      console.log('🔍 Extracted userId:', userId);
      console.log('🔍 Extracted secret:', secret);
      
      // Also try to extract from hash if search params are empty
      if (Object.keys(reactRouterParams).length === 0 && hashParams) {
        console.log('🔍 No React Router params found, checking hash for parameters...');
        const hashSearch = hashParams.includes('?') ? hashParams.split('?')[1] : '';
        if (hashSearch) {
          const hashSearchParams = new URLSearchParams(hashSearch);
          const hashParamsObj = Object.fromEntries(hashSearchParams.entries());
          console.log('🔍 Hash search params:', hashParamsObj);
        }
      }
      
      // Check expiration (try both sources)
      const expireParam = searchParams.get('expire') || mainUrlParams.get('expire');
      if (expireParam) {
        const expireDate = new Date(decodeURIComponent(expireParam));
        const now = new Date();
        console.log('🕐 Link expires at:', expireDate);
        console.log('🕐 Current time:', now);
        console.log('🕐 Link expired?', now > expireDate);
        
        if (now > expireDate) {
          setStatus('error');
          setMessage('This verification link has expired. Please request a new verification email from your account settings.');
          return;
        }
      }
      
      // Show debug info in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Debug - URL search params:', window.location.search);
        console.log('Debug - React Router parameters:', reactRouterParams);
        console.log('Debug - Main URL parameters:', allMainParams);
      }

      if (!userId || !secret) {
        console.error('❌ Missing verification parameters');
        console.log('Available React Router parameters:', reactRouterParams);
        console.log('Available main URL parameters:', allMainParams);
        
        const allAvailableKeys = [...Object.keys(reactRouterParams), ...Object.keys(allMainParams)];
        const hasAnyParams = allAvailableKeys.length > 0;
        
        setStatus('error');
        
        if (!hasAnyParams) {
          setMessage('Invalid verification link. No parameters found in the URL. Please check that you clicked the correct link from your email.');
        } else {
          setMessage(`Invalid verification link. Missing required parameters (userId and secret). Found parameters: ${allAvailableKeys.join(', ')}. Please use the verification link from your email.`);
        }
        return;
      }

      try {
        const authService = new AuthService();
        console.log('🔍 Starting verification process...');
        
        const result = await authService.verifyEmail(userId, secret);
        console.log('🔍 Verification result:', result);
        
        if (result.success) {
          console.log('✅ Verification successful!');
          setStatus('success');
          setMessage(result.message || 'Email verified successfully! You will be redirected to the dashboard.');
          
          // Redirect to dashboard after successful verification
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          console.log('❌ Verification failed:', result.message);
          setStatus('error');
          
          // Provide more helpful error messages based on the error
          if (result.message?.includes('invalid') || result.message?.includes('already been used')) {
            setMessage('This verification link is invalid or has already been used. Please request a new verification email below.');
          } else if (result.message?.includes('expired')) {
            setMessage('This verification link has expired. Please request a new verification email below.');
          } else {
            setMessage(result.message || 'Verification failed. Please request a new verification email below.');
          }
        }
      } catch (error: any) {
        console.error('❌ Verification error caught:', error);
        setStatus('error');
        
        // Handle specific error types
        if (error.message?.includes('Invalid token') || error.message?.includes('user_invalid_token')) {
          setMessage('This verification link is invalid or has already been used. Please request a new verification email below.');
        } else if (error.message?.includes('expired')) {
          setMessage('This verification link has expired. Please request a new verification email below.');
        } else {
          setMessage('Verification failed. Please request a new verification email below or try logging in again.');
        }
      }
    };

    handleVerification();
  }, [userId, secret, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200 to-indigo-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative max-w-lg w-full">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
          {/* Felearn Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Felearn
            </h1>
          </div>

          {/* Verifying State */}
          {status === 'verifying' && (
            <div className="text-center">
              <div className="relative mb-8">
                {/* Animated spinner */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-6">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
                
                {/* Floating dots animation */}
                <div className="flex justify-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Verifying Your Email
              </h2>
              <p className="text-gray-600 text-lg">
                Please wait while we verify your email address...
              </p>
              
              {/* Progress indicator */}
              <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}
          
          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <div className="relative mb-8">
                {/* Success animation */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-6 animate-pulse">
                  <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                {/* Celebration particles */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="absolute top-8 right-6 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                🎉 Email Verified Successfully!
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
                <p className="text-green-800 font-medium">{message}</p>
              </div>
              
              <div className="text-sm text-gray-500 flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Redirecting to dashboard in a few seconds...
              </div>
            </div>
          )}
          
          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <div className="relative mb-8">
                {/* Error icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full mb-6">
                  <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Verification Issue
              </h2>
              
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                <p className="text-red-800 font-medium">{message}</p>
              </div>
              
              {/* Helpful explanation with better design */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-blue-800 mb-3">Why did this happen?</h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verification links can only be used once
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Links expire after a certain time period
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        You may have already verified your email
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Action buttons with improved design */}
              <div className="space-y-4">
                <button
                  onClick={handleRequestNewVerification}
                  disabled={isRequestingNew}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isRequestingNew ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Sending New Link...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Request New Verification Email
                    </div>
                  )}
                </button>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-green-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      </svg>
                      Dashboard
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/auth/login')}
                    className="bg-gray-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-600 transition-colors shadow-md hover:shadow-lg"
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Login
                    </div>
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-6 flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Already logged in? Request a new verification email from your profile settings.
              </p>
              

            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2025 Felearn. Powered by AI storytelling.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;