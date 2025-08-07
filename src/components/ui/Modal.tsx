import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  position?: 'center' | 'top';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  position = 'center'
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-[100] flex ${position === 'top' ? 'items-start pt-16 sm:pt-20' : 'items-center'} justify-center p-4 sm:p-6`}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-hierarchy"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full ${sizeClasses[size]} mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-xl rounded-lg sm:rounded-xl ${className}`}
            style={{ 
              maxHeight: position === 'top' ? '80vh' : '90vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
              {title && (
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div className="mt-2 flex-1 overflow-y-auto">
                {children}
              </div>
            </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;