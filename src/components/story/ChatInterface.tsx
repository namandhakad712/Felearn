import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChatInterfaceProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  maxLength?: number;
  userId?: string; // Add userId for rate limiting
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSubmit,
  isLoading = false,
  placeholder = "Write a story about a magical cat who can travel through time...",
  maxLength = 1000,
  // userId // Unused parameter
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    const wordCount = trimmedMessage.split(/\s+/).filter(word => word.length > 0).length;
    
    if (trimmedMessage && !isLoading && wordCount >= 7) {
      onSubmit(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const characterCount = message.length;
  const isOverLimit = characterCount > maxLength;
  const isNearLimit = characterCount > maxLength * 0.8;
  
  // Word count validation
  const wordCount = message.trim().split(/\s+/).filter(word => word.length > 0).length;
  const hasMinimumWords = wordCount >= 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-200 ${
            isFocused
              ? 'border-indigo-500 shadow-xl'
              : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className={`w-full p-4 pr-16 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none border-none outline-none min-h-[120px] max-h-[300px] ${
              isLoading ? 'cursor-not-allowed opacity-50' : ''
            }`}
            style={{ fontSize: '16px' }} // Prevents zoom on iOS
          />

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={!message.trim() || isLoading || isOverLimit || !hasMinimumWords}
            whileHover={{ scale: message.trim() && !isLoading && !isOverLimit && hasMinimumWords ? 1.05 : 1 }}
            whileTap={{ scale: message.trim() && !isLoading && !isOverLimit && hasMinimumWords ? 0.95 : 1 }}
            className={`absolute bottom-4 right-4 p-3 rounded-xl transition-all duration-200 ${
              message.trim() && !isLoading && !isOverLimit && hasMinimumWords
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </motion.div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </motion.button>
        </div>

        {/* Character Count and Validation */}
        <div className="flex justify-between items-center mt-3 px-1">
          <div className="flex items-center space-x-4">
            {/* Formatting Tips */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="hidden sm:inline">Press </span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                Enter
              </kbd>
              <span className="hidden sm:inline"> to send, </span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs ml-1">
                Shift+Enter
              </kbd>
              <span className="hidden sm:inline"> for new line</span>
            </div>
            
            {/* Word Count Indicator */}
            <div className={`text-xs font-medium transition-colors duration-200 ${
              !hasMinimumWords && message.trim()
                ? 'text-red-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {wordCount}/7 words min
            </div>

          </div>

          {/* Character Count */}
          <div
            className={`text-xs font-medium transition-colors duration-200 ${
              isOverLimit
                ? 'text-red-500'
                : isNearLimit
                ? 'text-yellow-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {characterCount}/{maxLength}
          </div>
        </div>

        {/* Error Messages */}
        {isOverLimit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-500 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            Message is too long. Please keep it under {maxLength} characters.
          </motion.div>
        )}
        
        {!hasMinimumWords && message.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-500 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            Please write at least 7 words to create a meaningful story prompt.
          </motion.div>
        )}
      </form>
    </motion.div>
  );
};

export default ChatInterface;