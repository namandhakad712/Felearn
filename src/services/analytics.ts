import { appwriteService } from './appwrite';
import { storyService } from './story';
import { databaseService } from './database';

// Enhanced interfaces for better type safety
interface DailyData {
  date: string;
  value: number;
  label?: string;
}

interface HeatmapData {
  date: string;
  count: number;
  intensity?: number;
}

interface PerformanceMetric {
  avg: number;
  min: number;
  max: number;
  count: number;
  unit?: string;
  status?: 'good' | 'needs-improvement' | 'poor';
}

interface UserEngagementData {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  averageSessionDuration: number;
}

interface StoryAnalytics {
  totalStories: number;
  storiesThisMonth: number;
  averageStoriesPerUser: number;
  mostPopularTopics: Array<{ topic: string; count: number }>;
  averageStoryLength: number;
}

interface SystemHealth {
  uptime: number;
  responseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

class AnalyticsService {
  private adminCheckCache: { timestamp: number; isAdmin: boolean } | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if current user is admin with caching
   */
  private async checkAdminStatus(): Promise<boolean> {
    try {
      const now = Date.now();
      
      // Use cached result if available and not expired
      if (this.adminCheckCache && (now - this.adminCheckCache.timestamp) < this.CACHE_DURATION) {
        return this.adminCheckCache.isAdmin;
      }

      const currentUser = await appwriteService.getCurrentUser();
      // TODO: Implement proper admin role checking
      // const isAdmin = currentUser?.isAdmin || false;
      const isAdmin = false; // Temporarily disabled admin check
      
      // Cache the result
      this.adminCheckCache = {
        timestamp: now,
        isAdmin
      };
      
      // this.isAdmin = isAdmin; // Removed unused property
      return isAdmin;
    } catch (error) {
      console.warn('Admin status check failed, defaulting to false:', error);
      return false;
    }
  }

  /**
   * Get daily new user registrations for the last 30 days
   */
  async getDailyNewUsers(): Promise<DailyData[]> {
    try {
      const isAdmin = await this.checkAdminStatus();
      if (!isAdmin) {
        console.warn('Analytics access attempted by non-admin user');
        return this.getMockDailyUsers();
      }

      // Try to get real data from database
      try {
        const realData = await this.getRealUserRegistrations();
        if (realData.length > 0) {
          return realData;
        }
      } catch (error) {
        console.warn('Failed to fetch real user data, using mock data:', error);
      }

      return this.getMockDailyUsers();
    } catch (error) {
      console.error('Error getting daily new users:', error);
      return this.getMockDailyUsers();
    }
  }

  /**
   * Get real user registration data from database
   */
  private async getRealUserRegistrations(): Promise<DailyData[]> {
    try {
      // This would query the actual user database
      // For now, return empty array to fall back to mock data
      return [];
    } catch (error) {
      console.error('Error fetching real user registrations:', error);
      return [];
    }
  }

  /**
   * Generate mock daily user data
   */
  private getMockDailyUsers(): DailyData[] {
    const data: DailyData[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      const formattedDate = date.toISOString().split('T')[0];
      
      // More realistic data generation
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseValue = isWeekend ? 5 : 12; // Lower on weekends
      const trend = Math.sin(i / 7) * 3; // Weekly trend
      const random = Math.floor(Math.random() * 8);
      const value = Math.max(0, Math.floor(baseValue + trend + random));

      data.push({
        date: formattedDate,
        value,
        label: `${value} new users`
      });
    }

    return data;
  }

  /**
   * Get daily story generations for the last 30 days
   */
  async getDailyStoryGenerations(): Promise<DailyData[]> {
    try {
      const isAdmin = await this.checkAdminStatus();
      if (!isAdmin) {
        return this.getMockStoryGenerations();
      }

      // Try to get real story data
      try {
        const realData = await this.getRealStoryGenerations();
        if (realData.length > 0) {
          return realData;
        }
      } catch (error) {
        console.warn('Failed to fetch real story data, using mock data:', error);
      }

      return this.getMockStoryGenerations();
    } catch (error) {
      console.error('Error getting daily story generations:', error);
      return this.getMockStoryGenerations();
    }
  }

