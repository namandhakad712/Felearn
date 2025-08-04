import React, { useState } from 'react';
import { usePasswordReset } from '../../hooks';
import { AuthErrorDisplay, ErrorDisplayData } from '../../utils/authErrorDisplay';

interface PasswordResetFormProps {
  onSuccess?: () => void;
  onError?: (error: ErrorDisplayData) => void;
}

/**
 * Password reset form component
 */
const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ onSuccess, onError }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword, isLoading, error } = usePasswordReset();
  
  const validateForm = (): boolean => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const success = await resetPassword(email);
    
    if (success) {
      setIsSubmitted(true);
      if (onSuccess) {
        onSuccess();
      }
    } else if (error && onError) {
      onError(error);
    }
  };
  
  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg mb-4">
          <h3 className="font-medium">Password reset email sent!</h3>
          <p className="text-sm mt-1">
            Check your email for instructions to reset your password.
          </p>
        </div>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setEmail('');
          }}
          className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm"
        >
          Send another email
        </button>
      </div>
    );
  }
  
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
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Enter the email address associated with your account and we'll send you a link to reset your password.
        </p>
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
          {isLoading ? 'Sending...' : 'Send Reset Email'}
        </button>
      </div>
    </form>
  );
};

export default PasswordResetForm;