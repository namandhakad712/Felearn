import React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface NetworkStatusProps {
  showWhenOnline?: boolean;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ showWhenOnline = false }) => {
  const { isOnline, isReconnecting, connectionType } = useNetworkStatus();

  if (isOnline && !showWhenOnline) {
    return null;
  }

  if (isOnline) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-medium">
          Connected {connectionType && `(${connectionType})`}
        </span>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      <span className="text-sm font-medium">
        {isReconnecting ? 'Reconnecting...' : 'No Internet Connection'}
      </span>
    </div>
  );
};

export default NetworkStatus; 