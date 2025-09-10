import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

interface GenerationLimitDisplayProps {
  onNotificationClick: () => void;
}

const GenerationLimitDisplay: React.FC<GenerationLimitDisplayProps> = ({ onNotificationClick }) => {
  const { user } = useAuth();
  const [generationsLeft, setGenerationsLeft] = useState(15); // Default to 15
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Use the user's quota value, defaulting to 15 if not set
      const userQuota = user.quota !== undefined ? user.quota : 15;
      setGenerationsLeft(userQuota);
      setIsLoading(false);
    }
  }, [user]);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onNotificationClick}
      className="relative p-3 rounded-xl text-gray-600 dark:text-gray-300 transition-all duration-200 flex items-center"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
      aria-label="Generation limit"
    >
      {/* Grainy texture overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none rounded-xl"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay'
        }}
      />
      
      <div className="flex items-center relative z-10">
        {isLoading ? (
          <div className="h-5 w-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`font-medium text-sm ${generationsLeft === 0 ? 'text-red-500' : ''}`}>
              {generationsLeft}/15
            </span>
          </>
        )}
      </div>
      
      {/* Notification dot - only show if there are 3 or fewer generations left */}
      {generationsLeft <= 3 && generationsLeft > 0 && (
        <div 
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
            boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
          }}
        />
      )}
    </motion.button>
  );
};

export default GenerationLimitDisplay;