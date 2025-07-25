import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Carousel } from '../ui';
import StorySlideshow from './StorySlideshow';
import { StorySlide } from '../../types';

interface StoryDisplayProps {
  story: string;
  images?: string[];
  slides?: StorySlide[];
  title?: string;
  onSave?: () => void;
  onExport?: () => void;
  onNewStory?: () => void;
  isLoading?: boolean;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({
  story,
  images = [],
  slides = [],
  title,
  onSave,
  onExport,
  onNewStory,
  isLoading = false
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Extract title from story if not provided
  const storyLines = story.split('\n').filter(line => line.trim());
  const extractedTitle = title || storyLines[0] || 'Untitled Story';
  const storyContent = title ? story : storyLines.slice(1).join('\n');

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageModalOpen(true);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
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
      className="mt-8 max-w-6xl mx-auto space-y-6"
    >
      {/* Header with title and actions */}
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
            >
              Save Story
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

      {/* Always prioritize the slideshow display */}
      <div className="mb-8">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            AI Generated Images for: {title || 'Your Prompt'}
          </h3>
          
          {slides && slides.length > 0 ? (
            <StorySlideshow slides={slides} />
          ) : images && images.length > 0 ? (
            <div className="space-y-8">
              {/* If we have images but no slides, create a simple slideshow */}
              {images.map((image, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="relative w-full max-w-2xl mx-auto">
                    <img
                      src={image}
                      alt={`Generated image ${index + 1}`}
                      className="w-full rounded-lg shadow-lg cursor-pointer"
                      onClick={() => handleImageClick(index)}
                      onError={(e) => {
                        console.error("Image failed to load:", image.substring(0, 50) + "...");
                        e.currentTarget.src = "/assets/placeholder-image.png";
                        e.currentTarget.alt = "Image failed to load";
                      }}
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {index + 1} / {images.length}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Placeholder when no images or slides */
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">No images generated yet</p>
                <p className="text-xs mt-1">Images will appear here as they are generated</p>
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
                src={images[selectedImageIndex]}
                alt={`Story illustration ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
                onError={(e) => {
                  console.error("Modal image failed to load:", 
                    images[selectedImageIndex]?.substring(0, 50) + "...");
                  e.currentTarget.src = "/assets/placeholder-image.png";
                  e.currentTarget.alt = "Image failed to load";
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
              {images.length > 1 && (
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