import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { authService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';

interface CredentialUpdateProps {
  type: 'email' | 'password';
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onCancel: () => void;
}

const CredentialUpdate: React.FC<CredentialUpdateProps> = ({
  type,
  onSuccess,
  onError,
  onCancel,
}) => {
  const { user } = useAuth();
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Validation states
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newEmailError, setNewEmailError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const validateCurrentPassword = () => {
    if (!currentPassword) {
      setCurrentPasswordError('Current password is required');
      return false;
    }
    setCurrentPasswordError('');
    return true;
  };
  
  const validateNewEmail = () => {
    if (!newEmail) {
      setNewEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setNewEmailError('Please enter a valid email address');
      return false;
    }
    if (newEmail === user?.email) {
      setNewEmailError('New email must be different from current email');
      return false;
    }
    setNewEmailError('');
    return true;
  };
  
  const validateNewPassword = () => {
    if (!newPassword) {
      setNewPasswordError('New password is required');
      return false;
    }
    if (newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters long');
      return false;
    }
    setNewPasswordError('');
    return true;
  };
  
  const validateConfirmPassword = () => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };
  
  const handleVerifyPassword = async () => {
    if (!validateCurrentPassword()) return;
    
    setIsSubmitting(true);
    try {
      const isValid = await authService.verifyPassword(currentPassword);
      if (isValid) {
        setShowConfirmation(true);
      } else {
        setCurrentPasswordError('Incorrect password');
      }
    } catch (error) {
      setCurrentPasswordError('Failed to verify password');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateEmail = async () => {
    if (!validateCurrentPassword() || !validateNewEmail()) return;
    
    setIsSubmitting(true);
    try {
      await authService.updateEmail(newEmail, currentPassword);
      onSuccess('Email updated successfully');
      onCancel();
    } catch (error: any) {
      onError(error.message || 'Failed to update email');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdatePassword = async () => {
    if (!validateCurrentPassword() || !validateNewPassword() || !validateConfirmPassword()) return;
    
    setIsSubmitting(true);
    try {
      await authService.updatePassword(newPassword, currentPassword);
      onSuccess('Password updated successfully');
      onCancel();
    } catch (error: any) {
      onError(error.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showConfirmation) {
      if (type === 'email') {
        await handleUpdateEmail();
      } else {
        await handleUpdatePassword();
      }
    } else {
      await handleVerifyPassword();
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto"
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {type === 'email' ? 'Update Email Address' : 'Change Password'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {!showConfirmation ? (
          <>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Security Verification
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>
                      Please enter your current password to verify your identity before making changes to your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  currentPasswordError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter your current password"
              />
              {currentPasswordError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{currentPasswordError}</p>
              )}
            </div>
          </>
        ) : (
          <>
            {type === 'email' ? (
              <div>
                <label htmlFor="new-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Email Address
                </label>
                <input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    newEmailError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your new email address"
                />
                {newEmailError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{newEmailError}</p>
                )}
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      newPasswordError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your new password"
                  />
                  {newPasswordError && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{newPasswordError}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 8 characters long
                  </p>
                </div>
                
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      confirmPasswordError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Confirm your new password"
                  />
                  {confirmPasswordError && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{confirmPasswordError}</p>
                  )}
                </div>
              </>
            )}
          </>
        )}
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {showConfirmation ? 'Updating...' : 'Verifying...'}
              </>
            ) : (
              showConfirmation ? 'Update' : 'Continue'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CredentialUpdate;