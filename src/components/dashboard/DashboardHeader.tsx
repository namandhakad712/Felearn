import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../ui';

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onNotificationClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  onToggleSidebar, 
  // _sidebarOpen, // Unused parameter
  onNotificationClick
}) => {
  const { user } = useAuth();
  
  return (
    <header className="shadow-sm relative z-10 glass-heavy-blur">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Menu toggle */}
        <div className="flex items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Toggle sidebar"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </motion.button>
          
          {/* Breadcrumb or page title could go here */}
          <div className="ml-4 hidden md:block">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Dashboard
            </h1>
          </div>
        </div>
        
        {/* Right side - User info and controls */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <ThemeToggle size="sm" />
          
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNotificationClick}
            className="relative p-3 rounded-xl text-gray-600 dark:text-gray-300 transition-all duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
            aria-label="Notifications"
          >
            {/* Grainy texture overlay */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none rounded-xl"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                mixBlendMode: 'overlay'
              }}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {/* Notification dot */}
            <div 
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
              }}
            />
          </motion.button>
          
          {/* User avatar and info */}
          <button
            onClick={() => {
              // This will be handled by the parent component
              const event = new CustomEvent('openProfile');
              window.dispatchEvent(event);
            }}
            className="relative flex items-center rounded-xl p-3 transition-all hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3 hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.isAdmin ? 'Admin' : 'User'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;