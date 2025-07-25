import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LanguageSelectionStepProps {
  onLanguageChange: (language: string) => void;
  initialLanguage?: string;
}

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

const LanguageSelectionStep: React.FC<LanguageSelectionStepProps> = ({ 
  onLanguageChange,
  initialLanguage = 'en'
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  
  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    onLanguageChange(language);
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Choose your language
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Select your preferred language for the application. You can always change this later in your settings.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {languages.map((language) => (
          <motion.div
            key={language.code}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleLanguageChange(language.code)}
            className={`cursor-pointer p-4 rounded-lg border ${
              selectedLanguage === language.code
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">{language.flag}</span>
              <span className="font-medium text-gray-900 dark:text-white">{language.name}</span>
            </div>
          </motion.div>
        ))}
      </div>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
        Note: Currently, only English is fully supported. Other languages are in development.
      </p>
    </div>
  );
};

export default LanguageSelectionStep;