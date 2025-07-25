import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/auth';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  // Get verification parameters from URL
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  useEffect(() => {
    const handleVerification = async () => {
      if (!userId || !secret) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email for the correct link.');
        return;
      }

      try {
        const authService = new AuthService();
        const result = await authService.verifyEmail(userId, secret);
        
        if (result.success) {
          setStatus('success');
          setMessage('Email verified successfully! You will be redirected to login.');
          
          // Redirect to login after successful verification
          setTimeout(() => {
            navigate('/auth/login');
          }, 2000);
        } else {
          throw new Error(result.message);
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        
        if (error.code === 401) {
          setMessage('This verification link has expired. Please request a new one.');
        } else if (error.code === 404) {
          setMessage('Invalid verification link. Please make sure you\'re using the most recent link.');
        } else {
          setMessage(error.message || 'Verification failed. Please try again or request a new link.');
        }
      }
    };

    handleVerification();
  }, [userId, secret, navigate]);

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
              <h2 className="text-2xl font-bold mb-4 text-red-600">Verification Failed</h2>
              <div className="text-red-600">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => navigate('/auth/login')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;