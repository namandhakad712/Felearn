import React, { ReactNode } from 'react';

interface GridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}

const Grid: React.FC<GridProps> = ({ 
  children, 
  className = '', 
  cols = { default: 1 },
  gap = 4
}) => {
  const getColsClass = () => {
    const classes = [];
    
    classes.push(`grid-cols-${cols.default}`);
    
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    
    return classes.join(' ');
  };
  
  return (
    <div className={`grid ${getColsClass()} gap-${gap} ${className}`}>
      {children}
    </div>
  );
};

export default Grid;