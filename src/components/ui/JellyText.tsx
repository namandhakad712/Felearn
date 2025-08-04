import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useTheme } from '../../contexts/ThemeContext';

interface JellyTextProps {
  text: string;
  className?: string;
  fontSize?: string;
  fontWeight?: number;
  fontStretch?: number;
}

const JellyText: React.FC<JellyTextProps> = ({ 
  text, 
  className = '',
  fontSize = '3rem',
  fontWeight = 600,
  fontStretch = 150
}) => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [chars, setChars] = useState<HTMLElement[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Animation state
  const isMouseDown = useRef(false);
  const mouseInitialY = useRef(0);
  const mouseFinalY = useRef(0);
  const charIndexSelected = useRef(0);
  const charH = useRef(0);
  
  // Animation parameters
  const weightInit = fontWeight;
  const weightTarget = 400;
  const weightDiff = weightInit - weightTarget;
  const stretchInit = fontStretch;
  const stretchTarget = 80;
  const stretchDiff = stretchInit - stretchTarget;
  const maxYScale = 2.5;
  const elasticDropOff = 0.8;

  // Split text into characters
  useEffect(() => {
    if (!textRef.current || isInitialized) return;

    const textElement = textRef.current;
    const characters = text.split('').map((char) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char; // Non-breaking space
      span.className = 'char';
      span.style.cssText = `
        display: inline-block;
        position: relative;
        will-change: font-weight, font-stretch, transform;
        transform-origin: center bottom;
        padding-top: 1.08vw;
        text-align: center;
        user-select: none;
      `;
      return span;
    });

    textElement.innerHTML = '';
    characters.forEach(char => textElement.appendChild(char));
    setChars(characters);
    setIsInitialized(true);
  }, [text, isInitialized]);

  // Initialize animation
  useEffect(() => {
    if (!chars.length || !textRef.current) return;

    charH.current = textRef.current.offsetHeight;

    // Set initial styles
    gsap.set(chars, {
      transformOrigin: 'center bottom'
    });

    // Animate in
    const rect = chars[0].getBoundingClientRect();
    gsap.from(chars, {
      y: () => -1 * (rect.y + charH.current + 150), // Reduced from 500 to 150
      fontWeight: weightTarget,
      fontStretch: `${stretchTarget}%`,
      scaleY: 1.5, // Reduced from 2 to 1.5
      ease: "elastic(0.3, 0.2)", // Faster elastic
      duration: 1, // Reduced from 1.5 to 1
      delay: 0.2, // Reduced from 0.5 to 0.2
      stagger: {
        each: 0.03, // Reduced from 0.05 to 0.03
        from: 'random'
      },
      onComplete: () => {
      const cleanup = initEvents();
      return cleanup;
    }
    });
  }, [chars]);

  const initEvents = () => {
    if (!containerRef.current) return;

    // const container = containerRef.current; // Unused variable

    // Mouse up event
    const handleMouseUp = (e: MouseEvent) => {
      if (isMouseDown.current) {
        mouseFinalY.current = e.clientY;
        isMouseDown.current = false;
        snapBackText();
        document.body.classList.remove('grab-cursor');
      }
    };

    // Mouse move event
    const handleMouseMove = (e: MouseEvent) => {
      if (isMouseDown.current) {
        mouseFinalY.current = e.clientY;
        calcDist();
        setFontDragDimensions();
      }
    };

    // Mouse leave event
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 || e.clientX <= 0 || 
          (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        snapBackText();
        isMouseDown.current = false;
        document.body.classList.remove('grab-cursor');
      }
    };

    // Add character mouse down events
    chars.forEach((char, index) => {
      char.addEventListener('mousedown', (e) => {
        mouseInitialY.current = e.clientY;
        charIndexSelected.current = index;
        isMouseDown.current = true;
        document.body.classList.add('grab-cursor');
        e.preventDefault();
      });
    });

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  };

  const calcDist = () => {
    const maxYDragDist = charH.current * (maxYScale - 1);
    const distY = mouseInitialY.current - mouseFinalY.current;
    let dragYScale = distY / maxYDragDist;
    
    if (dragYScale > (maxYScale - 1)) {
      dragYScale = maxYScale - 1;
    } else if (dragYScale < -0.5) {
      dragYScale = -0.5;
    }
    
    return dragYScale;
  };

  const calcFracDispersion = (index: number, dragYScale: number) => {
    const dispersion = 1 - (Math.abs(index - charIndexSelected.current) / (chars.length * elasticDropOff));
    return dispersion * dragYScale;
  };

  const setFontDragDimensions = () => {
    const dragYScale = calcDist();
    
    gsap.to(chars, {
      y: (index) => {
        const fracDispersion = calcFracDispersion(index, dragYScale);
        return fracDispersion * -50;
      },
      fontWeight: (index) => {
        const fracDispersion = calcFracDispersion(index, dragYScale);
        return weightInit - (fracDispersion * weightDiff);
      },
      fontStretch: (index) => {
        const fracDispersion = calcFracDispersion(index, dragYScale);
        return `${stretchInit - (fracDispersion * stretchDiff)}%`;
      },
      scaleY: (index) => {
        const fracDispersion = calcFracDispersion(index, dragYScale);
        let scaleY = 1 + fracDispersion;
        if (scaleY < 0.5) scaleY = 0.5;
        return scaleY;
      },
      ease: "power4",
      duration: 0.4
    });
  };

  const snapBackText = () => {
    gsap.to(chars, {
      y: 0,
      fontWeight: weightInit,
      fontStretch: `${stretchInit}%`,
      scale: 1,
      ease: "elastic(0.4, 0.2)", // Faster elastic return
      duration: 0.8, // Reduced from 1 to 0.8
      stagger: {
        each: 0.015, // Reduced from 0.02 to 0.015
        from: charIndexSelected.current
      }
    });
  };

  return (
    <>
      <style>{`
        .grab-cursor {
          cursor: url("data:image/svg+xml,%3Csvg width='64px' height='64px' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 700 700'%3E%3Cpath d='M419.9949,560.0013a179.4167,179.4167,0,0,1-127.73-52.898l-46.691-46.668a81.2138,81.2138,0,0,1-23.914-57.77v-35.352a81.1643,81.1643,0,0,1,23.918-57.75l22.75-22.723v-53.504a46.6566,46.6566,0,0,1,72.613-38.7813,46.691,46.691,0,0,1,88.106,0,46.6714,46.6714,0,0,1,70,23.3323,46.6566,46.6566,0,0,1,72.613,38.7813v151.67c0,83.625-68.039,151.66-151.67,151.66Zm-151.66-240.17-6.2539,6.2539a57.9448,57.9448,0,0,0-17.082,41.254v35.352a58.0537,58.0537,0,0,0,17.078,41.254l46.691,46.668a156.1776,156.1776,0,0,0,111.21,46.059c70.77,0,128.36-57.562,128.36-128.33l.0039-151.67a23.332,23.332,0,1,0-46.664,0l-.0039,11.668a11.666,11.666,0,1,1-23.332,0v-35a23.332,23.332,0,1,0-46.664,0l-.0039,35a11.666,11.666,0,1,1-23.332,0v-58.336a23.332,23.332,0,1,0-46.664,0l-.0039,58.336a11.666,11.666,0,1,1-23.332,0v-35a23.332,23.332,0,1,0-46.664,0v58.309a.19.19,0,0,0-.0039.0469v46.645a11.666,11.666,0,1,1-23.332,0Z' fill='%23fff'/%3E%3C/svg%3E") 32 32, pointer !important;
        }
        
        .char:hover {
          cursor: url("data:image/svg+xml,%3Csvg width='64px' height='64px' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 700 700'%3E%3Cpath d='M419.99,560.0013c83.627,0,151.67-68.041,151.67-151.67v-198.33A46.6565,46.6565,0,0,0,499.047,171.22a46.6714,46.6714,0,0,0-70-23.3323,46.7853,46.7853,0,0,0-44.055-31.219,46.2641,46.2641,0,0,0-23.332,6.2773V46.669a46.668,46.668,0,1,0-93.336,0v272.79l-64.145-32.082a70.2983,70.2983,0,0,0-31.289-7.375,44.6638,44.6638,0,0,0-31.5,76.23l150.88,150.87A179.4167,179.4167,0,0,0,420,560ZM172.9,303.33a21.3182,21.3182,0,0,0-15.0035,36.379l150.9,150.88a156.058,156.058,0,0,0,111.18,46.082c70.77,0,128.36-57.562,128.36-128.33V210.001a23.332,23.332,0,1,0-46.664,0v58.332a11.668,11.668,0,0,1-23.336,0V186.669a23.332,23.332,0,1,0-46.664,0v81.668a11.668,11.668,0,1,1-23.336,0v-105a23.332,23.332,0,0,0-46.664,0v105a11.668,11.668,0,0,1-23.336,0V46.677a23.332,23.332,0,0,0-46.664,0v291.67a11.66,11.66,0,0,1-16.8712,10.43l-81.035-40.508a46.9273,46.9273,0,0,0-20.863-4.9258Z' transform='translate(0 -0.001)' fill='%23fff'/%3E%3C/svg%3E") 32 32, pointer;
        }
      `}</style>
      
      <div 
        ref={containerRef}
        className={`jelly-text-container ${className}`}
        style={{
          position: 'relative',
          display: 'inline-block',
          width: '100%',
          textAlign: 'center'
        }}
      >
        <div
          ref={textRef}
          className="jelly-text"
          style={{
            margin: 0,
            fontSize: fontSize,
            fontWeight: fontWeight,
            fontStretch: `${fontStretch}%`,
            lineHeight: 0.6,
            letterSpacing: '-0.05em',
            userSelect: 'none',
            textShadow: theme === 'dark' 
              ? '0 0.05em 0 rgba(99, 102, 241, 0.3), 0 0.1em 0.1em rgba(0, 0, 0, 0.3), 0 0.4em 0.3em rgba(0, 0, 0, 0.1)'
              : '0 0.05em 0 rgba(99, 102, 241, 0.2), 0 0.1em 0.1em rgba(0, 0, 0, 0.1), 0 0.4em 0.3em rgba(0, 0, 0, 0.05)',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}
        />
      </div>
    </>
  );
};

export default JellyText;