import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  // Size classes
  const sizeClasses = {
    sm: 'w-10 h-6',
    md: 'w-14 h-7',
    lg: 'w-16 h-8',
  }[size];
  
  const thumbSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];
  
  // Animation variants
  const springConfig = { type: 'spring', stiffness: 700, damping: 30 };
  
  // Icon variants
  const sunVariants = {
    initial: { scale: 0.6, rotate: 90 },
    animate: { scale: 1, rotate: 0, transition: { duration: 0.2 } },
  };
  
  const moonVariants = {
    initial: { scale: 0.6, rotate: 90 },
    animate: { scale: 1, rotate: 0, transition: { duration: 0.2 } },
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      {showLabel && (
        <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          {isDark ? 'Dark' : 'Light'} Mode
        </span>
      )}
      
      <button
        onClick={toggleTheme}
        className={`${sizeClasses} relative rounded-full bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <div className="relative">
          {/* Track */}
          <div
            className={`${sizeClasses} rounded-full transition-colors duration-300 ${
              isDark ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          />
          
          {/* Thumb */}
          <motion.div
            className={`absolute top-0.5 left-0.5 ${thumbSizeClasses} rounded-full bg-white shadow-lg flex items-center justify-center`}
            animate={{
              x: isDark ? (size === 'sm' ? 16 : size === 'md' ? 28 : 32) : 0,
            }}
            transition={springConfig}
          >
            {isDark ? (
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-indigo-600"
                viewBox="0 0 20 20"
                fill="currentColor"
                initial="initial"
                animate="animate"
                variants={moonVariants}
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </motion.svg>
            ) : (
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-yellow-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                initial="initial"
                animate="animate"
                variants={sunVariants}
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </motion.svg>
            )}
          </motion.div>
        </div>
      </button>
    </div>
  );
};

export default ThemeToggle;