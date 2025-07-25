import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  animate = false,
  onClick,
  padding = 'md'
}) => {
  const paddingClass = {
    'none': '',
    'sm': 'p-3',
    'md': 'p-6',
    'lg': 'p-8'
  }[padding];
  
  const baseClasses = `bg-white dark:bg-gray-800 rounded-xl shadow-md ${paddingClass} ${className}`;
  
  if (animate) {
    return (
      <motion.div
        className={baseClasses}
        whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;