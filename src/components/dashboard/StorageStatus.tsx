import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { quickBucketCheck, testBucketConnection } from '../../utils/testBucketConnection';
import { APPWRITE_CONFIG } from '../../config/appwrite';

const StorageStatus: React.FC = () => {
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [_showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const exists = await quickBucketCheck();
        setBucketExists(exists);
      } catch (error) {
        setBucketExists(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkStatus();
  }, []);

  const runDetailedTest = async () => {
    setShowDetails(true);
    console.log('🧪 Running detailed bucket test...');
    const result = await testBucketConnection();
    // Test result received
  };

  if (isChecking) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span>Checking storage...</span>
      </div>
    );
  }

  if (bucketExists) {
    return (
      <div className="flex items-center justify-between mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Storage ready - Bucket: {APPWRITE_CONFIG.buckets.storyImages}</span>
        </div>
        <button
          onClick={runDetailedTest}
          className="text-xs text-green-600 hover:text-green-700 underline"
        >
          Test Connection
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
    >
      <div className="flex items-start space-x-3">
        <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Storage Bucket Connection Failed
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            Cannot connect to bucket <code className="px-1 py-0.5 bg-red-100 dark:bg-red-800 rounded text-xs">{APPWRITE_CONFIG.buckets.storyImages}</code>. 
            This will prevent image uploads from working properly.
          </p>
          <div className="mt-3 flex items-center space-x-3">
            <button
              onClick={runDetailedTest}
              className="text-sm text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100 font-medium underline"
            >
              Run Diagnostic Test
            </button>
            <button
              onClick={() => window.open('https://fra.cloud.appwrite.io/console/project-felearn/storage', '_blank')}
              className="text-sm text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100 font-medium underline"
            >
              Open Appwrite Console →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StorageStatus;