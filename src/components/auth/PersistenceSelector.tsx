import React from 'react';
import { useAuthPersistence } from '../../hooks';

interface PersistenceSelectorProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Component for selecting authentication persistence type
 */
const PersistenceSelector: React.FC<PersistenceSelectorProps> = ({ onSuccess, onError }) => {
  const { persistenceType, setPersistence, isLoading, error } = useAuthPersistence();
  
  const handlePersistenceChange = async (type: string) => {
    const success = await setPersistence(type);
    
    if (success && onSuccess) {
      onSuccess();
    } else if (!success && error && onError) {
      onError(error);
    }
  };
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Session Persistence
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Choose how long you want to stay logged in:
      </p>
      
      <div className="space-y-3">
        <div className="flex items-center">
          <input
            type="radio"
            id="persistence-local"
            name="persistence"
            value="LOCAL"
            checked={persistenceType === 'LOCAL'}
            onChange={() => handlePersistenceChange('LOCAL')}
            disabled={isLoading}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <label htmlFor="persistence-local" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Remember me (stays logged in even after browser restart)
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="radio"
            id="persistence-session"
            name="persistence"
            value="SESSION"
            checked={persistenceType === 'SESSION'}
            onChange={() => handlePersistenceChange('SESSION')}
            disabled={isLoading}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <label htmlFor="persistence-session" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Current session only (logs out when browser is closed)
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="radio"
            id="persistence-none"
            name="persistence"
            value="NONE"
            checked={persistenceType === 'NONE'}
            onChange={() => handlePersistenceChange('NONE')}
            disabled={isLoading}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <label htmlFor="persistence-none" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            No persistence (logs out when tab is closed or refreshed)
          </label>
        </div>
      </div>
      
      {isLoading && (
        <div className="mt-3 text-sm text-blue-600 dark:text-blue-400">
          Updating persistence setting...
        </div>
      )}
      
      {error && (
        <div className="mt-3 text-sm text-red-600 dark:text-red-400">
          {error.message}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>Note: Changing this setting will take effect on your next login.</p>
      </div>
    </div>
  );
};

export default PersistenceSelector;