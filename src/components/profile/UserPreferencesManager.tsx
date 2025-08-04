import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';
import { UserSettings } from '../../types';

type Theme = 'light' | 'dark';

interface UserPreferencesManagerProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const UserPreferencesManager: React.FC<UserPreferencesManagerProps> = ({
  onSuccess,
  onError,
}) => {
  const { user, updateUser } = useAuth();
  const { theme: currentTheme, setTheme } = useTheme();
  
  // Form states
  const getUserSettings = (user: any): UserSettings => {
    if (!user?.settings) return { theme: 'light', language: 'en' };
    
    // Handle both string and object types for settings
    if (typeof user.settings === 'string') {
      try {
        return JSON.parse(user.settings);
      } catch {
        return { theme: 'light', language: 'en' };
      }
    }
    
    // If it's already an object, return it
    return user.settings as UserSettings;
  };

  const userSettings = getUserSettings(user);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(
    userSettings?.theme || currentTheme || 'light'
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    userSettings?.language || 'en'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Language options with native names
  const languageOptions = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  ];
  
  // Check for changes
  useEffect(() => {
    const themeChanged = selectedTheme !== (userSettings?.theme || 'light');
    const languageChanged = selectedLanguage !== (userSettings?.language || 'en');
    setHasChanges(themeChanged || languageChanged);
  }, [selectedTheme, selectedLanguage, userSettings]);
  
  // Apply theme changes in real-time for preview
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setSelectedTheme(newTheme);
    setTheme(newTheme); // Apply immediately for preview
  };
  
  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
  };
  
  const handleSavePreferences = async () => {
    if (!hasChanges) {
      onError('No changes to save');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await updateUser({
        settings: {
          ...userSettings,
          theme: selectedTheme,
          language: selectedLanguage,
        },
      });
      
      onSuccess('Preferences updated successfully');
      setHasChanges(false);
      
    } catch (error: any) {
      onError(error.message || 'Failed to update preferences');
      
      // Revert theme if save failed
      if (userSettings?.theme) {
        setTheme(userSettings.theme);
        setSelectedTheme(userSettings.theme);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResetPreferences = () => {
    const originalTheme = userSettings?.theme || 'light';
    const originalLanguage = userSettings?.language || 'en';
    
    setSelectedTheme(originalTheme);
    setSelectedLanguage(originalLanguage);
    setTheme(originalTheme); // Revert theme immediately
    setHasChanges(false);
  };
  
  const getSelectedLanguage = () => {
    return languageOptions.find(lang => lang.code === selectedLanguage) || languageOptions[0];
  };
  
  return (
    <div className="space-y-8">
      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Theme Preference
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Light Theme Option */}
          <motion.button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
              selectedTheme === 'light'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Theme Preview */}
            <div className="mb-4 mx-auto w-16 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 border border-gray-200 relative overflow-hidden">
              <div className="absolute top-1 left-1 right-1 h-2 bg-white rounded-sm shadow-sm"></div>
              <div className="absolute top-4 left-1 w-3 h-1 bg-gray-300 rounded-sm"></div>
              <div className="absolute top-6 left-1 w-4 h-1 bg-gray-200 rounded-sm"></div>
              <div className="absolute top-8 left-1 w-2 h-1 bg-gray-200 rounded-sm"></div>
            </div>
            
            <div className="flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            </div>
            
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-white">Light Mode</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Clean and bright interface
              </div>
            </div>
            
            {selectedTheme === 'light' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
          
          {/* Dark Theme Option */}
          <motion.button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
              selectedTheme === 'dark'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Theme Preview */}
            <div className="mb-4 mx-auto w-16 h-12 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 relative overflow-hidden">
              <div className="absolute top-1 left-1 right-1 h-2 bg-gray-700 rounded-sm"></div>
              <div className="absolute top-4 left-1 w-3 h-1 bg-gray-500 rounded-sm"></div>
              <div className="absolute top-6 left-1 w-4 h-1 bg-gray-600 rounded-sm"></div>
              <div className="absolute top-8 left-1 w-2 h-1 bg-gray-600 rounded-sm"></div>
            </div>
            
            <div className="flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            </div>
            
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-white">Dark Mode</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Easy on the eyes
              </div>
            </div>
            
            {selectedTheme === 'dark' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        </div>
        
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Theme changes are applied immediately for preview. Click "Save Changes" to make them permanent.
        </div>
      </div>
      
      {/* Language Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Language Preference
        </label>
        
        <div className="space-y-4">
          {/* Current Selection Display */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Current: {getSelectedLanguage().nativeName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {getSelectedLanguage().name}
                </div>
              </div>
              <div className="text-2xl">
                {selectedLanguage === 'en' && '🇺🇸'}
                {selectedLanguage === 'es' && '🇪🇸'}
                {selectedLanguage === 'fr' && '🇫🇷'}
                {selectedLanguage === 'de' && '🇩🇪'}
                {selectedLanguage === 'ja' && '🇯🇵'}
                {selectedLanguage === 'zh' && '🇨🇳'}
                {selectedLanguage === 'pt' && '🇵🇹'}
                {selectedLanguage === 'ru' && '🇷🇺'}
              </div>
            </div>
          </div>
          
          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          >
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeName} ({lang.name})
              </option>
            ))}
          </select>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Language changes will be applied after saving. Some features may require a page refresh.
          </div>
        </div>
      </div>
      
      {/* Preview Section */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Preview Mode Active
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  You're currently previewing your changes. The theme has been applied temporarily.
                  Save your changes to make them permanent, or reset to revert.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleResetPreferences}
          disabled={!hasChanges || isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset Changes
        </button>
        
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Unsaved changes
            </div>
          )}
          
          <button
            type="button"
            onClick={handleSavePreferences}
            disabled={!hasChanges || isSubmitting}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPreferencesManager;