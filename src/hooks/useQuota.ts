import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import { useAuth } from './useAuth';

interface QuotaInfo {
  remaining: number;
  total: number;
  resetsAt: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for managing user's daily story generation quota
 */
export const useQuota = () => {
  const { user } = useAuth();
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo>({
    remaining: 15,
    total: 15,
    resetsAt: new Date().toISOString(),
    isLoading: true,
    error: null
  });

  /**
   * Fetch current quota information
   */
  const fetchQuota = useCallback(async () => {
    if (!user?.$id) {
      setQuotaInfo(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setQuotaInfo(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Fetch fresh quota from database
      const quota = await userService.getUserQuota(user.$id);
      
      console.log('📊 Quota fetched from database:', {
        userId: user.$id,
        remaining: quota.remaining,
        total: quota.total,
        resetsAt: quota.resetsAt
      });
      
      setQuotaInfo({
        remaining: quota.remaining,
        total: quota.total,
        resetsAt: quota.resetsAt,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('❌ Error fetching quota:', error);
      setQuotaInfo(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch quota'
      }));
    }
  }, [user?.$id]);

  /**
   * Check if user has quota remaining
   */
  const hasQuota = useCallback((): boolean => {
    return quotaInfo.remaining > 0;
  }, [quotaInfo.remaining]);

  /**
   * Decrement quota after successful story generation
   */
  const decrementQuota = useCallback(async (): Promise<boolean> => {
    if (!user?.$id) return false;

    try {
      const result = await userService.decrementQuota(user.$id);
      
      // Immediately fetch fresh quota from database
      await fetchQuota();
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('quotaUpdated'));
      
      console.log('Quota decremented successfully. New remaining:', result.remaining);
      
      return true;
    } catch (error: any) {
      console.error('Error decrementing quota:', error);
      setQuotaInfo(prev => ({
        ...prev,
        error: error.message || 'Failed to update quota'
      }));
      return false;
    }
  }, [user?.$id, fetchQuota]);

  /**
   * Get time until quota resets
   */
  const getTimeUntilReset = useCallback((): string => {
    const now = new Date();
    const resetTime = new Date(quotaInfo.resetsAt);
    const diff = resetTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Soon';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, [quotaInfo.resetsAt]);

  // Fetch quota on mount and when user changes
  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  // Refresh quota every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchQuota();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [fetchQuota]);

  // Listen for quota update events
  useEffect(() => {
    const handleQuotaUpdate = () => {
      console.log('Quota update event received, refreshing...');
      fetchQuota();
    };

    window.addEventListener('quotaUpdated', handleQuotaUpdate);
    return () => window.removeEventListener('quotaUpdated', handleQuotaUpdate);
  }, [fetchQuota]);

  return {
    ...quotaInfo,
    hasQuota,
    decrementQuota,
    refreshQuota: fetchQuota,
    getTimeUntilReset
  };
};
