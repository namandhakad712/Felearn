import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRotationUtil } from '../../utils/keyRotation';
import { Card } from '../ui';

/**
 * Component for managing encryption keys (admin only)
 */
const KeyManagement: React.FC = () => {
  const [isRotating, setIsRotating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleRotateKeys = async () => {
    setIsRotating(true);
    setResult(null);
    
    try {
      await KeyRotationUtil.rotateKeys();
      
      // Update the last rotation date
      KeyRotationUtil.updateLastRotationDate();
      
      setResult({
        success: true,
        message: 'Encryption keys rotated successfully. All API keys have been re-encrypted with the new key.'
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Failed to rotate encryption keys'
      });
    } finally {
      setIsRotating(false);
      setShowConfirmation(false);
    }
  };

  return (
    <Card className="mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Encryption Key Management
      </h3>
      
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          Rotating encryption keys is a security best practice that helps protect sensitive data.
          When you rotate keys, all API keys will be re-encrypted with a new encryption key.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Important Information
              </h4>
              <ul className="mt-1 text-sm text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
                <li>Key rotation should be performed during low-traffic periods</li>
                <li>All users will continue to access their API keys normally</li>
                <li>This process cannot be reversed once started</li>
                <li>It's recommended to rotate keys every 90 days</li>
              </ul>
            </div>
          </div>
        </div>
        
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              result.success
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-start">
              {result.success ? (
                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${
                  result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                }`}>
                  {result.success ? 'Success' : 'Error'}
                </h4>
                <p className={`mt-1 text-sm ${
                  result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                }`}>
                  {result.message}
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        {showConfirmation ? (
          <div className="border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Confirm Key Rotation
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
              Are you sure you want to rotate encryption keys? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleRotateKeys}
                disabled={isRotating}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                {isRotating ? 'Rotating...' : 'Yes, Rotate Keys'}
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isRotating}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              onClick={() => setShowConfirmation(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Rotate Encryption Keys
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default KeyManagement;