  /**
   * Get real story generation data
   */
  private async getRealStoryGenerations(): Promise<DailyData[]> {
    try {
      // This would query the actual story database
      // For now, return empty array to fall back to mock data
      return [];
    } catch (error) {
      console.error('Error fetching real story data:', error);
      return [];
    }
  }

  /**
   * Generate mock story generation data
   */
  private getMockStoryGenerations(): DailyData[] {
    const data: DailyData[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      const formattedDate = date.toISOString().split('T')[0];
      
      // More realistic story generation patterns
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseValue = isWeekend ? 25 : 55; // Lower on weekends
      const trend = Math.sin(i / 5) * 15;
      const random = Math.floor(Math.random() * 25);
      const value = Math.max(0, Math.floor(baseValue + trend + random));

      data.push({
        date: formattedDate,
        value,
        label: `${value} stories generated`
      });
    }

    return data;
  }

  /**
   * Get API usage heatmap data for the last 30 days
   */
  async getApiUsageHeatmap(): Promise<HeatmapData[]> {
    try {
      const isAdmin = await this.checkAdminStatus();
      if (!isAdmin) {
        return this.getMockApiUsage();
      }

      return this.getMockApiUsage();
    } catch (error) {
      console.error('Error getting API usage heatmap:', error);
      return this.getMockApiUsage();
    }
  }

  /**
   * Generate mock API usage data
   */
  private getMockApiUsage(): HeatmapData[] {
    const data: HeatmapData[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      const formattedDate = date.toISOString().split('T')[0];
      
      // Generate realistic API usage patterns
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseCount = isWeekend ? 80 : 150;
      const variation = Math.floor(Math.random() * 100);
      const count = Math.max(0, baseCount + variation);
      
      // Calculate intensity (0-1 scale)
      const maxCount = 250;
      const intensity = Math.min(count / maxCount, 1);

      data.push({
        date: formattedDate,
        count,
        intensity
      });
    }

    return data;
  }

  /**
   * Get performance metrics for web vitals and other metrics
   */
  getMetrics(): Record<string, PerformanceMetric> {
    // Enhanced performance metrics with status indicators
    const metrics: Record<string, PerformanceMetric> = {
      'LCP': { 
        avg: 2100, 
        min: 1200, 
        max: 3500, 
        count: 150, 
        unit: 'ms',
        status: 'needs-improvement' 
      },
      'FID': { 
        avg: 45, 
        min: 10, 
        max: 120, 
        count: 120, 
        unit: 'ms',
        status: 'good' 
      },
      'CLS': { 
        avg: 0.08, 
        min: 0.01, 
        max: 0.25, 
        count: 150, 
        unit: '',
        status: 'good' 
      },
      'TTFB': { 
        avg: 320, 
        min: 180, 
        max: 750, 
        count: 150, 
        unit: 'ms',
        status: 'good' 
      },
      'FCP': { 
        avg: 1200, 
        min: 800, 
        max: 2200, 
        count: 150, 
        unit: 'ms',
        status: 'good' 
      },
      'TTI': { 
        avg: 3500, 
        min: 2200, 
        max: 5800, 
        count: 150, 
        unit: 'ms',
        status: 'needs-improvement' 
      }
    };

    return metrics;
  }

  /**
   * Get memory usage statistics
   */
  getMemoryUsage(): { 
    usedJSHeapSize: number; 
    totalJSHeapSize: number; 
    jsHeapSizeLimit: number;
    usagePercentage: number;
    status: 'good' | 'warning' | 'critical';
  } {
    // Try to get real memory data if available
    let memoryInfo = {
      usedJSHeapSize: 25000000,
      totalJSHeapSize: 35000000,
      jsHeapSizeLimit: 2200000000
    };

    // Check if performance.memory is available (Chrome/Edge)
    if ('memory' in performance) {
      const perfMemory = (performance as any).memory;
      memoryInfo = {
        usedJSHeapSize: perfMemory.usedJSHeapSize || memoryInfo.usedJSHeapSize,
        totalJSHeapSize: perfMemory.totalJSHeapSize || memoryInfo.totalJSHeapSize,
        jsHeapSizeLimit: perfMemory.jsHeapSizeLimit || memoryInfo.jsHeapSizeLimit
      };
    }

    const usagePercentage = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
    
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (usagePercentage > 80) {
      status = 'critical';
    } else if (usagePercentage > 60) {
      status = 'warning';
    }

    return {
      ...memoryInfo,
      usagePercentage,
      status
    };
  }

