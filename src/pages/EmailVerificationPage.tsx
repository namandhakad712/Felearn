import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/auth';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  // Get verification parameters from URL
  // Appwrite uses different parameter names in verification URLs
  const userId = searchParams.get('userId') || searchParams.get('user') || searchParams.get('id');
  const secret = searchParams.get('secret') || searchParams.get('token') || searchParams.get('code');

  useEffect(() => {
    const handleVerification = async () => {
      // Debug: Log all URL parameters
      const allParams = Object.fromEntries(searchParams.entries());
      console.log('All URL parameters:', allParams);
      console.log('Extracted userId:', userId);
      console.log('Extracted secret:', secret);
      
      // Check expiration
      const expireParam = searchParams.get('expire');
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
        console.log('Debug - All available parameters:', allParams);
      }

      if (!userId || !secret) {
        console.error('❌ Missing verification parameters');
        console.log('Available parameters:', allParams);
        setStatus('error');
        setMessage(`Invalid verification link. Missing required parameters. Available: ${Object.keys(allParams).join(', ')}`);
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
          setMessage(result.message || 'Verification failed. Please try again.');
        }
      } catch (error: any) {
        console.error('❌ Verification error caught:', error);
        setStatus('error');
        setMessage(error.message || 'Verification failed. Please try again or request a new link.');
      }
    };

    handleVerification();
  }, [userId, secret, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          {status === 'verifying' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Verifying Your Email</h2>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          )}
          
          {status === 'success' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-green-600">Success!</h2>
              <div className="text-green-600">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600">{message}</p>
            </div>
          )}
          
          {status === 'error' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-red-600">Verification Issue</h2>
              <div className="text-red-600">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate('/auth/login')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Return to Login
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                If you're already logged in, you can request a new verification email from your profile settings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;