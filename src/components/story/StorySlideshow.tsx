import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';

// Configure marked with proper renderer
const renderer = new marked.Renderer();
renderer.paragraph = function(text) {
  return `<p class="mb-3 text-xl">${text}</p>`;
};

marked.setOptions({
  breaks: true,
  gfm: true,
  renderer: renderer
});
import { StorySlide } from '../../types';

interface StorySlideshowProps {
  slides: StorySlide[];
  className?: string;
}

const StorySlideshow: React.FC<StorySlideshowProps> = ({ slides, className = '' }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const slideshowRef = useRef<HTMLDivElement>(null);

  if (!slides || slides.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No slides available</p>
      </div>
    );
  }

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  // Scroll to active slide when it changes
  useEffect(() => {
    if (slideshowRef.current) {
      const slideElements = slideshowRef.current.querySelectorAll('.slide');
      if (slideElements[activeSlide]) {
        slideElements[activeSlide].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeSlide]);

  return (
    <div className={`${className} relative`}>
      {/* Slideshow container with horizontal scrolling - styled like "main thing" */}
      <div
        ref={slideshowRef}
        className="flex flex-row overflow-x-auto scroll-snap-type-x mandatory overscroll-behavior-x-contain gap-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
        style={{ scrollBehavior: 'smooth' }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide flex-shrink-0 scroll-snap-align-center min-w-[380px] max-w-[600px] mx-auto border border-gray-200 dark:border-gray-700 p-6 rounded-lg bg-white dark:bg-gray-700 flex flex-col items-center font-indie ${index === activeSlide ? 'ring-2 ring-indigo-500' : ''
              } transition-all duration-300 hover:transform hover:-translate-y-1`}
            onClick={() => setActiveSlide(index)}
          >
            {slide.image && (
              <div className="relative">
                <img
                  src={slide.image || ''}
                  alt={`Generated image ${index + 1}`}
                  className="h-[320px] max-w-full object-contain rounded-md"
                  onError={(e) => {
                    console.error("Slide image failed to load:", 
                      slide.image?.substring(0, 50) + "...");
                    e.currentTarget.src = "/assets/placeholder-image.webp";
                    e.currentTarget.alt = "Image failed to load";
                  }}
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1} / {slides.length}
                </div>
              </div>
            )}

            {/* Caption text - styled like tiny-cats reference */}
            {slide.text && (
              <div className="caption mt-4 w-full text-center font-indie text-xl text-gray-800 dark:text-gray-200">
                {/* Handle text properly based on its type */}
                {(() => {
                  // Handle text content safely
                  let textContent = '';
                  
                  // Ensure slide.text is treated as a string
                  if (slide.text) {
                    // Clean up the text to extract just the caption
                    const text = String(slide.text);
                    
                    // Extract the caption part (text inside quotes)
                    const captionMatch = text.match(/"([^"]+)"/);
                    if (captionMatch && captionMatch[1]) {
                      // Use just the quoted text as the caption
                      textContent = captionMatch[1];
                    } else {
                      // If no quoted text found, remove markdown formatting
                      textContent = text
                        .replace(/\*\*Image \d+:\*\*/g, '') // Remove **Image X:** 
                        .replace(/Caption:/g, '')           // Remove Caption:
                        .replace(/\*\*/g, '')               // Remove any remaining **
                        .replace(/\n\n/g, ' ')              // Replace double newlines
                        .trim();
                    }
                  } else {
                    textContent = "";
                  }
                  
                  try {
                    // For simple captions, don't use markdown parsing
                    if (textContent.indexOf('*') === -1 && textContent.indexOf('#') === -1) {
                      return <div className="text-xl">{textContent}</div>;
                    } else {
                      // Handle both string and Promise return types from marked.parse
                      const parsedContent = marked.parse(textContent);
                      const htmlContent = typeof parsedContent === 'string' ? parsedContent : textContent;
                      return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
                    }
                  } catch (error) {
                    console.error('Error parsing markdown:', error);
                    // Fallback to plain text display
                    return <div className="text-xl">{textContent}</div>;
                  }
                })()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePrevSlide}
          disabled={activeSlide === 0}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-600 dark:text-gray-400">
          {activeSlide + 1} of {slides.length}
        </span>
        <button
          onClick={handleNextSlide}
          disabled={activeSlide === slides.length - 1}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Slide indicators/dots */}
      {slides.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${index === activeSlide
                ? 'bg-indigo-600'
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StorySlideshow;