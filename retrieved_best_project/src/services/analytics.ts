import { appwriteService } from './appwrite';

interface DailyData {
  date: string;
  value: number;
}

interface HeatmapData {
  date: string;
  count: number;
}

interface PerformanceMetric {
  avg: number;
  min: number;
  max: number;
  count: number;
}

class AnalyticsService {
  /**
   * Get daily new user registrations for the last 30 days
   */
  async getDailyNewUsers(): Promise<DailyData[]> {
    try {
      // Get current user to verify admin status
      const currentUser = await appwriteService.getCurrentUser();
      if (!currentUser?.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }
      
      // In a real implementation, this would query Appwrite for user registrations
      // For now, we'll return mock data
      
      const data: DailyData[] = [];
      const today = new Date();
      
      // Generate data for the last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        // Format date as YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];
        
        // Generate a random value between 0 and 20, with a trend
        const baseValue = 10; // Average daily registrations
        const trend = Math.sin(i / 5) * 5; // Sinusoidal trend
        const random = Math.floor(Math.random() * 10); // Random variation
        const value = Math.max(0, Math.floor(baseValue + trend + random));
        
        data.push({
          date: formattedDate,
          value,
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error getting daily new users:', error);
      throw new Error('Failed to fetch daily new users data');
    }
  }
  
  /**
   * Get daily story generations for the last 30 days
   */
  async getDailyStoryGenerations(): Promise<DailyData[]> {
    try {
      // Get current user to verify admin status
      const currentUser = await appwriteService.getCurrentUser();
      if (!currentUser?.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }
      
      // In a real implementation, this would query Appwrite for story creations
      // For now, we'll return mock data
      
      const data: DailyData[] = [];
      const today = new Date();
      
      // Generate data for the last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        // Format date as YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];
        
        // Generate a random value between 0 and 100, with a trend
        const baseValue = 50; // Average daily story generations
        const trend = Math.sin(i / 3) * 20; // Sinusoidal trend
        const random = Math.floor(Math.random() * 30); // Random variation
        const value = Math.max(0, Math.floor(baseValue + trend + random));
        
        data.push({
          date: formattedDate,
          value,
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error getting daily story generations:', error);
      throw new Error('Failed to fetch daily story generations data');
    }
  }
  
  /**
   * Get API usage heatmap data for the last 30 days
   */
  async getApiUsageHeatmap(): Promise<HeatmapData[]> {
    try {
      // Get current user to verify admin status
      const currentUser = await appwriteService.getCurrentUser();
      if (!currentUser?.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }
      
      // In a real implementation, this would query Appwrite for API usage
      // For now, we'll return mock data
      
      const data: HeatmapData[] = [];
      const today = new Date();
      
      // Generate data for the last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        // Format date as YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];
        
        // Generate a random count between 0 and 200
        const count = Math.floor(Math.random() * 200);
        
        data.push({
          date: formattedDate,
          count,
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error getting API usage heatmap:', error);
      throw new Error('Failed to fetch API usage heatmap data');
    }
  }
}

  /**
   * Get performance metrics for web vitals and other metrics
   */
  getMetrics(): Record<string, PerformanceMetric> {
    // Mock data for performance metrics
    return {
      'LCP': { avg: 2100, min: 1200, max: 3500, count: 150 },
      'FID': { avg: 45, min: 10, max: 120, count: 120 },
      'CLS': { avg: 0.08, min: 0.01, max: 0.25, count: 150 },
      'TTFB': { avg: 320, min: 180, max: 750, count: 150 },
      'FCP': { avg: 1200, min: 800, max: 2200, count: 150 },
      'TTI': { avg: 3500, min: 2200, max: 5800, count: 150 },
    };
  }

  /**
   * Get memory usage statistics
   */
  getMemoryUsage(): { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } {
    // Mock data for memory usage
    return {
      usedJSHeapSize: 25000000,
      totalJSHeapSize: 35000000,
      jsHeapSizeLimit: 2200000000
    };
  }
}

export const analyticsService = new AnalyticsService();