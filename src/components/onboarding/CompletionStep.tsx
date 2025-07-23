import React from 'react';
import { motion } from 'framer-motion';

interface CompletionStepProps {
  userName?: string;
}

const CompletionStep: React.FC<CompletionStepProps> = ({ userName = 'there' }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    },
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-center"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </motion.div>
      
      <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        You're all set, {userName}!
      </motion.h2>
      
      <motion.p variants={itemVariants} className="text-gray-600 dark:text-gray-300 mb-6">
        Your account has been configured successfully. You're ready to start creating amazing stories with our AI storytelling platform.
      </motion.p>
      
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-3 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white text-center">Create Stories</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
            Generate engaging stories with AI
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-3 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white text-center">Add Images</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
            Enhance stories with AI-generated images
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-3 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white text-center">Export & Share</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
            Export stories as PDF or JSON
          </p>
        </div>
      </motion.div>
      
      <motion.p variants={itemVariants} className="text-sm text-gray-500 dark:text-gray-400">
        Click "Complete" below to go to your dashboard and start creating!
      </motion.p>
    </motion.div>
  );
};

export default CompletionStep;