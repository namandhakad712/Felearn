import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

import ApiKeyManager from './ApiKeyManager';
import UserPreferencesManager from './UserPreferencesManager';
import SecurityManager from './SecurityManager';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

type TabType = 'profile' | 'appearance' | 'api' | 'security';

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const { updateUser } = useAuth();
  
  // GSAP refs
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  
  // Simple toast implementation to replace the missing useToast hook
  const showSuccess = (message: string) => {
    console.log('Success:', message);
    alert(message);
  };
  
  const showError = (message: string, details?: string) => {
    console.error('Error:', message, details);
    alert(`Error: ${message}${details ? `\n${details}` : ''}`);
  };
  
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  // Form states
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  
  // Validation states
  const [nameError, setNameError] = useState('');
  const [bioError, setBioError] = useState('');
  
  const handleTabChange = (tab: TabType) => {
    if (tab === activeTab) return;
    
    // Animate tab content transition
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.15,
        ease: "power2.out",
        onComplete: () => {
          setActiveTab(tab);
          gsap.fromTo(contentRef.current, 
            { opacity: 0, y: -10 },
            { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }
          );
        }
      });
    } else {
      setActiveTab(tab);
    }
  };
  
  const validateName = () => {
    if (name.length > 50) {
      setNameError('Name must be less than 50 characters');
      return false;
    }
    setNameError('');
    return true;
  };
  
  const validateBio = () => {
    if (bio.length > 200) {
      setBioError('Bio must be less than 200 characters');
      return false;
    }
    setBioError('');
    return true;
  };
  

  
  const handleProfileSubmit = async () => {
    if (!validateName() || !validateBio()) return;
    
    setIsSubmitting(true);
    try {
      await updateUser({
        name,
        bio,
      });
      showSuccess('Profile updated successfully');
    } catch (error) {
      showError('Failed to update profile', 'Please try again later');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  

  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={validateName}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  nameError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Your display name"
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{nameError}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="flex items-center">
                <input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <span className="ml-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  Use Security tab to change
                </span>
              </div>
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                onBlur={validateBio}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  bioError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Tell us a bit about yourself"
              />
              {bioError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{bioError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {bio.length}/200 characters
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleProfileSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        );
        
      case 'appearance':
        return (
          <UserPreferencesManager
            onSuccess={showSuccess}
            onError={showError}
          />
        );
        
      case 'api':
        return (
          <ApiKeyManager
            onSuccess={showSuccess}
            onError={showError}
          />
        );
        
      case 'security':
        return (
          <SecurityManager
            onSuccess={showSuccess}
            onError={showError}
          />
        );
        
      default:
        return null;
    }
  };
  
  // GSAP animations for modal entrance
  useGSAP(() => {
    if (isOpen && modalRef.current) {
      // Morphing entrance animation
      gsap.fromTo(modalRef.current, 
        {
          scale: 0.3,
          opacity: 0,
          rotationY: 45,
          transformOrigin: "center center"
        },
        {
          scale: 1,
          opacity: 1,
          rotationY: 0,
          duration: 0.6,
          ease: "back.out(1.7)"
        }
      );
      
      // Animate tabs with stagger
      if (tabsRef.current) {
        const tabs = tabsRef.current.querySelectorAll('button');
        gsap.fromTo(tabs,
          { opacity: 0, y: 20, scale: 0.8 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration: 0.4,
            stagger: 0.1,
            delay: 0.3,
            ease: "back.out(1.7)"
          }
        );
      }
      
      // Animate content
      if (contentRef.current) {
        gsap.fromTo(contentRef.current,
          { opacity: 0, y: 30 },
          { 
            opacity: 1, 
            y: 0,
            duration: 0.5,
            delay: 0.4,
            ease: "power2.out"
          }
        );
      }
    }
  }, { dependencies: [isOpen] });

  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          ref={modalRef}
          className="relative overflow-hidden rounded-3xl max-w-2xl w-full max-h-[90vh]"
          style={{
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Grainy texture overlay */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              mixBlendMode: 'overlay'
            }}
          />
          {/* Header */}
          <div 
            className="relative p-6 flex items-center justify-between"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Profile Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-all hover:scale-110"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Tabs */}
          <div 
            ref={tabsRef}
            className="relative"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <nav className="flex overflow-x-auto px-2" aria-label="Tabs">
              <button
                onClick={() => handleTabChange('profile')}
                className={`px-6 py-3 mx-1 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'profile'
                    ? 'text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-gray-700 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
                style={activeTab === 'profile' ? {
                  background: 'rgba(99, 102, 241, 0.2)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                } : {}}
              >
                Profile
              </button>
              <button
                onClick={() => handleTabChange('appearance')}
                className={`px-6 py-3 mx-1 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'appearance'
                    ? 'text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-gray-700 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
                style={activeTab === 'appearance' ? {
                  background: 'rgba(99, 102, 241, 0.2)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                } : {}}
              >
                Appearance
              </button>
              <button
                onClick={() => handleTabChange('api')}
                className={`px-6 py-3 mx-1 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'api'
                    ? 'text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-gray-700 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
                style={activeTab === 'api' ? {
                  background: 'rgba(99, 102, 241, 0.2)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                } : {}}
              >
                API Keys
              </button>
              <button
                onClick={() => handleTabChange('security')}
                className={`px-6 py-3 mx-1 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'security'
                    ? 'text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-gray-700 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
                style={activeTab === 'security' ? {
                  background: 'rgba(99, 102, 241, 0.2)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                } : {}}
              >
                Security
              </button>
            </nav>
          </div>
          
          {/* Content */}
          <div 
            ref={contentRef}
            className="relative p-8 overflow-y-auto" 
            style={{ 
              maxHeight: 'calc(90vh - 130px)',
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
            }}
          >
            {renderTabContent()}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileModal;