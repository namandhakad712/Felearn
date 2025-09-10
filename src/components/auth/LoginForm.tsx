import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../../hooks';
import { AuthErrorDisplay } from '../../utils/authErrorDisplay';

import { ErrorDisplayData } from '../../utils/authErrorDisplay';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: ErrorDisplayData) => void;
  showForgotPassword?: boolean;
}

/**
 * Login form component with validation
 */
const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onError, showForgotPassword = true }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login, isLoading, error } = useLogin();
  
  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const success = await login(email, password);
      
      if (success && onSuccess) {
        onSuccess();
      } else if (!success && error && onError) {
        const errorData: ErrorDisplayData = {
          message: error.message || 'Login failed',
          severity: 'high',
          suggestions: ['Check your email and password', 'Try resetting your password'],
          isRetryable: true,
          retryDelay: 5000
        };
        onError(errorData);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorData: ErrorDisplayData = {
        message: error.message || 'Login failed',
        severity: 'high',
        suggestions: ['Check your email and password', 'Try resetting your password'],
        isRetryable: true,
        retryDelay: 5000
      };
      onError?.(errorData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => {
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              setEmailError('Please enter a valid email address');
            } else {
              setEmailError('');
            }
          }}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
            emailError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="you@example.com"
          required
        />
        {emailError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{emailError}</p>
        )}
      </div>
      
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          {showForgotPassword && (
            <Link
              to="/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Forgot password?
            </Link>
          )}
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 ${
            passwordError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="Enter your password"
          required
        />
        {passwordError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordError}</p>
        )}
      </div>
      
      {error && (
        <div className={`p-3 rounded-lg ${AuthErrorDisplay.getSeverityClass(error.severity || 'medium')}`}>
          <p>{error.message}</p>
          {error.helpText && (
            <p className="text-sm mt-1">{error.helpText}</p>
          )}
        </div>
      )}
      
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;