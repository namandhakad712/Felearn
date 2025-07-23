import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout';
import { Card } from '../components/ui';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendVerificationEmail } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'resend'>('verifying');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

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
        await verifyEmail(userId, secret);
        setStatus('success');
        setMessage('Your email has been verified successfully! You can now log in to your account.');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Email verification failed. The link may be expired or invalid.');
      }
    };

    handleVerification();
  }, [userId, secret, verifyEmail]);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await resendVerificationEmail();
      setStatus('resend');
      setMessage('A new verification email has been sent to your inbox. Please check your email.');
    } catch (error: any) {
      setMessage(error.message || 'Failed to resend verification email. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-800 dark:text-green-200 bg-green-50 dark:bg-green-900/30';
      case 'error':
        return 'text-red-800 dark:text-red-200 bg-red-50 dark:bg-red-900/30';
      case 'resend':
        return 'text-blue-800 dark:text-blue-200 bg-blue-50 dark:bg-blue-900/30';
      default:
        return 'text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/30';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return (
          <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'resend':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  return (
    <Layout>
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <Card
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
          padding="lg"
        >
          <div className="text-center">
            <Link to="/" className="inline-block mb-8">
              <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Felearn</h1>
            </Link>

            <div className="mb-6">
              <div className="flex justify-center mb-4">
                {getStatusIcon()}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {status === 'verifying' && 'Verifying Email'}
                {status === 'success' && 'Email Verified!'}
                {status === 'error' && 'Verification Failed'}
                {status === 'resend' && 'Email Sent!'}
              </h2>
            </div>

            <div className={`p-4 rounded-lg mb-6 ${getStatusColor()}`}>
              {message}
            </div>

            <div className="space-y-4">
              {status === 'success' && (
                <Link
                  to="/auth/login"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Continue to Login
                </Link>
              )}

              {status === 'error' && (
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}

              <Link
                to="/auth/login"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default EmailVerificationPage;