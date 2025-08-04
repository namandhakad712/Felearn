import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui';
// import { Carousel } from '../ui'; // Unused import
import LiveSlideView from './LiveSlideView';
import { StorySlide } from '../../types';
import { fixSingleImageUrl, createStoryFallbackImage } from '../../utils/imageUrlFixer';

interface StoryDisplayProps {
  story: string;
  images?: string[];
  slides?: StorySlide[];
  title?: string;
  onSave?: () => void;
  isSaving?: boolean;
  onExport?: () => void;
  onNewStory?: () => void;
  isLoading?: boolean;
  isGenerating?: boolean;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({
  story,
  images = [],
  slides = [],
  title,
  onSave,
  isSaving = false,
  onExport,
  onNewStory,
  isLoading = false,
  isGenerating = false
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [fixedImages, setFixedImages] = useState<string[]>([]);
  const [imageFixingStatus, setImageFixingStatus] = useState<'idle' | 'fixing' | 'done'>('idle');

  // Auto-fix images when they're loaded
  useEffect(() => {
    const fixImages = async () => {
      if (images.length === 0 || imageFixingStatus !== 'idle') return;
      
      setImageFixingStatus('fixing');
      console.log('🔧 Auto-fixing images for story display...');
      
      const fixed: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const result = await fixSingleImageUrl(images[i]);
        fixed.push(result.fixedUrl || images[i]);
      }
      
      setFixedImages(fixed);
      setImageFixingStatus('done');
      console.log('✅ Image fixing completed for story display');
    };

    fixImages();
  }, [images, imageFixingStatus]);

  // Use fixed images if available, otherwise use original images
  const displayImages = fixedImages.length > 0 ? fixedImages : images;

  // Extract title from story if not provided
  const storyLines = story.split('\n').filter(line => line.trim());
  const extractedTitle = title || storyLines[0] || 'Untitled Story';
  // const storyContent = title ? story : storyLines.slice(1).join('\n'); // Unused variable

  // const handleImageClick = (index: number) => { // Unused function
  //   setSelectedImageIndex(index);
  //   setIsImageModalOpen(true);
  // };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  if (isLoading) {
    return (
      <div className="mt-8 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 max-w-6xl mx-auto space-y-6 w-full overflow-hidden"
    >
      {/* Header with title and actions */}
      {(story || !isGenerating) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title || "Explain Things with Lots of Tiny Cats"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
        
        <div className="flex items-center space-x-3">
          {onSave && (
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Story'
              )}
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
            >
              Export
            </button>
          )}
          {onNewStory && (
            <button
              onClick={onNewStory}
              className="px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors font-medium text-sm"
            >
              New Story
            </button>
          )}
        </div>
        </div>
      )}

      {/* Live Slide View - Shows images as they're generated */}
      <div className="mb-8 w-full max-w-full overflow-hidden">
        <Card className="p-0 overflow-hidden">
          {imageFixingStatus === 'fixing' && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Optimizing images for better display...</span>
              </div>
            </div>
          )}
          <LiveSlideView 
            slides={slides.map((slide, idx) => ({
              ...slide,
              image: displayImages[idx] || slide.image
            }))}
            images={displayImages}
            isGenerating={isGenerating}
            className="p-4 sm:p-6"
            // tokens={story?.tokens || 0} // story is a string, not an object with tokens
          />
          
          {/* Token Usage Display */}
          {/* story?.tokens is not valid since story is a string */}
          {slides.length > 0 && (
            <div className="px-4 sm:px-6 pb-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {/* Calculate tokens from story content length instead */}
                  <span>{Math.ceil((story.length || 0) / 4)} tokens used</span>
                </span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span>{slides.length} slides generated</span>
              </div>
            </div>
          )}
        </Card>
      </div>



      {/* Image modal for full-screen view */}
      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsImageModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={displayImages[selectedImageIndex]}
                alt={`Story illustration ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
                onError={(e) => {
                  console.error("Modal image failed to load:", 
                    displayImages[selectedImageIndex]?.substring(0, 50) + "...");
                  e.currentTarget.src = createStoryFallbackImage(
                    extractedTitle, 
                    selectedImageIndex + 1,
                    800,
                    600
                  );
                  e.currentTarget.alt = `Story illustration ${selectedImageIndex + 1} (fallback)`;
                }}
              />
              
              {/* Close button */}
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Navigation in modal */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-opacity"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-opacity"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StoryDisplay;