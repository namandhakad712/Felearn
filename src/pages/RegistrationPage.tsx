import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegistrationForm } from '../components/auth';

/**
 * Registration page component
 * Provides a page for user registration
 */
const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Handle successful registration
  const handleRegistrationSuccess = () => {
    setRegistrationSuccess(true);
    setRegistrationError(null);
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };
  
  // Handle registration error
  const handleRegistrationError = (error: Error) => {
    setRegistrationError(error.message);
    setRegistrationSuccess(false);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        {/* Success message */}
        {registrationSuccess && (
          <div className="p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg">
            <p className="font-medium">Registration successful!</p>
            <p className="text-sm">Redirecting you to the dashboard...</p>
          </div>
        )}
        
        {/* Error message */}
        {registrationError && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            <p className="font-medium">Registration failed</p>
            <p className="text-sm">{registrationError}</p>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <RegistrationForm
            onSuccess={handleRegistrationSuccess}
            onError={handleRegistrationError}
          />
        </div>
        
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;