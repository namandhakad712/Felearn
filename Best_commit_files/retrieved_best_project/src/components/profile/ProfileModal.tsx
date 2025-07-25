import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

import ApiKeyManager from './ApiKeyManager';
import UserPreferencesManager from './UserPreferencesManager';
import SecurityManager from './SecurityManager';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

type TabType = 'profile' | 'appearance' | 'api' | 'security';

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const { updateUser } = useAuth();
  
  // Simple toast implementation to replace the missing useToast hook
  const showSuccess = (message: string) => {
    console.log('Success:', message);
    alert(message);
  };
  
  const showError = (message: string, details?: string) => {
    console.error('Error:', message, details);
    alert(`Error: ${message}${details ? `\n${details}` : ''}`);
  };
  
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  // Form states
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  
  // Validation states
  const [nameError, setNameError] = useState('');
  const [bioError, setBioError] = useState('');
  
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };
  
  const validateName = () => {
    if (name.length > 50) {
      setNameError('Name must be less than 50 characters');
      return false;
    }
    setNameError('');
    return true;
  };
  
  const validateBio = () => {
    if (bio.length > 200) {
      setBioError('Bio must be less than 200 characters');
      return false;
    }
    setBioError('');
    return true;
  };
  

  
  const handleProfileSubmit = async () => {
    if (!validateName() || !validateBio()) return;
    
    setIsSubmitting(true);
    try {
      await updateUser({
        name,
        bio,
      });
      showSuccess('Profile updated successfully');
    } catch (error) {
      showError('Failed to update profile', 'Please try again later');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  

  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={validateName}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  nameError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Your display name"
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{nameError}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="flex items-center">
                <input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <span className="ml-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  Use Security tab to change
                </span>
              </div>
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                onBlur={validateBio}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  bioError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Tell us a bit about yourself"
              />
              {bioError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{bioError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {bio.length}/200 characters
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleProfileSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        );
        
      case 'appearance':
        return (
          <UserPreferencesManager
            onSuccess={showSuccess}
            onError={showError}
          />
        );
        
      case 'api':
        return (
          <ApiKeyManager
            onSuccess={showSuccess}
            onError={showError}
          />
        );
        
      case 'security':
        return (
          <SecurityManager
            onSuccess={showSuccess}
            onError={showError}
          />
        );
        
      default:
        return null;
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Profile Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex overflow-x-auto" aria-label="Tabs">
              <button
                onClick={() => handleTabChange('profile')}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => handleTabChange('appearance')}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === 'appearance'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Appearance
              </button>
              <button
                onClick={() => handleTabChange('api')}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === 'api'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                API Keys
              </button>
              <button
                onClick={() => handleTabChange('security')}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Security
              </button>
            </nav>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 130px)' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileModal;