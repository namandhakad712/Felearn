import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import { ProfileModal } from '../profile';
import { UnicornBackground, ToastContainer } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onSidebarControl?: (isOpen: boolean) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onSidebarControl }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [generationsLeft, setGenerationsLeft] = useState(15); // Default to 15
  const { user } = useAuth();
  const { toasts, removeToast, info } = useToast();
  
  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Listen for profile modal open event
  useEffect(() => {
    const handleOpenProfile = () => {
      setIsProfileModalOpen(true);
    };
    
    window.addEventListener('openProfile', handleOpenProfile);
    return () => window.removeEventListener('openProfile', handleOpenProfile);
  }, []);
  
  // Set generations left based on user quota
  useEffect(() => {
    if (user?.quota !== undefined) {
      setGenerationsLeft(user.quota);
    } else {
      // For users without quota set, default to 15
      setGenerationsLeft(15);
    }
  }, [user]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Expose sidebar control to parent components
  useEffect(() => {
    if (onSidebarControl) {
      onSidebarControl(sidebarOpen);
    }
  }, [sidebarOpen, onSidebarControl]);

  // Add global sidebar control function
  useEffect(() => {
    const handleSidebarControl = (event: CustomEvent) => {
      setSidebarOpen(event.detail.isOpen);
    };

    window.addEventListener('controlSidebar', handleSidebarControl as EventListener);
    return () => window.removeEventListener('controlSidebar', handleSidebarControl as EventListener);
  }, []);
  
  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex relative">
      {/* Interactive Background */}
      <UnicornBackground />
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} onToggle={toggleSidebar} />
      
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          />
        )}
      </AnimatePresence>
      
      {/* Main content area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 relative z-10 ${
          sidebarOpen && !isMobile ? 'ml-64' : 'ml-0'
        }`}
        style={{
          backdropFilter: 'blur(10px) saturate(120%)',
          WebkitBackdropFilter: 'blur(10px) saturate(120%)',
        }}
      >
        {/* Header */}
        <DashboardHeader 
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          onNotificationClick={() => {
          const userQuota = user?.quota !== undefined ? user.quota : 15;
          info('Story Generation Limit', `You have ${userQuota} story generations left today.`, 3000);
        }}
        />
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full relative"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
            }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      
      {/* Profile Modal */}
      {user && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
        />
      )}
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default DashboardLayout;