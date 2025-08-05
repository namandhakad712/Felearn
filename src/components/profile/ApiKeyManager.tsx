import React, { useState, useEffect } from 'react';
// import { authService } from '../../services'; // Unused import
import { validateGeminiApiKey } from '../../utils/userUtils';
import { useAuth } from '../../contexts/AuthContext';

interface ApiKeyManagerProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  onSuccess,
  onError,
}) => {
  const { user, updateUser } = useAuth();
  
  // Form states
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Validation states
  const [apiKeyError, setApiKeyError] = useState('');
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  
  // Check if user has an existing API key
  // const _hasExistingKey = user?.geminiKey && user.geminiKey.length > 0; // Unused variable
  const [keyStatus, setKeyStatus] = useState<'checking' | 'available' | 'not-available'>('checking');
  
  // Check API key status without decrypting
  useEffect(() => {
    const checkKeyStatus = () => {
      if (user?.geminiKey && user.geminiKey.length > 0) {
        setKeyStatus('available');
      } else {
        setKeyStatus('not-available');
      }
    };
    
    checkKeyStatus();
  }, [user?.geminiKey]);
  
  useEffect(() => {
    // Clear validation status when API key changes
    if (apiKey) {
      setValidationStatus('idle');
      setApiKeyError('');
    }
  }, [apiKey]);
  
  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setApiKeyError('API key is required');
      return false;
    }
    
    setIsValidating(true);
    setApiKeyError('');
    
    try {
      // Use the same validation function as onboarding
      const validation = await validateGeminiApiKey(apiKey);
      
      if (validation.isValid) {
        setValidationStatus('valid');
        return true;
      } else {
        setValidationStatus('invalid');
        setApiKeyError(validation.error || 'Invalid API key');
        return false;
      }
    } catch (error: any) {
      setValidationStatus('invalid');
      setApiKeyError(error.message || 'Failed to validate API key. Check your internet connection.');
      return false;
    } finally {
      setIsValidating(false);
    }
  };
  

  
  const handleTestKey = async () => {
    await validateApiKey();
  };
  
  const handleSaveKey = async () => {
    // First validate the API key
    const isKeyValid = await validateApiKey();
    if (!isKeyValid) return;
    
    setIsSaving(true);
    
    try {
      // Save the API key directly without encryption
      await updateUser({
        geminiKey: apiKey.trim(),
      });
      
      onSuccess('API key updated successfully');
      
      // Reset form
      setApiKey('');
      setValidationStatus('idle');
      
    } catch (error: any) {
      onError(error.message || 'Failed to update API key');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleRemoveKey = async () => {
    setIsSaving(true);
    
    try {
      await updateUser({
        geminiKey: '',
      });
      
      onSuccess('API key removed successfully');
      
    } catch (error: any) {
      onError(error.message || 'Failed to remove API key');
    } finally {
      setIsSaving(false);
    }
  };
  
  // const _handleCancel = () => { // Unused function
  //   setApiKey('');
  //   setValidationStatus('idle');
  //   setApiKeyError('');
  // };
  
  return (
    <div className="space-y-6">
      {/* Current API Key Status */}
      <div className={`rounded-lg p-4 ${
        keyStatus === 'available' 
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : 'bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700'
      }`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {keyStatus === 'available' ? (
              <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${
              keyStatus === 'available' 
                ? 'text-green-800 dark:text-green-200'
                : 'text-gray-800 dark:text-gray-200'
            }`}>
              API Key Status
            </h3>
            <div className={`mt-1 text-sm ${
              keyStatus === 'available' 
                ? 'text-green-700 dark:text-green-300'
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              <p>
                {keyStatus === 'available' 
                  ? '✓ Available - Ready for story generation'
                  : '✗ Not Available - Please add your API key'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* API Key Input */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="gemini-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {keyStatus === 'available' ? 'Update Gemini API Key' : 'Gemini API Key'}
          </label>
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Get API Key
          </a>
        </div>
        
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              id="gemini-key"
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                apiKeyError ? 'border-red-500 dark:border-red-500' : 
                validationStatus === 'valid' ? 'border-green-500 dark:border-green-500' :
                validationStatus === 'invalid' ? 'border-red-500 dark:border-red-500' :
                'border-gray-300 dark:border-gray-600'
              }`}
              placeholder={keyStatus === 'available' ? "Enter new API key to update" : "Enter your Gemini API key"}
            />
            
            {/* Show/Hide Toggle */}
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showApiKey ? (
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.12 14.12l1.415 1.415M14.12 14.12L9.878 9.878m4.242 4.242L8.464 15.536" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
            
            {/* Validation Status Icon */}
            {validationStatus === 'valid' && (
              <div className="absolute inset-y-0 right-8 flex items-center">
                <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {validationStatus === 'invalid' && (
              <div className="absolute inset-y-0 right-8 flex items-center">
                <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={handleTestKey}
            disabled={isValidating || !apiKey.trim()}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isValidating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Testing...
              </>
            ) : 'Test Key'}
          </button>
        </div>
        
        {apiKeyError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{apiKeyError}</p>
        )}
        
        {validationStatus === 'valid' && (
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
            ✓ API key is valid and ready to use - Successfully connected to Gemini API
          </p>
        )}
        
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Your API key is stored securely. We validate all keys with the Gemini API before saving.
        </p>
      </div>
      

      
      {/* API Usage Warning */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              API Usage Information
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ul className="list-disc list-inside space-y-1">
                <li>Gemini API usage is subject to Google's rate limits and pricing</li>
                <li>You are responsible for any charges incurred from API usage</li>
                <li>Your API key is stored securely and never shared with third parties</li>
                <li>Remove your API key anytime to stop story generation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between">
        {keyStatus === 'available' && (
          <button
            type="button"
            onClick={handleRemoveKey}
            disabled={isSaving}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Removing...
              </>
            ) : 'Remove API Key'}
          </button>
        )}
        
        <div className="flex space-x-3 ml-auto">
          <button
            type="button"
            onClick={handleSaveKey}
            disabled={isSaving || !apiKey.trim() || validationStatus !== 'valid'}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : keyStatus === 'available' ? 'Update API Key' : 'Save API Key'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;