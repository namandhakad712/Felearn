import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '../layout';
import { Button, Card } from '../ui';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  showDemo?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
  showDemo = true,
}) => {
  // Animation variants
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };
  
  const demoVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.8,
        delay: 0.2,
        ease: "easeOut"
      }
    }
  };
  
  // Animated paw cursor
  const pawCursorVariants = {
    initial: { rotate: 0 },
    hover: { 
      rotate: [0, -5, 5, -5, 0],
      transition: { 
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse" 
      }
    }
  };

  return (
    <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-indigo-300 dark:bg-indigo-900 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      <Container>
        <div className="flex flex-col md:flex-row items-center relative z-10">
          {/* Text content */}
          <motion.div
            className="md:w-1/2 mb-10 md:mb-0"
            initial="hidden"
            animate="visible"
            variants={textVariants}
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white"
              whileHover="hover"
              variants={pawCursorVariants}
            >
              <span className="paw-cursor">{title}</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl mb-8 text-gray-600 dark:text-gray-300"
            >
              {subtitle}
            </motion.p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button to={ctaLink} variant="primary" size="lg">
                {ctaText}
              </Button>
              
              {secondaryCtaText && secondaryCtaLink && (
                <Button to={secondaryCtaLink} variant="secondary" size="lg">
                  {secondaryCtaText}
                </Button>
              )}
            </div>
          </motion.div>
          
          {/* Demo section */}
          {showDemo && (
            <motion.div
              className="md:w-1/2 md:pl-8"
              initial="hidden"
              animate="visible"
              variants={demoVariants}
            >
              <Card padding="lg" className="relative">
                {/* Window controls */}
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                
                {/* Demo content */}
                <div className="space-y-4">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-800 dark:text-gray-200">
                      Write a story about a magical cat who can travel through time...
                    </p>
                  </div>
                  
                  <motion.div 
                    className="cat-typing"
                    animate={{ 
                      y: [0, -10, 0],
                      transition: {
                        duration: 1,
                        repeat: Infinity,
                        repeatType: "loop"
                      }
                    }}
                  ></motion.div>
                  
                  <motion.div 
                    className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                  >
                    <h3 className="font-bold mb-2 text-gray-900 dark:text-white">The Chronos Cat</h3>
                    <p className="text-gray-800 dark:text-gray-200">
                      In the quiet corner of Mrs. Pemberton's bookshop, where dust motes danced in the afternoon sunlight, sat a peculiar silver-furred cat with eyes that shifted colors like an aurora...
                    </p>
                  </motion.div>
                </div>
                
                {/* Floating elements for visual interest */}
                <motion.div 
                  className="absolute -top-4 -right-4 w-8 h-8 bg-purple-400 dark:bg-purple-600 rounded-full opacity-70"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 360],
                    transition: { duration: 3, repeat: Infinity, repeatType: "loop" }
                  }}
                ></motion.div>
                
                <motion.div 
                  className="absolute -bottom-2 -left-2 w-6 h-6 bg-indigo-400 dark:bg-indigo-600 rounded-full opacity-70"
                  animate={{ 
                    y: [0, 10, 0],
                    rotate: [0, -360],
                    transition: { duration: 4, repeat: Infinity, repeatType: "loop" }
                  }}
                ></motion.div>
              </Card>
            </motion.div>
          )}
        </div>
      </Container>
      
      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg 
          className="relative block w-full h-10 md:h-20" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path 
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.17,118.92,162.91,77.28,321.39,56.44Z" 
            className="fill-white dark:fill-gray-900"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;