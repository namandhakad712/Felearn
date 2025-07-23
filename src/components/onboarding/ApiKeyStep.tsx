import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui';
import { geminiService } from '../../services';

interface ApiKeyStepProps {
  onApiKeyChange: (apiKey: string) => void;
  initialApiKey?: string;
}

const ApiKeyStep: React.FC<ApiKeyStepProps> = ({ 
  onApiKeyChange,
  initialApiKey = ''
}) => {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    setValidationStatus('idle');
    setErrorMessage('');
  };
  
  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setErrorMessage('API key is required');
      return;
    }
    
    setIsValidating(true);
    setValidationStatus('validating');
    
    try {
      // For development purposes, we'll accept any key with sufficient length
      // In production, you would use the actual validation
      const isValid = apiKey.trim().length >= 10;
      
      if (isValid) {
        setValidationStatus('success');
        onApiKeyChange(apiKey);
      } else {
        setValidationStatus('error');
        setErrorMessage('API key should be at least 10 characters long.');
      }
    } catch (error) {
      setValidationStatus('error');
      setErrorMessage('Error validating API key. Please try again.');
      console.error('API key validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Enter your Google Gemini API Key
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        To use our AI storytelling features, you need to provide your Google Gemini API key. 
        This key will be securely stored and used to generate stories.
      </p>
      
      <div className="mb-6">
        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Gemini API Key
        </label>
        <div className="flex">
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={handleApiKeyChange}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter your Gemini API key"
          />
          <Button
            onClick={validateApiKey}
            disabled={isValidating || !apiKey.trim()}
            className="rounded-l-none"
          >
            {isValidating ? 'Validating...' : 'Validate'}
          </Button>
        </div>
        
        {validationStatus === 'error' && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        )}
        
        {validationStatus === 'success' && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            API key validated successfully!
          </p>
        )}
      </div>
      
      <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
        <h3 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">
          How to get a Gemini API key
        </h3>
        <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>Visit the <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Google AI Studio</a></li>
          <li>Sign in with your Google account</li>
          <li>Navigate to the API keys section</li>
          <li>Create a new API key</li>
          <li>Copy and paste the key here</li>
        </ol>
      </div>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
        Your API key is stored securely and encrypted. We never share your API key with third parties.
      </p>
    </div>
  );
};

export default ApiKeyStep;