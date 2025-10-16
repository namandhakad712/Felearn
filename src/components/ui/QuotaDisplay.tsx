import React from 'react';
import { motion } from 'framer-motion';
import { useQuota } from '../../hooks/useQuota';

interface QuotaDisplayProps {
  compact?: boolean;
  showResetTime?: boolean;
  onNotificationClick?: () => void;
}

export const QuotaDisplay: React.FC<QuotaDisplayProps> = ({ 
  compact = false,
  showResetTime = true,
  onNotificationClick
}) => {
  const { remaining, total, isLoading, getTimeUntilReset } = useQuota();
  
  const isLow = remaining <= 3 && remaining > 0;
  const isUnlimited = remaining === 999;
  const isEmpty = remaining === 0;

  const handleClick = () => {
    // Force refresh quota on click
    console.log('🔄 Manual quota refresh triggered');
    window.dispatchEvent(new CustomEvent('quotaUpdated'));
    
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="relative p-3 rounded-xl text-gray-600 dark:text-gray-300 transition-all duration-200 flex items-center"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
      aria-label="Story generation quota"
      title={isUnlimited ? 'Unlimited stories' : `${remaining} stories remaining today. Resets in ${getTimeUntilReset()}`}
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
            {/* Icon */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 mr-2 ${isLow ? 'animate-pulse' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {isUnlimited ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              ) : isEmpty ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            
            {/* Quota count */}
            {compact ? (
              <span className={`font-medium text-sm ${isEmpty ? 'text-red-500' : isLow ? 'text-yellow-500' : ''}`}>
                {isUnlimited ? '∞' : remaining}
              </span>
            ) : (
              <div className="flex flex-col items-start">
                <span className={`font-medium text-sm ${isEmpty ? 'text-red-500' : isLow ? 'text-yellow-500' : ''}`}>
                  {isUnlimited ? 'Unlimited' : `${remaining}/${total}`}
                </span>
                {showResetTime && !isUnlimited && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Resets in {getTimeUntilReset()}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Notification dot - only show if there are 3 or fewer generations left */}
      {isLow && (
        <div 
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
          style={{
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
            boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
          }}
        />
      )}
      
      {/* Empty state indicator */}
      {isEmpty && (
        <div 
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
          }}
        />
      )}
    </motion.button>
  );
};

export default QuotaDisplay;
