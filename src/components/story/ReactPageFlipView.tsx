import React, { useRef, forwardRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import HTMLFlipBook from 'react-pageflip';
import { Story, StorySlide } from '../../types';

interface ReactPageFlipViewProps {
  story: Story;
  onClose: () => void;
}

// Page component using forwardRef as required by react-pageflip
const StoryPage = forwardRef<HTMLDivElement, { slide: StorySlide; index: number; totalPages: number }>((props, ref) => {
  const { slide, index, totalPages } = props;



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
        
        {/* Slide Number Badge */}
        <div className="story-page-badge">
          {index + 1} / {totalPages}
        </div>
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

StoryPage.displayName = 'StoryPage';

const ReactPageFlipView: React.FC<ReactPageFlipViewProps> = ({ story, onClose }) => {
  const flipBookRef = useRef<any>(null);
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [flipBookSize, setFlipBookSize] = React.useState({ width: 400, height: 600 });
  const slides = story.slides || [];
  const hasSlides = slides.length > 0;

  // Responsive sizing
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



  // Event handlers
  const onFlip = useCallback((e: any) => {
    // Page flipped
  }, []);

  const onChangeOrientation = useCallback((orientation: string) => {
    // Orientation changed
  }, []);

  const onChangeState = useCallback((state: string) => {
    // State changed
  }, []);

  const onInit = useCallback((data: any) => {
    // FlipBook initialized
  }, []);

  // Navigation methods
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

  const goToPage = (pageNum: number) => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().turnToPage(pageNum);
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {story.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {hasSlides ? `${slides.length} slides` : 'No slides available'}
            </p>
          </div>
          
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2 mr-4">
            <button
              onClick={zoomOut}
              disabled={zoomLevel <= 0.5}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            
            <button
              onClick={resetZoom}
              className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Reset Zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            
            <button
              onClick={zoomIn}
              disabled={zoomLevel >= 2}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom In"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
                  onFlip={onFlip}
                  onChangeOrientation={onChangeOrientation}
                  onChangeState={onChangeState}
                  onInit={onInit}
                >
                  {slides.map((slide, index) => (
                    <StoryPage
                      key={index}
                      slide={slide}
                      index={index}
                      totalPages={slides.length}
                    />
                  ))}
                </HTMLFlipBook>
              </div>
            </div>
          )}
        </div>

        {/* Page Indicators */}
        {hasSlides && (
          <div className="flex items-center justify-center p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index)}
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 hover:scale-125"
                />
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {hasSlides && (
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-center">
                <div className="flex items-center space-x-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <span className="hidden sm:inline">Click & drag corners to flip</span>
                  <span className="sm:hidden">Drag corners to flip</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Swipe on mobile devices</span>
                  <span className="sm:hidden">Swipe to navigate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Use chevrons or zoom controls</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ReactPageFlipView;