import React, { useState } from 'react';
import { useRegister } from '../../hooks';
import { AuthErrorDisplay } from '../../utils/authErrorDisplay';

interface RegistrationFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Registration form component
 * Provides a form for user registration with email and password
 */
const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess, onError }) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // Form validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // Registration hook
  const { register, isLoading, error } = useRegister();
  
  // Password strength calculation
  const calculatePasswordStrength = (password: string): { score: number; feedback: string } => {
    if (!password) return { score: 0, feedback: 'Password is required' };
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1; // Has uppercase
    if (/[a-z]/.test(password)) score += 1; // Has lowercase
    if (/[0-9]/.test(password)) score += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special char
    
    // Provide feedback based on score
    let feedback = '';
    if (score <= 2) {
      feedback = 'Weak password';
    } else if (score <= 4) {
      feedback = 'Moderate password';
    } else {
      feedback = 'Strong password';
    }
    
    return { score, feedback };
  };
  
  const passwordStrength = calculatePasswordStrength(password);
  
  // Validate form fields
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Validate email
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      isValid = false;
    } else if (passwordStrength.score < 3) {
      setPasswordError('Password is too weak. Add uppercase, lowercase, numbers, or special characters.');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      // Register user
      const success = await register(email, password);
      
      if (success) {
        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setDisplayName('');
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      // Call error callback
      if (onError && err instanceof Error) {
        onError(err);
      }
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
        <label htmlFor="display-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Display Name (Optional)
        </label>
        <input
          id="display-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          placeholder="Your name"
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
          onBlur={() => {
            if (password && password.length < 8) {
              setPasswordError('Password must be at least 8 characters long');
            } else {
              setPasswordError('');
            }
          }}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
            passwordError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="Create a password"
          required
        />
        {passwordError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordError}</p>
        )}
        
        {/* Password strength indicator */}
        {password && (
          <div className="mt-2">
            <div className="flex items-center">
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    passwordStrength.score <= 2 
                      ? 'bg-red-500' 
                      : passwordStrength.score <= 4 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (passwordStrength.score / 6) * 100)}%` }}
                ></div>
              </div>
              <span className={`ml-2 text-xs ${
                passwordStrength.score <= 2 
                  ? 'text-red-500 dark:text-red-400' 
                  : passwordStrength.score <= 4 
                    ? 'text-yellow-500 dark:text-yellow-400' 
                    : 'text-green-500 dark:text-green-400'
              }`}>
                {passwordStrength.feedback}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              For a strong password, include uppercase, lowercase, numbers, and special characters.
            </p>
          </div>
        )}
      </div>
      
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Confirm Password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => {
            if (confirmPassword && password !== confirmPassword) {
              setConfirmPasswordError('Passwords do not match');
            } else {
              setConfirmPasswordError('');
            }
          }}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
            confirmPasswordError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="Confirm your password"
          required
        />
        {confirmPasswordError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{confirmPasswordError}</p>
        )}
      </div>
      
      {/* Display API error */}
      {error && (
        <div className={`p-3 rounded-lg ${AuthErrorDisplay.getSeverityClass(error.severity || 'medium')}`}>
          <p>{error.message}</p>
          {error.helpText && (
            <p className="text-sm mt-1">{error.helpText}</p>
          )}
          {error.suggestions && error.suggestions.length > 0 && (
            <ul className="text-sm mt-1 list-disc list-inside">
              {error.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
    </form>
  );
};

export default RegistrationForm;