import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Story, StorySlide } from '../../types';
import ReactPageFlipView from './ReactPageFlipView';

interface StoryViewModesProps {
  story: Story;
  onClose: () => void;
}

type ViewMode = 'book' | 'scroll';

const StoryViewModes: React.FC<StoryViewModesProps> = ({ story, onClose }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('book');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = story.slides || [];
  const hasSlides = slides.length > 0;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const EmbeddedImageSlide: React.FC<{ slide: StorySlide; index: number }> = ({ slide, index }) => (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Image Section */}
      <div className="relative w-full aspect-[4/3] bg-gray-50 dark:bg-gray-700">
        <img
          src={slide.image}
          alt={`Slide ${index + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
              // Create gradient background
              const gradient = ctx.createLinearGradient(0, 0, 800, 600);
              gradient.addColorStop(0, '#667eea');
              gradient.addColorStop(1, '#764ba2');
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, 800, 600);
              
              // Add some text for fallback
              ctx.fillStyle = 'white';
              ctx.font = 'bold 24px "Indie Flower", cursive';
              ctx.textAlign = 'center';
              ctx.fillText(`Slide ${index + 1}`, 400, 280);
              ctx.font = '18px "Indie Flower", cursive';
              ctx.fillText('Image loading...', 400, 320);
              
              (e.target as HTMLImageElement).src = canvas.toDataURL();
            }
          }}
        />
        
        {/* Slide Number Badge */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
          {index + 1} / {slides.length}
        </div>
      </div>
      
      {/* Caption Section - Below Image */}
      {slide.text && (
        <div className="p-4 sm:p-6 md:p-8 bg-white dark:bg-gray-800">
          <p className="story-caption text-gray-800 dark:text-gray-200">
            {slide.text.replace(/\*\*/g, '').replace(/^["']|["']$/g, '').trim()}
          </p>
        </div>
      )}
      
      {/* If no caption, add some padding */}
      {!slide.text && (
        <div className="p-4 sm:p-6 bg-white dark:bg-gray-800">
          <p className="indie-flower text-gray-500 dark:text-gray-400 text-base sm:text-lg text-center italic">
            AI-generated illustration
          </p>
        </div>
      )}
    </div>
  );

  // If book mode is selected, use ReactPageFlipView
  if (viewMode === 'book') {
    return <ReactPageFlipView story={story} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {story.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {hasSlides ? `${slides.length} slides` : 'No slides available'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            {hasSlides && (
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('book')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'book'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  title="Book View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('scroll')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'scroll'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  title="Scroll View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {!hasSlides ? (
            <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">No slides available</p>
                <p className="text-sm mt-1">This story doesn't have any image slides</p>
              </div>
            </div>
          ) : (
            <motion.div
              key="scroll"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col"
            >
              {/* Scroll View - All Slides */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {slides.map((slide, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full max-w-4xl mx-auto"
                  >
                    <EmbeddedImageSlide slide={slide} index={index} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StoryViewModes;