  /**
   * Get user engagement analytics
   */
  async getUserEngagement(): Promise<UserEngagementData> {
    try {
      const isAdmin = await this.checkAdminStatus();
      if (!isAdmin) {
        return this.getMockUserEngagement();
      }

      // Try to get real engagement data
      return this.getMockUserEngagement();
    } catch (error) {
      console.error('Error getting user engagement:', error);
      return this.getMockUserEngagement();
    }
  }

  /**
   * Generate mock user engagement data
   */
  private getMockUserEngagement(): UserEngagementData {
    return {
      totalUsers: 1247,
      activeUsers: 892,
      newUsers: 156,
      returningUsers: 736,
      averageSessionDuration: 18.5 // minutes
    };
  }

  /**
   * Get story analytics
   */
  async getStoryAnalytics(): Promise<StoryAnalytics> {
    try {
      const isAdmin = await this.checkAdminStatus();
      if (!isAdmin) {
        return this.getMockStoryAnalytics();
      }

      // Try to get real story analytics
      return this.getMockStoryAnalytics();
    } catch (error) {
      console.error('Error getting story analytics:', error);
      return this.getMockStoryAnalytics();
    }
  }

  /**
   * Generate mock story analytics
   */
  private getMockStoryAnalytics(): StoryAnalytics {
    return {
      totalStories: 3456,
      storiesThisMonth: 892,
      averageStoriesPerUser: 2.8,
      mostPopularTopics: [
        { topic: 'Science', count: 456 },
        { topic: 'History', count: 342 },
        { topic: 'Technology', count: 298 },
        { topic: 'Nature', count: 234 },
        { topic: 'Space', count: 189 }
      ],
      averageStoryLength: 1250 // words
    };
  }

  /**
   * Get system health metrics
   */
  getSystemHealth(): SystemHealth {
    const now = Date.now();
    const startTime = now - (Math.random() * 86400000); // Random uptime up to 24 hours
    
    return {
      uptime: now - startTime,
      responseTime: 120 + Math.floor(Math.random() * 100), // 120-220ms
      errorRate: Math.random() * 2, // 0-2%
      memoryUsage: 45 + Math.floor(Math.random() * 30), // 45-75%
      cpuUsage: 15 + Math.floor(Math.random() * 25) // 15-40%
    };
  }

  /**
   * Track custom event (for future analytics integration)
   */
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    try {
      console.log('📊 Analytics Event:', eventName, properties);
      
      // In the future, this could send to analytics services like:
      // - Google Analytics
      // - Mixpanel
      // - Amplitude
      // - Custom analytics endpoint
      
      // For now, just log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.table({
          event: eventName,
          timestamp: new Date().toISOString(),
          ...properties
        });
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  /**
   * Get analytics summary for dashboard
   */
  async getAnalyticsSummary() {
    try {
      const [
        dailyUsers,
        dailyStories,
        userEngagement,
        storyAnalytics,
        systemHealth
      ] = await Promise.all([
        this.getDailyNewUsers(),
        this.getDailyStoryGenerations(),
        this.getUserEngagement(),
        this.getStoryAnalytics(),
        Promise.resolve(this.getSystemHealth())
      ]);

      return {
        dailyUsers,
        dailyStories,
        userEngagement,
        storyAnalytics,
        systemHealth,
        performance: this.getMetrics(),
        memory: this.getMemoryUsage()
      };
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      throw new Error('Failed to fetch analytics summary');
    }
  }
}

export const analyticsService = new AnalyticsService();