import React, { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const Container: React.FC<ContainerProps> = ({ 
  children, 
  className = '', 
  maxWidth = 'xl' 
}) => {
  const maxWidthClass = {
    'xs': 'max-w-xs',
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    'full': 'max-w-full'
  }[maxWidth];
  
  return (
    <div className={`container mx-auto px-4 ${maxWidthClass} ${className}`}>
      {children}
    </div>
  );
};

export default Container;