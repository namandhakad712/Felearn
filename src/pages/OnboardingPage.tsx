import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout';
import { Wizard } from '../components/ui';
import { 
  ThemeSelectionStep, 
  LanguageSelectionStep, 
  ApiKeyStep, 
  CompletionStep 
} from '../components/onboarding';
import { encryptApiKey } from '../utils/encryption';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState({
    theme: user?.settings?.theme || 'light',
    language: user?.settings?.language || 'en',
    geminiKey: '',
  });
  
  const handleThemeChange = (theme: 'light' | 'dark') => {
    setSettings(prev => ({ ...prev, theme }));
  };
  
  const handleLanguageChange = (language: string) => {
    setSettings(prev => ({ ...prev, language }));
  };
  
  const handleApiKeyChange = (geminiKey: string) => {
    setSettings(prev => ({ ...prev, geminiKey }));
  };
  
  const handleComplete = async () => {
    try {
      console.log('Completing onboarding with settings:', settings);
      
      // Encrypt the API key and await the result
      const encryptedKey = await encryptApiKey(settings.geminiKey);
      
      // Update user settings in the database
      const updatedUserData = {
        settings: {
          theme: settings.theme,
          language: settings.language,
          onboardingCompleted: true,
        },
        geminiKey: encryptedKey, // Use the awaited encrypted key
      };
      
      console.log('Updating user with data:', updatedUserData);
      await updateUser(updatedUserData);
      
      console.log('User updated successfully, redirecting to dashboard');
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };
  
  const handleCancel = () => {
    // Redirect to landing page
    navigate('/');
  };
  
  // Define wizard steps
  const wizardSteps = [
    {
      id: 'theme',
      title: 'Theme',
      content: <ThemeSelectionStep onThemeChange={handleThemeChange} />,
    },
    {
      id: 'language',
      title: 'Language',
      content: <LanguageSelectionStep 
        onLanguageChange={handleLanguageChange}
        initialLanguage={settings.language}
      />,
    },
    {
      id: 'api-key',
      title: 'API Key',
      content: <ApiKeyStep 
        onApiKeyChange={handleApiKeyChange}
        initialApiKey={settings.geminiKey}
      />,
    },
    {
      id: 'completion',
      title: 'Complete',
      content: <CompletionStep userName={user?.email?.split('@')[0]} />,
    },
  ];
  
  return (
    <Layout>
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Felearn</h1>
            <h2 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
              Welcome to Felearn!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Let's set up your account in a few simple steps
            </p>
          </div>
          
          <Wizard
            steps={wizardSteps}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        </motion.div>
      </div>
    </Layout>
  );
};

export default OnboardingPage;