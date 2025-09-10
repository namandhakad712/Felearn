import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { StorySlide } from '../../types';

// Styled Components for the mobile slider
const SliderContainer = styled.div`
  width: 100%;
  height: 475px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  opacity: 0;
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const CardWrapper = styled.div`
  position: absolute;
  width: 200px;
  height: 300px;
  border: 8px solid #f1f1f1;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0px 22px 70px 4px rgba(1, 14, 39, 1);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  
  .slide-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 8px;
    font-size: 12px;
    text-align: center;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }
  
  &:hover .slide-caption {
    transform: translateY(0);
  }
`;

interface MobileImageSliderProps {
  slides: StorySlide[];
  isGenerating: boolean;
  tokens?: number;
}

const MobileImageSlider: React.FC<MobileImageSliderProps> = ({ 
  slides, 
  isGenerating,
  tokens = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const [gsapLoaded, setGsapLoaded] = useState(false);
  
  // Initialize cards ref array
  useEffect(() => {
    if (containerRef.current) {
      cardsRef.current = Array.from(containerRef.current.querySelectorAll('.card'));
    }
  }, [slides.length]);

  // Dynamically load GSAP and Draggable
  useEffect(() => {
    const loadGsap = async () => {
      if (typeof window !== 'undefined') {
        try {
          const gsapModule = await import('gsap');
          const DraggableModule = await import('gsap/Draggable');
          
          const gsap = gsapModule.default;
          const Draggable = DraggableModule.default;
          
          gsap.registerPlugin(Draggable);
          
          setGsapLoaded(true);
        } catch (error) {
          console.error('Error loading GSAP:', error);
        }
      }
    };
    
    loadGsap();
  }, []);

  // Initialize slider when GSAP is loaded
  useEffect(() => {
    if (!gsapLoaded || typeof window === 'undefined') return;
    
    const initializeSlider = async () => {
      try {
        const gsapModule = await import('gsap');
        const DraggableModule = await import('gsap/Draggable');
        
        const gsap = gsapModule.default;
        const Draggable = DraggableModule.default;
        
        if (!containerRef.current || cardsRef.current.length === 0) return;
        
        const container = containerRef.current;
        let cards = cardsRef.current;
        
        const EASE = "back.out(1.7)";
        const SHADOW = "0px 22px 70px 4px rgba(1, 14, 39, 1)";
        const MAX_DRAG_DISTANCE = 300;
        let direction: string;
        
        gsap.set(container, {
          opacity: 1
        });
        
        // INITIAL CONFIGURATION
        const initialCardSettings = [
          { rot: -24, scale: 0.7, origin: "bottom left", opacity: 0, z: 1 },
          { rot: -16, scale: 0.8, origin: "bottom left", z: 2 },
          { rot: -8, scale: 0.9, origin: "bottom left", z: 3 },
          { rot: 0, scale: 1.0, origin: "bottom center", z: 4 },
          { rot: 8, scale: 0.9, origin: "bottom right", z: 3 },
          { rot: 16, scale: 0.8, origin: "bottom right", z: 2 },
          { rot: 24, scale: 0.7, origin: "bottom right", opacity: 0, z: 1 }
        ];
        
        cards.forEach((card, i) => {
          if (i < initialCardSettings.length) {
            gsap.set(card, {
              rotation: initialCardSettings[i].rot,
              scale: initialCardSettings[i].scale,
              transformOrigin: initialCardSettings[i].origin,
              opacity: initialCardSettings[i].opacity ?? 1,
              boxShadow: SHADOW,
              zIndex: initialCardSettings[i].z
            });
          }
        });
        
        // DRAGGABLE SETUP
        let proxy = document.createElement("div");
        
        Draggable.create(proxy, {
          trigger: container,
          type: "x",
          bounds: { minX: -MAX_DRAG_DISTANCE, maxX: MAX_DRAG_DISTANCE },
          
          onDrag() {
            direction = Math.sign(this.x) === 1 ? "bottom right" : "bottom left";
            const distance = this.x / MAX_DRAG_DISTANCE;
            animateCardsOnDrag(distance, gsap, cards, initialCardSettings, direction, SHADOW);
          },
          
          onDragEnd() {
            if (Math.abs(this.x) > 50) {
              flipCards(direction, cards);
            }
            resetDraggablePosition(gsap, cards, initialCardSettings, SHADOW, EASE);
            gsap.set(this.target, { x: 0 });
          }
        });
      } catch (error) {
        console.error('Error initializing mobile slider:', error);
      }
    };
    
    initializeSlider();
  }, [gsapLoaded, slides.length]);
  
  // ANIMATE CARDS ON DRAG
  const animateCardsOnDrag = (
    distance: number,
    gsap: any,
    cards: HTMLDivElement[],
    initialCardSettings: any[],
    direction: string,
    SHADOW: string
  ) => {
    const d = Math.min(Math.max(-1, distance), 1);
    const absD = Math.abs(d);
    
    const dragTweens = [
      { index: 0, rot: -26 + d, scale: (7 + d) / 10, opacity: d / 2 + 0.2 },
      { index: 1, rot: -16 + d * 2, scale: (8 + d) / 10 },
      { index: 2, rot: -8 + d * 4, scale: (9 + d) / 10 },
      {
        index: 3,
        rot: d * 8,
        origin: direction,
        ease: "power4.out",
        boxShadow: `0px 22px ${70 - absD * 20}px 4px rgba(1, 14, 39, ${1 - absD / 4})`
      },
      { index: 4, rot: 8 + d * 4, scale: (-d + 9) / 10 },
      { index: 5, rot: 16 + d * 2, scale: (-d + 8) / 10 },
      { index: 6, rot: 26 + d, scale: (-d + 7) / 10, opacity: -d / 2 + 0.2 }
    ];
    
    dragTweens.forEach(({ index, rot, scale, opacity, origin, boxShadow, ease }) => {
      if (index < cards.length) {
        gsap.to(cards[index], {
          rotation: Math.min(Math.max(-30, rot), 30),
          ...(scale !== undefined && { scale: Math.min(Math.max(0.6, scale), 1) }),
          ...(opacity !== undefined && { opacity }),
          ...(origin && { transformOrigin: origin }),
          ...(boxShadow && { boxShadow }),
          ...(ease !== undefined && { ease })
        });
      }
    });
  };
  
  // RESET CARDS POSITION
  const resetDraggablePosition = (
    gsap: any,
    cards: HTMLDivElement[],
    initialCardSettings: any[],
    SHADOW: string,
    EASE: string
  ) => {
    cards.forEach((card, i) => {
      if (i < initialCardSettings.length) {
        gsap.to(card, {
          rotation: initialCardSettings[i].rot,
          scale: initialCardSettings[i].scale,
          transformOrigin: initialCardSettings[i].origin,
          opacity: initialCardSettings[i].opacity ?? 1,
          boxShadow: SHADOW,
          ease: EASE
        });
      }
    });
  };
  
  // FLIP CARDS
  const flipCards = (direction: string, cards: HTMLDivElement[]) => {
    if (direction === "bottom right") {
      const lastCard = cards.pop();
      if (lastCard) {
        cards.unshift(lastCard);
      }
    } else {
      const firstCard = cards.shift();
      if (firstCard) {
        cards.push(firstCard);
      }
    }
    
    // Update z-index for visual stacking
    const zIndex = gsap?.utils?.distribute?.({ base: 1, amount: 3, from: "edges" }) || 
                  ((i: number) => Math.abs(i - Math.floor(cards.length / 2)));
    
    cards.forEach((card, i) => {
      const z = typeof zIndex === 'function' ? zIndex(i, 0, cards) : 1;
      card.style.zIndex = String(z);
    });
  };
  
  // Create placeholder slides for generating animation
  const createPlaceholderSlides = () => {
    if (isGenerating) {
      return [{
        id: `placeholder-${slides.length}`,
        image: '',
        text: 'Generating...',
        isPlaceholder: true
      }];
    }
    return [];
  };
  
  const allSlides = [...slides, ...createPlaceholderSlides()];
  
  return (
    <div className="w-full md:hidden">
      <SliderContainer ref={containerRef} className="demo">
        {allSlides.map((slide, index) => (
          <CardWrapper 
            key={slide.id || index} 
            className="card"
            ref={(el) => {
              if (el && cardsRef.current) {
                cardsRef.current[index] = el;
              }
            }}
          >
            {slide.image ? (
              <img 
                src={slide.image} 
                alt={`Slide ${index + 1}`} 
                onError={(e) => {
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
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Slide {index + 1}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">No image available</p>
                </div>
              </div>
            )}
            {slide.text && (
              <div className="slide-caption">
                {slide.text.replace(/\*\*/g, '').replace(/^["']|["']$/g, '').trim()}
              </div>
            )}
          </CardWrapper>
        ))}
      </SliderContainer>
      
      {/* Progress indicator */}
      <div className="flex flex-col items-center justify-center mt-4 gap-2">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-32">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(slides.length / Math.max(1, slides.length + (isGenerating ? 1 : 0))) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
          {slides.length} / {isGenerating ? '∞' : slides.length} slides
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

export default MobileImageSlider;