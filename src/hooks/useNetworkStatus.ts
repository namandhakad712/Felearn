import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isReconnecting: boolean;
  lastOnline: Date | null;
  connectionType: string | null;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isReconnecting: false,
    lastOnline: navigator.onLine ? new Date() : null,
    connectionType: null
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      
      setNetworkStatus(prev => ({
        ...prev,
        isOnline,
        lastOnline: isOnline ? new Date() : prev.lastOnline,
        isReconnecting: !isOnline && prev.isOnline
      }));
    };

    const handleOnline = () => {
      console.log('🌐 Network connection restored');
      updateNetworkStatus();
    };

    const handleOffline = () => {
      console.log('📡 Network connection lost');
      updateNetworkStatus();
    };

    // Check connection type if available
    const checkConnectionType = async () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          setNetworkStatus(prev => ({
            ...prev,
            connectionType: connection.effectiveType || connection.type
          }));
        }
      }
    };

    // Initial check
    updateNetworkStatus();
    checkConnectionType();

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return networkStatus;
}; 