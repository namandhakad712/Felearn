import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/services/auth';
import type { AuthResponse } from '@/services/auth';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password validation function
  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true, message: '' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (!isLogin) {
        // Validate password before registration
        const { isValid, message } = validatePassword(password);
        if (!isValid) {
          setError(message);
          setIsLoading(false);
          return;
        }
      }

      if (isLogin) {
        try {
          const result: AuthResponse = await login(email, password);
          if (result.success) {
            navigate('/dashboard');
          } else {
            setError(result.message);
          }
        } catch (loginError: any) {
          console.log('Login failed, attempting auto-registration...', loginError.message);
          console.log('Full error object:', loginError);
          
          // If login fails, try auto-registration for new users
          // Check for various login failure messages
          const shouldTryAutoRegister = 
            loginError.message?.includes('Invalid credentials') || 
            loginError.message?.includes('Invalid email or password') ||
            loginError.message?.includes('User (role: guests) missing scope') ||
            loginError.message?.includes('check the email and password') ||
            loginError.code === 401;
          
          if (shouldTryAutoRegister) {
            
            // Validate password for auto-registration
            const { isValid, message } = validatePassword(password);
            if (!isValid) {
              setError(`Account doesn't exist and password doesn't meet requirements for new account: ${message}`);
              setIsLoading(false);
              return;
            }

            try {
              console.log('Attempting auto-registration for:', email);
              // Attempt auto-registration
              const registerResult: AuthResponse = await register(email, password);
              if (registerResult.success) {
                if (registerResult.requiresVerification) {
                  setSuccessMessage(`✨ New account created! ${registerResult.message}`);
                } else {
                  navigate('/dashboard');
                }
              } else {
                setError(`Login failed and couldn't create new account: ${registerResult.message}`);
              }
            } catch (registerError: any) {
              console.error('Auto-registration failed:', registerError);
              if (registerError.message?.includes('already exists')) {
                setError('Account exists but password is incorrect. Please check your password.');
              } else {
                setError(`Login failed: ${loginError.message}`);
              }
            }
          } else {
            setError(loginError.message);
          }
        }
      } else {
        const result: AuthResponse = await register(email, password);
        if (result.success) {
          if (result.requiresVerification) {
            setSuccessMessage(result.message);
          } else {
            navigate('/dashboard');
          }
        } else {
          setError(result.message);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      console.log(`🔐 Starting ${provider} OAuth login...`);
      const authService = new AuthService();
      await authService.createOAuthSession(provider);
      console.log(`✅ ${provider} OAuth initiated successfully`);
    } catch (error: any) {
      console.error(`❌ ${provider} OAuth error:`, error);
      setError(`${provider} authentication failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-6 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome to Felearn
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              AI-powered storytelling with tiny cats
            </p>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
            {isLogin ? 'Sign In or Create Account' : 'Create Account'}
          </h2>
          
          <p className="text-sm sm:text-base text-gray-600">
            {isLogin
              ? "Enter your email and password. We'll sign you in or create a new account automatically!"
              : 'Already have an account?'}
            {!isLogin && (
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                  setSuccessMessage('');
                }}
                className="ml-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Sign in instead
              </button>
            )}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-lg">
            {successMessage}
          </div>
        )}

        {isLogin && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Smart Login</p>
                <p>Enter your credentials. If you're a new user, we'll automatically create your account!</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base sm:text-sm"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base sm:text-sm"
              placeholder="Enter your password"
            />
            <div className="mt-2 text-xs sm:text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">
                {isLogin ? 'For new accounts, password must have:' : 'Password requirements:'}
              </p>
              <ul className="space-y-1">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                  At least 8 characters long
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                  One uppercase letter (A-Z)
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                  One lowercase letter (a-z)
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                  One number (0-9)
                </li>
              </ul>
            </div>
          </div>

          {isLogin && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => navigate('/auth/reset-password')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span>
                {isLogin ? (
                  <>
                    Continue
                    <span className="text-xs block opacity-90">Sign in or create account</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </span>
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              <span className="ml-2">Continue with Google</span>
            </button>

            <button
              onClick={() => handleOAuthLogin('github')}
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#333"
                  d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
                />
              </svg>
              <span className="ml-2">Continue with GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;