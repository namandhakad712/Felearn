import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeSelectionStepProps {
  onThemeChange: (theme: 'light' | 'dark') => void;
}

const ThemeSelectionStep: React.FC<ThemeSelectionStepProps> = ({ onThemeChange }) => {
  const { theme, setTheme } = useTheme();
  
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    onThemeChange(newTheme);
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Choose your theme
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Select your preferred theme for the application. You can always change this later in your settings.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Light theme option */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleThemeChange('light')}
          className={`cursor-pointer p-4 rounded-lg border-2 ${
            theme === 'light'
              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
              : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="bg-white p-6 rounded-lg shadow mb-4">
            <div className="h-4 w-16 bg-gray-800 rounded mb-2"></div>
            <div className="h-3 w-24 bg-gray-400 rounded mb-4"></div>
            <div className="h-10 w-full bg-indigo-500 rounded mb-2"></div>
            <div className="h-3 w-20 bg-gray-300 rounded"></div>
          </div>
          <div className="text-center">
            <span className="font-medium text-gray-900 dark:text-white">Light Theme</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Clean and bright interface
            </p>
          </div>
        </motion.div>
        
        {/* Dark theme option */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleThemeChange('dark')}
          className={`cursor-pointer p-4 rounded-lg border-2 ${
            theme === 'dark'
              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
              : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="bg-gray-800 p-6 rounded-lg shadow mb-4">
            <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-24 bg-gray-600 rounded mb-4"></div>
            <div className="h-10 w-full bg-indigo-500 rounded mb-2"></div>
            <div className="h-3 w-20 bg-gray-600 rounded"></div>
          </div>
          <div className="text-center">
            <span className="font-medium text-gray-900 dark:text-white">Dark Theme</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Easy on the eyes, perfect for night
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ThemeSelectionStep;