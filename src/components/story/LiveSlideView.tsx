import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StorySlide } from '../../types';

interface LiveSlideViewProps {
  slides: StorySlide[];
  images: string[];
  isGenerating: boolean;
  className?: string;
  totalSlides?: number; // Expected total number of slides
  tokens?: number; // Token count used for generation
}

const LiveSlideView: React.FC<LiveSlideViewProps> = ({
  slides,
  images,
  isGenerating,
  className = '',
  totalSlides, // No default - will be calculated dynamically
  tokens = 0 // Token count with default value
}) => {
  const [displayedSlides, setDisplayedSlides] = useState<StorySlide[]>([]);

  // Update displayed slides when new slides are added
  useEffect(() => {
    setDisplayedSlides(slides);
  }, [slides]);

  const slideVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      x: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6
      }
    }
  };

  const generatingVariants = {
    initial: { 
      opacity: 0.3,
      scale: 0.95
    },
    animate: { 
      opacity: [0.3, 0.7, 0.3],
      scale: [0.95, 1, 0.95],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: { 
      x: "100%",
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "linear"
      }
    }
  };

  // Calculate dynamic total slides - show current + 1 generating if still generating
  const dynamicTotalSlides = totalSlides || (isGenerating ? displayedSlides.length + 1 : displayedSlides.length);

  // Create placeholder slides for generating animation
  const createPlaceholderSlides = () => {
    const placeholders = [];
    // Only show one generating placeholder if still generating
    if (isGenerating && displayedSlides.length < dynamicTotalSlides) {
      placeholders.push({
        id: `placeholder-${displayedSlides.length}`,
        image: '',
        text: '',
        isPlaceholder: true,
        index: displayedSlides.length
      });
    }
    return placeholders;
  };

  const allSlides = [...displayedSlides, ...createPlaceholderSlides()];

  const renderSlide = (slide: any, index: number) => {
    const isPlaceholder = slide.isPlaceholder;
    const isGenerating = isPlaceholder && index === displayedSlides.length;

    return (
      <motion.div
        key={slide.id || index}
        variants={slideVariants}
        initial="hidden"
        animate="visible"
        className="flex-shrink-0 w-64 sm:w-72 md:w-80 lg:w-96 mx-1 sm:mx-2"
      >
        {/* Cohesive Slide Card - Image + Caption as single unit */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Image Section - Flexible height */}
          <div className="relative w-full aspect-[4/3] bg-gray-50 dark:bg-gray-700 flex-shrink-0">
            {isPlaceholder ? (
              // Generating animation for placeholder slides
              <motion.div
                variants={isGenerating ? generatingVariants : {}}
                initial="initial"
                animate={isGenerating ? "animate" : "initial"}
                className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"
              >
                {isGenerating ? (
                  <div className="text-center">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                      <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="indie-flower text-gray-600 dark:text-gray-400 mt-4 text-lg">
                      Generating...
                    </p>
                  </div>
                ) : (
                  <div className="text-center opacity-50">
                    <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="indie-flower text-gray-400 dark:text-gray-600 mt-2">
                      Slide {index + 1}
                    </p>
                  </div>
                )}
                
                {/* Shimmer effect for generating slide */}
                {isGenerating && (
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                      variants={shimmerVariants}
                      initial="initial"
                      animate="animate"
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                  </div>
                )}
              </motion.div>
            ) : (
              // Actual generated slide
              <motion.img
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
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
                    ctx.font = 'bold 24px "IndieFlower", cursive';
                    ctx.textAlign = 'center';
                    ctx.fillText(`Slide ${index + 1}`, 400, 280);
                    ctx.font = '18px "IndieFlower", cursive';
                    ctx.fillText('Image loading...', 400, 320);
                    
                    (e.target as HTMLImageElement).src = canvas.toDataURL();
                  }
                }}
              />
            )}
            
            {/* Slide Number Badge */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
              {index + 1} / {dynamicTotalSlides}
            </div>
          </div>
          
          {/* Caption Section - Below Image - Flexible height */}
          <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 flex-grow flex items-center justify-center min-h-[100px] sm:min-h-[120px]">
            {!isPlaceholder && slide.text ? (
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="story-caption text-gray-800 dark:text-gray-200"
              >
                {(() => {
                  const text = String(slide.text || '');
                  let cleanText = text
                    .replace(/\*\*Image \d+:\*\*/g, '')
                    .replace(/Caption:/g, '')
                    .replace(/\*\*/g, '')
                    .replace(/^["']|["']$/g, '')
                    .trim();
                  
                  // Extract text from quotes if present
                  const captionMatch = cleanText.match(/"([^"]+)"/);
                  if (captionMatch && captionMatch[1]) {
                    cleanText = captionMatch[1];
                  }
                  
                  return cleanText;
                })()}
              </motion.p>
            ) : (
              <p className="indie-flower text-gray-400 dark:text-gray-600 text-center italic">
                {isGenerating ? 'Caption generating...' : 'Waiting for content...'}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`${className} relative max-w-full`}>
      {/* Horizontal Slideshow */}
      <div className="w-full overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <div className="flex items-stretch justify-start px-2 sm:px-4 py-6 sm:py-8 gap-2 sm:gap-4" style={{ width: 'max-content', minWidth: '100%' }}>
          {allSlides.map((slide, index) => renderSlide(slide, index))}
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="flex flex-col sm:flex-row items-center justify-center mt-4 gap-2 sm:gap-3">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-48 sm:w-64">
          <motion.div
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(displayedSlides.length / dynamicTotalSlides) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
          {displayedSlides.length} / {isGenerating ? '∞' : dynamicTotalSlides} slides
        </span>
      </div>
      
      {/* Token count display */}
      {tokens > 0 && (
        <div className="flex justify-center mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            {tokens.toLocaleString()} tokens used
          </span>
        </div>
      )}
    </div>
  );
};

export default LiveSlideView;