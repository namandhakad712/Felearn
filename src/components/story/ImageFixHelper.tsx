import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui';
import { fixAllUserImages, fixStoryImages } from '../../utils/imageUrlFixer';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks';

interface ImageFixHelperProps {
  storyId?: string;
  onFixComplete?: () => void;
}

const ImageFixHelper: React.FC<ImageFixHelperProps> = ({ storyId, onFixComplete }) => {
  const { user } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [isFixing, setIsFixing] = useState(false);
  const [fixResults, setFixResults] = useState<any>(null);

  const handleFixImages = async () => {
    if (!user) {
      showErrorToast('Error', 'No user found');
      return;
    }

    setIsFixing(true);
    setFixResults(null);

    try {
      let results;
      
      if (storyId) {
        // Fix single story
        results = await fixStoryImages(storyId);
        
        if (results.success) {
          showSuccessToast(
            'Images Fixed!', 
            `Fixed ${results.fixedImages} out of ${results.totalImages} images`
          );
        } else {
          showErrorToast(
            'Fix Issues', 
            `Fixed ${results.fixedImages}/${results.totalImages} images. ${results.failedImages} still have issues.`
          );
        }
      } else {
        // Fix all user stories
        results = await fixAllUserImages(user.$id);
        
        if (results.failedImages === 0) {
          showSuccessToast(
            'All Images Fixed!', 
            `Successfully fixed ${results.fixedImages} images across ${results.totalStories} stories! 🎉`
          );
        } else {
          const successRate = results.totalImages > 0 ? Math.round((results.fixedImages / results.totalImages) * 100) : 0;
          showErrorToast(
            'Partial Success', 
            `Fixed ${results.fixedImages}/${results.totalImages} images (${successRate}%). ${results.failedImages} images still need attention.`
          );
        }
      }

      setFixResults(results);
      onFixComplete?.();

    } catch (error: any) {
      console.error('Error fixing images:', error);
      showErrorToast('Fix Failed', error.message || 'Failed to fix images');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
            Image Display Issues?
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            Some images may not display properly due to Appwrite storage limitations. 
            Click below to automatically fix image URLs for better compatibility.
          </p>
          
          {fixResults && (
            <div className="mb-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded border">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Fix Results:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {storyId ? (
                  <>
                    <div>Total Images: <span className="font-medium">{fixResults.totalImages}</span></div>
                    <div>Fixed: <span className="font-medium text-green-600">{fixResults.fixedImages}</span></div>
                    <div>Failed: <span className="font-medium text-red-600">{fixResults.failedImages}</span></div>
                    <div>Success Rate: <span className="font-medium">
                      {fixResults.totalImages > 0 ? Math.round((fixResults.fixedImages / fixResults.totalImages) * 100) : 0}%
                    </span></div>
                  </>
                ) : (
                  <>
                    <div>Stories: <span className="font-medium">{fixResults.totalStories}</span></div>
                    <div>Total Images: <span className="font-medium">{fixResults.totalImages}</span></div>
                    <div>Fixed: <span className="font-medium text-green-600">{fixResults.fixedImages}</span></div>
                    <div>Failed: <span className="font-medium text-red-600">{fixResults.failedImages}</span></div>
                  </>
                )}
              </div>
              
              {fixResults.errors && fixResults.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                    View Errors ({fixResults.errors.length})
                  </summary>
                  <div className="mt-1 text-xs text-red-600 dark:text-red-400 max-h-20 overflow-y-auto">
                    {fixResults.errors.slice(0, 5).map((error: string, idx: number) => (
                      <div key={idx} className="truncate">{error}</div>
                    ))}
                    {fixResults.errors.length > 5 && (
                      <div className="text-gray-500">... and {fixResults.errors.length - 5} more</div>
                    )}
                  </div>
                </details>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleFixImages}
              disabled={isFixing}
              size="sm"
              variant="primary"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isFixing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Fixing...</span>
                </div>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {storyId ? 'Fix This Story' : 'Fix All Images'}
                </>
              )}
            </Button>
            
            {fixResults && (
              <Button
                onClick={() => window.location.reload()}
                size="sm"
                variant="secondary"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Page
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageFixHelper;