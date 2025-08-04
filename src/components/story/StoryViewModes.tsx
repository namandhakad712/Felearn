import React, { useState, forwardRef, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import HTMLFlipBook from 'react-pageflip';
import { Story, StorySlide } from '../../types';
import { cleanupGSAPAnimations, safeGSAPFromTo } from '../../utils/gsapUtils';
// import ReactPageFlipView from './ReactPageFlipView'; // Unused import

interface StoryViewModesProps {
  story: Story;
  onClose: () => void;
}

type ViewMode = 'book' | 'scroll';

// Page component for flipbook
const FlipBookPage = forwardRef<HTMLDivElement, { slide: StorySlide; index: number; totalPages: number }>((props, ref) => {
  const { slide, index } = props;
  // const totalPages = props.totalPages; // Unused variable

  return (
    <div className="story-page" ref={ref}>
      {/* Image Section */}
      <div className="story-page-image">
        {slide.image ? (
          <img
            src={slide.image}
            alt={`Slide ${index + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
            onError={(e) => {
              // Create a fallback canvas image
              const canvas = document.createElement('canvas');
              canvas.width = 400;
              canvas.height = 300;
              const ctx = canvas.getContext('2d');
              
              if (ctx) {
                // Create gradient background
                const gradient = ctx.createLinearGradient(0, 0, 400, 300);
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 400, 300);
                
                // Add text
                ctx.fillStyle = 'white';
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`Slide ${index + 1}`, 200, 140);
                ctx.font = '14px Arial';
                ctx.fillText('Image not available', 200, 170);
                
                (e.target as HTMLImageElement).src = canvas.toDataURL();
              }
            }}
          />
        ) : (
          <div 
            style={{ 
              textAlign: 'center', 
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              height: '100%',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
            <p style={{ margin: '8px 0 4px 0', fontSize: '16px' }}>Slide {index + 1}</p>
            <p style={{ fontSize: '12px', margin: 0 }}>No image available</p>
          </div>
        )}
      </div>
      
      {/* Caption Section */}
      <div className="story-page-text">
        <p className="story-page-caption">
          {slide.text ? 
            slide.text.replace(/\*\*/g, '').replace(/^["']|["']$/g, '').trim() : 
            'AI-generated illustration'
          }
        </p>
      </div>
    </div>
  );
});

FlipBookPage.displayName = 'FlipBookPage';

const StoryViewModes: React.FC<StoryViewModesProps> = ({ story, onClose }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('book');
  // const [currentPage, setCurrentPage] = useState(0); // Unused state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showBookAnimation, setShowBookAnimation] = useState(true);
  const flipBookRef = useRef<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Ensure modal is visible when opened
  useEffect(() => {
    // Scroll to top of page when modal opens
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide book animation after 3 seconds
    const timer = setTimeout(() => {
      setShowBookAnimation(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const slides = story.slides || [];
  const hasSlides = slides.length > 0;

  // const nextSlide = () => { // Unused function
  //   setCurrentPage((prev) => (prev + 1) % slides.length);
  // };

  // const prevSlide = () => { // Unused function
  //   setCurrentPage((prev) => (prev - 1 + slides.length) % slides.length);
  // };

  // const goToSlide = (index: number) => { // Unused function
  //   setCurrentPage(index);
  // };

  const EmbeddedImageSlide: React.FC<{ slide: StorySlide; index: number }> = ({ slide, index }) => (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Image Section */}
      <div className="relative w-full aspect-[4/3] bg-gray-50 dark:bg-gray-700">
        <img
          src={slide.image || ''}
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

  // Add flipbook functionality
  const [flipBookSize, setFlipBookSize] = React.useState({ width: 400, height: 600 });

  // Responsive sizing for flipbook
  React.useEffect(() => {
    const updateSize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      let width, height;
      
      if (screenWidth < 640) { // Mobile
        width = Math.min(300, screenWidth - 40);
        height = Math.min(450, screenHeight * 0.6);
      } else if (screenWidth < 1024) { // Tablet
        width = Math.min(350, screenWidth * 0.7);
        height = Math.min(525, screenHeight * 0.7);
      } else { // Desktop
        width = 400;
        height = 600;
      }
      
      setFlipBookSize({ width, height });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Flipbook navigation methods
  const nextPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const prevPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  // const goToPage = (pageNum: number) => { // Unused function
  //   if (flipBookRef.current) {
  //     flipBookRef.current.pageFlip().turnToPage(pageNum);
  //   }
  // };

  // Zoom methods
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  // Cleanup GSAP animations on component unmount
  useEffect(() => {
    return () => {
      cleanupGSAPAnimations(modalRef);
      cleanupGSAPAnimations(headerRef);
      cleanupGSAPAnimations(contentRef);
    };
  }, []);

  // 🚀 EPIC GSAP ANIMATIONS FOR STORY VIEW!
  useGSAP(() => {
    // Check if refs exist before animating
    if (!modalRef.current || !headerRef.current || !contentRef.current) {
      return;
    }

    // 🎭 MODAL ENTRANCE ANIMATION
    safeGSAPFromTo(modalRef.current,
      {
        scale: 0.7,
        opacity: 0,
        rotationY: -15,
        y: 50
      },
      {
        scale: 1,
        opacity: 1,
        rotationY: 0,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.4)"
      }
    );

    // 🌟 HEADER SLIDE IN
    safeGSAPFromTo(headerRef.current,
      {
        y: -30,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        delay: 0.2,
        ease: "power3.out"
      }
    );

    // 🎨 CONTENT FADE IN
    safeGSAPFromTo(contentRef.current,
      {
        y: 20,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        delay: 0.4,
        ease: "power2.out"
      }
    );

    // 🔥 VIEW MODE TOGGLE ANIMATIONS
    const toggleButtons = document.querySelectorAll('.view-toggle-btn');
    toggleButtons.forEach((btn, index) => {
      safeGSAPFromTo(btn,
        {
          scale: 0.8,
          opacity: 0,
          x: -20
        },
        {
          scale: 1,
          opacity: 1,
          x: 0,
          duration: 0.4,
          delay: 0.6 + (index * 0.1),
          ease: "back.out(1.7)"
        }
      );
    });

    // Cleanup function
    return () => {
      cleanupGSAPAnimations(modalRef);
      cleanupGSAPAnimations(headerRef);
      cleanupGSAPAnimations(contentRef);
    };

  }, { scope: modalRef });

  // 🎪 VIEW MODE SWITCH ANIMATION
  const handleViewModeChange = (newMode: ViewMode) => {
    if (newMode !== viewMode && contentRef.current) {
      // Animate out current content
      safeGSAPFromTo(contentRef.current,
        {},
        {
          opacity: 0,
          scale: 0.95,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            setViewMode(newMode);
            // Animate in new content
            safeGSAPFromTo(contentRef.current,
              {
                opacity: 0,
                scale: 0.95,
                y: 20
              },
              {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.4,
                ease: "back.out(1.4)"
              }
            );
          }
        }
      );
    }
  };

  // Render the main modal with toggle always visible
  const renderBookContent = () => {
    if (!hasSlides) {
      return (
        <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">No slides available</p>
            <p className="text-sm mt-1">This story doesn't have any image slides</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex items-center justify-center p-4 sm:p-8 relative">
        {/* Chevron Navigation - Left */}
        <button
          onClick={prevPage}
          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 sm:p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
          title="Previous Page"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Chevron Navigation - Right */}
        <button
          onClick={nextPage}
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 sm:p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
          title="Next Page"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        {/* React PageFlip Component with Zoom */}
        <div 
          style={{ 
            transform: `scale(${zoomLevel})`,
            transition: 'transform 0.3s ease'
          }}
        >
          <HTMLFlipBook
            ref={flipBookRef}
            width={flipBookSize.width}
            height={flipBookSize.height}
            size="fixed"
            minWidth={250}
            maxWidth={600}
            minHeight={350}
            maxHeight={800}
            drawShadow={true}
            flippingTime={800}
            usePortrait={true}
            startZIndex={0}
            autoSize={false}
            maxShadowOpacity={0.6}
            showCover={false}
            mobileScrollSupport={true}
            swipeDistance={20}
            clickEventForward={true}
            useMouseEvents={true}
            renderOnlyPageLengthChange={false}
            className="react-pageflip"
            style={{}}
            startPage={0}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            {slides.map((slide, index) => (
              <FlipBookPage
                key={index}
                slide={slide}
                index={index}
                totalPages={slides.length}
              />
            ))}
          </HTMLFlipBook>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={modalContainerRef}
      className="story-view-modal"
      style={{ alignItems: 'flex-start', paddingTop: '0.5rem' }}
    >
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[199]"
        onClick={onClose}
      />
      
      <div
        ref={modalRef}
        className="modal-content bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden transform-gpu z-[200] relative"
      >
        {/* Book Animation Overlay */}
        <AnimatePresence>
          {showBookAnimation && viewMode === 'book' && (
            <motion.div 
              className="absolute inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center z-50"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center">
                <img 
                  src="/videos/library-book.gif" 
                  alt="Book Animation"
                  className="w-48 h-48 mx-auto mb-6"
                />
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Book View
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Loading your story...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Header */}
        <div ref={headerRef} className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
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
                  onClick={() => handleViewModeChange('book')}
                  className={`view-toggle-btn p-2 rounded-md transition-all duration-300 transform hover:scale-110 ${
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
                  onClick={() => handleViewModeChange('scroll')}
                  className={`view-toggle-btn p-2 rounded-md transition-all duration-300 transform hover:scale-110 ${
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

            {/* Zoom Controls - Available in both modes */}
            {hasSlides && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={zoomOut}
                  disabled={zoomLevel <= 0.5}
                  className="view-toggle-btn p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 active:scale-95"
                  title="Zoom Out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                  </svg>
                </button>
                
                <button
                  onClick={resetZoom}
                  className="view-toggle-btn px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-300 transform hover:scale-110 active:scale-95"
                  title="Reset Zoom"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                
                <button
                  onClick={zoomIn}
                  disabled={zoomLevel >= 2}
                  className="view-toggle-btn p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 active:scale-95"
                  title="Zoom In"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
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
        <div ref={contentRef} className="flex-1 overflow-hidden">
          {viewMode === 'book' ? (
            <motion.div
              key="book"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              {renderBookContent()}
            </motion.div>
          ) : (
            <motion.div
              key="scroll"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col"
            >
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
                <>
                  {/* Scroll View - All Slides with Zoom */}
                  <div 
                    className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 scroll-smooth story-scroll-container"
                  >
                    <div 
                      style={{ 
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      {slides.map((slide, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            delay: index * 0.1,
                            duration: 0.6,
                            ease: [0.25, 0.46, 0.45, 0.94]
                          }}
                          className="w-full max-w-4xl mx-auto mb-6 sm:mb-8"
                          whileInView={{ 
                            opacity: 1, 
                            y: 0,
                            transition: { duration: 0.6 }
                          }}
                          viewport={{ once: true, margin: "-100px" }}
                        >
                          <EmbeddedImageSlide slide={slide} index={index} />
                        </motion.div>
                      ))}
                      
                      {/* Scroll to top button */}
                      <div className="flex justify-center pt-8 pb-4">
                        <button
                          onClick={() => {
                            const scrollContainer = document.querySelector('.story-scroll-container');
                            if (scrollContainer) {
                              scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className="flex items-center space-x-2 px-6 py-3 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 rounded-full transition-all duration-200 text-indigo-700 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 shadow-sm hover:shadow-md transform hover:scale-105"
                          title="Scroll to top"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          <span className="text-sm font-medium">Back to top</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryViewModes;