import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  to?: string;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  animate?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  to,
  href,
  type = 'button',
  onClick,
  animate = true
}) => {
  const baseClasses = `inline-flex items-center justify-center font-medium rounded-lg focus:outline-none transition-colors duration-200 ${
    fullWidth ? 'w-full' : ''
  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }[size];
  
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50',
    secondary: 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50',
    outline: 'bg-transparent text-indigo-600 border border-indigo-600 hover:bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50',
    text: 'bg-transparent text-indigo-600 hover:text-indigo-800 hover:underline'
  }[variant];
  
  const classes = `${baseClasses} ${sizeClasses} ${variantClasses} ${className}`;
  
  const content = (
    <>
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
      ) : (
        children
      )}
    </>
  );
  
  // Render as Link if 'to' prop is provided
  if (to) {
    if (animate) {
      return (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link to={to} className={classes}>
            {content}
          </Link>
        </motion.div>
      );
    }
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }
  
  // Render as anchor if 'href' prop is provided
  if (href) {
    if (animate) {
      return (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
            {content}
          </a>
        </motion.div>
      );
    }
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  
  // Render as button
  if (animate) {
    return (
      <motion.button
        type={type}
        className={classes}
        disabled={disabled || loading}
        onClick={onClick}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        {content}
      </motion.button>
    );
  }
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {content}
    </button>
  );
};

export default Button;