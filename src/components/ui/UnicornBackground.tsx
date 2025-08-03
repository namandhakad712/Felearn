import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface UnicornBackgroundProps {
  className?: string;
}

const UnicornBackground: React.FC<UnicornBackgroundProps> = ({ className = '' }) => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLDivElement>(null);
  const unicornInitialized = useRef(false);

  useEffect(() => {
    // Load Unicorn Studio script if not already loaded
    const loadUnicornStudio = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if UnicornStudio is already available
        if (window.UnicornStudio) {
          resolve();
          return;
        }

        // Check if script is already loading
        const existingScript = document.querySelector('script[src*="unicornStudio.umd.js"]');
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve());
          existingScript.addEventListener('error', reject);
          return;
        }

        // Load the script
        const script = document.createElement('script');
        script.src = 'https://cdn.unicorn.studio/v1.3.2/unicornStudio.umd.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initializeUnicorn = async () => {
      if (unicornInitialized.current || !canvasRef.current) return;

      try {
        await loadUnicornStudio();

        // Clear any existing content
        canvasRef.current.innerHTML = '';

        // Create the unicorn embed div
        const embedDiv = document.createElement('div');
        embedDiv.className = 'unicorn-embed';
        embedDiv.style.width = '100%';
        embedDiv.style.height = '100%';
        embedDiv.setAttribute('data-us-project-src', 'https://cdn.prod.website-files.com/66d0f81efbf7984b14461c32/66f4338ea1e12ad72e09c6c4_Mci3niaCyFLMWIYeLoGf.json.txt');
        embedDiv.setAttribute('data-us-scale', '0.9');
        embedDiv.setAttribute('data-us-dpi', '1');
        embedDiv.setAttribute('data-us-lazyload', 'false');
        embedDiv.setAttribute('data-us-disableMobile', 'false');
        embedDiv.setAttribute('data-us-production', 'true');
        embedDiv.setAttribute('data-us-alttext', 'Interactive Background');
        embedDiv.setAttribute('data-us-arialabel', 'Interactive cursor-responsive background');

        canvasRef.current.appendChild(embedDiv);

        // Initialize Unicorn Studio
        if (window.UnicornStudio && window.UnicornStudio.init) {
          window.UnicornStudio.init();
          unicornInitialized.current = true;
        }
      } catch (error) {
        console.error('Failed to load Unicorn Studio:', error);
      }
    };

    initializeUnicorn();

    // Cleanup function
    return () => {
      if (canvasRef.current) {
        canvasRef.current.innerHTML = '';
      }
      unicornInitialized.current = false;
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        background: theme === 'dark'
          ? 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.95) 0%, rgba(2, 6, 23, 0.98) 100%)'
          : 'radial-gradient(ellipse at center, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.98) 100%)',
      }}
    >
      {/* SVG Noise Filter - Same as your document */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
        <defs>
          <filter id="noiseFilter" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.6"
              stitchTiles="stitch"
            />
            <feColorMatrix
              in="colorNoise"
              type="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"
            />
            <feComposite
              operator="in"
              in2="SourceGraphic"
              result="monoNoise"
            />
            <feBlend
              in="SourceGraphic"
              in2="monoNoise"
              mode="screen"
            />
          </filter>
        </defs>
      </svg>

      {/* Heavy Gaussian Blur Layer - 90% blur like animated blobs */}
      <div
        className="absolute inset-0"
        style={{
          background: theme === 'dark' ? '#1e293b' : '#f1f5f9',
          filter: 'url(#noiseFilter) blur(60px)',
          opacity: 0.4,
          mixBlendMode: theme === 'dark' ? 'screen' : 'multiply',
        }}
      />

      {/* Unicorn Studio Canvas - 10% visibility with heavy blur */}
      <div
        ref={canvasRef}
        className="unicorn-canvas w-full h-full"
        style={{
          filter: theme === 'dark'
            ? 'brightness(0.3) contrast(1.5) hue-rotate(200deg) saturate(0.5) blur(40px)'
            : 'brightness(0.8) contrast(0.7) hue-rotate(10deg) saturate(0.8) blur(40px)',
          opacity: 0.1, // Only 10% visibility
        }}
      />

      {/* Additional heavy blur overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: theme === 'dark'
            ? 'radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 60%), radial-gradient(circle at 70% 80%, rgba(147, 51, 234, 0.15) 0%, transparent 60%)'
            : 'radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 60%), radial-gradient(circle at 70% 80%, rgba(147, 51, 234, 0.08) 0%, transparent 60%)',
          filter: 'blur(80px)',
          opacity: 0.6,
        }}
      />

      {/* Final grain texture with heavy blur */}
      <div
        className="absolute inset-0"
        style={{
          background: theme === 'dark'
            ? `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0) 40px 40px`
            : `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0) 40px 40px`,
          filter: 'blur(20px)',
          opacity: 0.3,
          mixBlendMode: theme === 'dark' ? 'screen' : 'multiply',
        }}
      />
    </div>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    UnicornStudio: {
      init: () => void;
    };
  }
}

export default UnicornBackground;