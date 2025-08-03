import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { Button, ThemeToggle } from '../ui';

interface HeaderProps {
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const { theme: _theme, toggleTheme: _toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className={`w-full ${transparent ? 'absolute top-0 left-0 z-10' : 'bg-white dark:bg-gray-800 shadow-sm'}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className={`text-2xl font-bold ${transparent ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>
                Felearn
              </span>
            </motion.div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/features" 
              className={`font-medium ${transparent ? 'text-white hover:text-indigo-200' : 'text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className={`font-medium ${transparent ? 'text-white hover:text-indigo-200' : 'text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
            >
              Pricing
            </Link>
            <ThemeToggle size="sm" />
            <Link to="/auth/login" className={`font-medium ${transparent ? 'text-white hover:text-indigo-200' : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300'}`}>
              Login
            </Link>
            <Button to="/auth/signup" variant={transparent ? "secondary" : "primary"}>
              Get Started
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-md ${
                transparent 
                  ? 'text-white hover:bg-white/20' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white dark:bg-gray-800 shadow-lg"
        >
          <div className="px-4 py-4 space-y-4">
            <Link 
              to="/features" 
              className="block font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className="block font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/auth/login" 
              className="block font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Button 
              to="/auth/signup" 
              variant="primary" 
              fullWidth 
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Button>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <ThemeToggle showLabel size="sm" />
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;