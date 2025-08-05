import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import FeedbackModal from './FeedbackModal';
import { gsap } from 'gsap';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Custom font style for the dash-title font
  const customFontStyle = {
    fontFamily: 'dash-title, sans-serif',
    fontWeight: 'bold',
  };
  
  // GSAP animations for sidebar
  useEffect(() => {
    if (sidebarRef.current) {
      if (isOpen) {
        // Expand animation
        gsap.fromTo(sidebarRef.current, 
          {
            x: -300,
            opacity: 0,
            scale: 0.95,
          },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
            clearProps: "scale"
          }
        );
      } else {
        // Contract animation
        gsap.to(sidebarRef.current, {
          x: -300,
          opacity: 0,
          scale: 0.95,
          duration: 0.4,
          ease: "power2.in"
        });
      }
    }
  }, [isOpen]);

  // Stagger animation for nav items when sidebar opens
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      const navItems = sidebarRef.current.querySelectorAll('.nav-item');
      gsap.fromTo(navItems,
        {
          x: -50,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.2
        }
      );
    }
  }, [isOpen]);
  
  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Create Story',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      path: '/dashboard/library',
      label: 'My Stories',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      path: '/dashboard/settings',
      label: 'Settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },

  ];
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const isActiveRoute = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    if (path === '/dashboard/library') {
      return location.pathname === '/dashboard/library' || location.pathname === '/dashboard/library/';
    }
    if (path === '/dashboard/settings') {
      return location.pathname === '/dashboard/settings' || location.pathname === '/dashboard/settings/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <div
      ref={sidebarRef}
      className="w-64 fixed h-full sidebar-layer flex flex-col glass-heavy-blur"
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        transform: 'translateX(-300px)', // Initial position
      }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Link to="/dashboard" className="flex items-center" onClick={onClose}>
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
            style={customFontStyle}
          >
            Felearn AI
          </motion.span>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`nav-item flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                isActiveRoute(item.path)
                  ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-r-2 border-indigo-500'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      
      {/* Feedback/Suggestion Button - Separate section */}
      <div className="sidebar-suggest-feature px-6 py-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsFeedbackModalOpen(true)}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-lg transition-all duration-200 group"
        >
          <span className="mr-3 p-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md group-hover:shadow-lg transition-shadow">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
            </svg>
          </span>
          <div className="text-left">
            <div className="font-medium">Suggest Feature</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
              Share feedback & ideas
            </div>
          </div>
        </motion.button>
      </div>
      
      {/* User section */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </motion.button>
      </div>
      
      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
};

export default Sidebar;