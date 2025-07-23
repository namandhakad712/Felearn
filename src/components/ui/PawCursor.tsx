import React from 'react';
import { motion } from 'framer-motion';

interface PawCursorProps {
  children: React.ReactNode;
  className?: string;
}

const PawCursor: React.FC<PawCursorProps> = ({ children, className = '' }) => {
  return (
    <motion.span
      className={`paw-cursor inline-block ${className}`}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.span>
  );
};

export default PawCursor;