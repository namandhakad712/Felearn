import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

/**
 * Loading spinner component for lazy-loaded components
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClasses = fullScreen 
    ? 'flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className={`inline-block animate-spin rounded-full border-2 border-indigo-500 border-t-transparent ${sizeClasses[size]} mb-4`}></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;