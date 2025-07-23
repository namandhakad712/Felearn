import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout';
import { Button, Card } from '../components/ui';

const AuthPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { login, register, loginWithOAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = type === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      console.log(`Attempting to ${isLogin ? 'login' : 'register'} with email: ${email}`);
      
      // Basic client-side validation for password
      if (!isLogin) {
        // Check if password contains parts of email
        const emailUsername = email.split('@')[0].toLowerCase();
        if (emailUsername.length > 3 && password.toLowerCase().includes(emailUsername)) {
          throw new Error('Your password cannot contain parts of your email address. Please choose a different password.');
        }
      }
      
      if (isLogin) {
        await login(email, password);
        // Navigation is handled by AuthContext
      } else {
        console.log('Starting registration process...');
        try {
          const result = await register(email, password);
          console.log('Registration completed successfully');
          
          if (result.requiresVerification) {
            // Show success message and don't navigate
            setSuccessMessage(result.message);
            return;
          }
        } catch (registerError: any) {
          // If email already exists, try to log in instead
          if (registerError.code === 409 || 
              (registerError.message && registerError.message.includes('already exists'))) {
            console.log('Account already exists, attempting to log in...');
            try {
              await login(email, password);
              return; // Login successful, return early
            } catch (loginError: any) {
              // If login fails due to unverified email
              if ((loginError as any).code === 'EMAIL_NOT_VERIFIED') {
                setError(loginError.message + ' You can also try registering again to get a new verification email.');
                return;
              }
              throw loginError;
            }
          }
          throw registerError; // Re-throw if it's not the "already exists" error
        }
      }
    } catch (err: any) {
      console.error(`${isLogin ? 'Login' : 'Registration'} error:`, err);
      
      // Extract more detailed error message
      let errorMessage = 'An error occurred';
      
      if (err.message) {
        errorMessage = err.message;
      }
      
      // Check for specific Appwrite error codes
      if (err.code) {
        switch (err.code) {
          case 400:
            if (err.message && err.message.includes('password')) {
              errorMessage = 'Password must be at least 8 characters and should not contain parts of your email.';
            } else {
              errorMessage = 'Invalid email or password format';
            }
            break;
          case 401:
            errorMessage = 'Invalid email or password';
            break;
          case 409:
            errorMessage = 'An account with this email already exists';
            break;
          case 429:
            errorMessage = 'Too many attempts, please try again later';
            break;
          case 503:
            errorMessage = 'Service unavailable, please try again later';
            break;
          default:
            errorMessage = `Error: ${errorMessage}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    try {
      setIsLoading(true);
      loginWithOAuth(provider);
      // Redirect happens in the OAuth flow, no need to catch errors here
    } catch (err: any) {
      setError(err.message || 'An error occurred with OAuth login');
      setIsLoading(false);
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
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Felearn</h1>
          </Link>
          <h2 className="text-2xl font-bold mt-6 text-gray-900 dark:text-white">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {isLogin
              ? 'Sign in to continue to your dashboard'
              : 'Sign up to start creating amazing stories'}
          </p>
        </div>

        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-4 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6">
            {error}
            {error.includes('already exists') && !isLogin && (
              <div className="mt-2">
                <p className="text-sm">
                  Would you like to{' '}
                  <button
                    onClick={() => {
                      setIsLoading(true);
                      login(email, password)
                        .catch(err => {
                          setError('Login failed: ' + (err.message || 'Invalid credentials'));
                        })
                        .finally(() => setIsLoading(false));
                    }}
                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 underline"
                  >
                    log in
                  </button>{' '}
                  with this email instead?
                </p>
              </div>
            )}
            {error.includes('password') && (
              <div className="mt-2">
                <p className="text-sm">
                  Try a stronger password that doesn't contain parts of your email or name.
                </p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="••••••••"
            />
            {!isLogin && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 8 characters and should not contain parts of your email address.
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            fullWidth
          >
            {isLogin ? 'Sign in' : 'Sign up'}
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuth('google')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <span>Google</span>
            </button>
            <button
              onClick={() => handleOAuth('github')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <span>GitHub</span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link
              to={isLogin ? '/auth/signup' : '/auth/login'}
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </Card>
      </div>
    </Layout>
  );
};

export default AuthPage;