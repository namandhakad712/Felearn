import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StorySlide } from '../../types';

interface LiveSlideViewProps {
  slides: StorySlide[];
  images: string[];
  isGenerating: boolean;
  className?: string;
}

const LiveSlideView: React.FC<LiveSlideViewProps> = ({
  slides,
  images,
  isGenerating,
  className = ''
}) => {
  const [displayedSlides, setDisplayedSlides] = useState<StorySlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Update displayed slides when new slides are added
  useEffect(() => {
    if (slides.length > displayedSlides.length) {
      // Add new slides with animation
      setDisplayedSlides(slides);
      setCurrentSlideIndex(slides.length - 1); // Focus on the latest slide
    }
  }, [slides, displayedSlides.length]);

  // Auto-advance to the latest slide when new images are generated
  useEffect(() => {
    if (images.length > 0) {
      setCurrentSlideIndex(images.length - 1);
    }
  }, [images.length]);

  const slideVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50,
      rotateY: -15
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.3 }
    }
  };

  const imageVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5,
      filter: "blur(10px)"
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 20,
        duration: 1.2
      }
    }
  };

  const captionVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        delay: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: { 
      x: "100%",
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "linear"
      }
    }
  };

  if (displayedSlides.length === 0 && !isGenerating) {
    return (
      <div className={`${className} flex items-center justify-center py-16`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">Ready to Generate</p>
            <p className="text-sm mt-1">Images will appear here as they are created</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      {/* Header with generation status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Live Story Generation
          </h3>
          {isGenerating && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                Generating...
              </span>
            </div>
          )}
        </div>
        
        {displayedSlides.length > 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {displayedSlides.length} slide{displayedSlides.length !== 1 ? 's' : ''} generated
          </div>
        )}
      </div>

      {/* Enhanced main slide display area */}
      <div className="relative min-h-[600px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-800 rounded-3xl p-8 overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/20">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 animate-pulse"></div>
        
        {/* Enhanced background pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.15'%3E%3Cpath d='M40 40c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm20-20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Floating orbs for ambient effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-xl"
              style={{
                left: `${20 + i * 20}%`,
                top: `${10 + i * 15}%`,
              }}
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 2,
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {displayedSlides.length > 0 && currentSlideIndex < displayedSlides.length && (
            <motion.div
              key={currentSlideIndex}
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative z-10 flex flex-col items-center justify-center h-full"
            >
              {/* Slide counter */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-4 right-4 bg-black bg-opacity-20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium"
              >
                {currentSlideIndex + 1} / {displayedSlides.length}
              </motion.div>

              {/* Enhanced Image container with advanced effects */}
              {displayedSlides[currentSlideIndex]?.image && (
                <motion.div
                  variants={imageVariants}
                  initial="hidden"
                  animate="visible"
                  className="relative mb-8 group"
                >
                  {/* Animated border gradient */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-75 blur-sm transition-opacity duration-500 animate-pulse"></div>
                  
                  {/* Main image container */}
                  <div className="relative bg-white dark:bg-gray-800 rounded-xl p-2 shadow-2xl">
                    {/* Shimmer effect while loading */}
                    <div className="absolute inset-2 bg-gradient-to-r from-transparent via-white/30 to-transparent overflow-hidden rounded-lg">
                      <motion.div
                        variants={shimmerVariants}
                        initial="initial"
                        animate="animate"
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                      />
                    </div>

                    <motion.img
                      src={displayedSlides[currentSlideIndex].image}
                      alt={`Generated slide ${currentSlideIndex + 1}`}
                      className="w-full max-h-96 object-contain rounded-lg shadow-lg"
                      whileHover={{ 
                        scale: 1.02,
                        rotateY: 2,
                        rotateX: 1
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      onError={(e) => {
                        console.error("Live slide image failed to load:", 
                          displayedSlides[currentSlideIndex].image?.substring(0, 50) + "...");
                        e.currentTarget.src = "/assets/placeholder-image.png";
                        e.currentTarget.alt = "Image failed to load";
                      }}
                    />
                    
                    {/* Reflection effect */}
                    <div className="absolute inset-2 bg-gradient-to-t from-white/10 to-transparent rounded-lg pointer-events-none"></div>
                  </div>

                  {/* Multi-layered glow effects */}
                  <div className="absolute -inset-6 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
                  <div className="absolute -inset-8 bg-gradient-to-r from-cyan-400/5 via-indigo-400/5 to-purple-400/5 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-20" />
                  
                  {/* Floating particles effect */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-60"
                        style={{
                          left: `${20 + i * 15}%`,
                          top: `${10 + i * 10}%`,
                        }}
                        animate={{
                          y: [-10, -30, -10],
                          opacity: [0, 0.6, 0],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.5,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Caption with Indie Flower font and enhanced styling */}
              {displayedSlides[currentSlideIndex]?.text && (
                <motion.div
                  variants={captionVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-center max-w-3xl"
                >
                  <div className="relative">
                    {/* Decorative elements */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-60 animate-pulse"></div>
                    <div className="absolute -top-1 -right-3 w-3 h-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute -bottom-2 left-1/4 w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    
                    <motion.div 
                      className="relative text-2xl md:text-3xl text-gray-800 dark:text-gray-200 leading-relaxed px-8 py-6 bg-gradient-to-br from-white/70 via-white/60 to-white/50 dark:from-gray-800/70 dark:via-gray-800/60 dark:to-gray-800/50 backdrop-blur-md rounded-3xl border border-white/30 dark:border-gray-700/30 shadow-2xl"
                      style={{ 
                        fontFamily: "'Indie Flower', cursive",
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      {/* Quote marks */}
                      <span className="absolute -top-2 -left-2 text-4xl text-indigo-400/60 font-serif">"</span>
                      <span className="absolute -bottom-4 -right-2 text-4xl text-indigo-400/60 font-serif">"</span>
                      
                      {/* Caption text with enhanced processing */}
                      <span className="relative z-10 block">
                        {(() => {
                          const text = String(displayedSlides[currentSlideIndex].text || '');
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
                      </span>
                      
                      {/* Subtle gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-3xl pointer-events-none"></div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced loading state for next image */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 bg-gradient-to-r from-white/90 to-blue-50/90 dark:from-gray-800/90 dark:to-slate-700/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-white/30 dark:border-gray-600/30"
          >
            <div className="relative">
              <div className="w-5 h-5 border-3 border-blue-500/30 rounded-full"></div>
              <div className="absolute inset-0 w-5 h-5 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 tracking-wide">
              ✨ Generating next slide...
            </span>
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Enhanced navigation dots */}
      {displayedSlides.length > 1 && (
        <div className="flex justify-center mt-8 space-x-3">
          {displayedSlides.map((_, index) => (
            <motion.button
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
              onClick={() => setCurrentSlideIndex(index)}
              className={`relative transition-all duration-300 ${
                index === currentSlideIndex
                  ? 'w-8 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg'
                  : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded-full'
              }`}
              whileHover={{ 
                scale: index === currentSlideIndex ? 1.1 : 1.2,
                y: -2
              }}
              whileTap={{ scale: 0.9 }}
            >
              {index === currentSlideIndex && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm opacity-50"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Enhanced quick navigation */}
      {displayedSlides.length > 1 && (
        <div className="flex justify-between items-center mt-6">
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
            disabled={currentSlideIndex === 0}
            className="group px-6 py-3 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2">
              <motion.svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                whileHover={{ x: -2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </motion.svg>
              <span className="font-medium">Previous</span>
            </div>
          </motion.button>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-200/30 dark:border-gray-600/30">
            {currentSlideIndex + 1} of {displayedSlides.length}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05, x: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentSlideIndex(Math.min(displayedSlides.length - 1, currentSlideIndex + 1))}
            disabled={currentSlideIndex === displayedSlides.length - 1}
            className="group px-6 py-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2">
              <span className="font-medium">Next</span>
              <motion.svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                whileHover={{ x: 2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </motion.svg>
            </div>
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default LiveSlideView;