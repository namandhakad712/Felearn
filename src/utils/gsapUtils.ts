import { gsap } from 'gsap';

/**
 * Safely register GSAP plugins with error handling
 */
export const registerGSAPPlugins = () => {
  try {
    // Register core plugins
    try {
      import('@gsap/react').then(({ useGSAP }) => {
        gsap.registerPlugin(useGSAP);
        console.log('✅ useGSAP registered successfully');
      }).catch(() => {
        console.warn('@gsap/react not available');
      });
    } catch (error) {
      console.warn('@gsap/react not available:', error);
    }
    
    // Register ScrollTrigger if available
    try {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        console.log('✅ ScrollTrigger registered successfully');
      }).catch(() => {
        console.warn('ScrollTrigger not available');
      });
    } catch (error) {
      console.warn('ScrollTrigger not available:', error);
    }
    
    // Register MotionPathPlugin if available globally (from CDN)
    if (typeof window !== 'undefined') {
      // Check if MotionPathPlugin is available in global scope
      if ((window as any).MotionPathPlugin) {
        gsap.registerPlugin((window as any).MotionPathPlugin);
        console.log('✅ MotionPathPlugin registered successfully');
      } else if ((window as any).gsap && (window as any).gsap.MotionPathPlugin) {
        gsap.registerPlugin((window as any).gsap.MotionPathPlugin);
        console.log('✅ MotionPathPlugin registered successfully (from gsap namespace)');
      } else {
        console.warn('MotionPathPlugin not available - animations using motionPath may not work');
      }
    }
    
    console.log('✅ GSAP plugins registered successfully');
  } catch (error) {
    console.warn('GSAP plugin registration warning:', error);
  }
};

/**
 * Clean up GSAP animations and event listeners for a component
 */
export const cleanupGSAPAnimations = (ref: React.RefObject<HTMLElement>) => {
  if (!ref.current) return;
  
  try {
    // Kill all GSAP animations on the element and its children
    gsap.killTweensOf(ref.current);
    gsap.killTweensOf(ref.current.querySelectorAll('*'));
    
    // Clear any GSAP properties
    gsap.set(ref.current, { clearProps: 'all' });
    ref.current.querySelectorAll('*').forEach(element => {
      gsap.set(element, { clearProps: 'all' });
    });
    
    // Remove any stored event listeners
    const elements = ref.current.querySelectorAll('*');
    elements.forEach((element) => {
      const el = element as HTMLElement;
      if ((el as any)._gsapListeners) {
        const listeners = (el as any)._gsapListeners;
        Object.keys(listeners).forEach(eventType => {
          el.removeEventListener(eventType, listeners[eventType]);
        });
        delete (el as any)._gsapListeners;
      }
    });
    
    console.log('✅ GSAP animations cleaned up successfully');
  } catch (error) {
    console.warn('GSAP cleanup warning:', error);
  }
};

/**
 * Safe GSAP animation with error handling
 */
export const safeGSAPAnimation = (
  target: any,
  animation: gsap.TweenVars,
  onComplete?: () => void
) => {
  try {
    if (!target) {
      console.warn('GSAP animation target is null or undefined');
      return;
    }
    
    // Check if target is a DOM element and still exists
    if (target instanceof Element && !document.contains(target)) {
      console.warn('GSAP animation target element is no longer in DOM');
      return;
    }
    
    // Check if target is a ref and element exists
    if (target.current && !document.contains(target.current)) {
      console.warn('GSAP animation ref target is no longer in DOM');
      return;
    }
    
    return gsap.to(target, {
      ...animation,
      onComplete: () => {
        try {
          onComplete?.();
        } catch (error) {
          console.warn('GSAP animation onComplete error:', error);
        }
      }
    });
  } catch (error) {
    console.warn('GSAP animation error:', error);
  }
};

/**
 * Safe GSAP fromTo animation with error handling
 */
export const safeGSAPFromTo = (
  target: any,
  fromVars: gsap.TweenVars,
  toVars: gsap.TweenVars,
  onComplete?: () => void
) => {
  try {
    if (!target) {
      console.warn('GSAP fromTo animation target is null or undefined');
      return;
    }
    
    // Check if target is a DOM element and still exists
    if (target instanceof Element && !document.contains(target)) {
      console.warn('GSAP fromTo animation target element is no longer in DOM');
      return;
    }
    
    // Check if target is a ref and element exists
    if (target.current && !document.contains(target.current)) {
      console.warn('GSAP fromTo animation ref target is no longer in DOM');
      return;
    }
    
    return gsap.fromTo(target, fromVars, {
      ...toVars,
      onComplete: () => {
        try {
          onComplete?.();
        } catch (error) {
          console.warn('GSAP fromTo animation onComplete error:', error);
        }
      }
    });
  } catch (error) {
    console.warn('GSAP fromTo animation error:', error);
  }
};

/**
 * Initialize GSAP with proper error handling
 */
export const initializeGSAP = () => {
  if (typeof window === 'undefined') return;
  
  try {
    registerGSAPPlugins();
    
    // Set GSAP defaults for better performance
    gsap.defaults({
      ease: "power2.out",
      duration: 0.3
    });
    
    console.log('✅ GSAP initialized successfully');
  } catch (error) {
    console.error('GSAP initialization error:', error);
  }
}; 