import React, { useState, useEffect } from 'react';
import { MetricCard } from './MetricCard';

interface MetricsData {
  newUsers: number;
  storyCount: number;
  apiErrors: number;
  activeUsers: number;
  apiUsage: number;
  averageResponseTime: number;
}

interface DashboardMetricsProps {
  dateRange: 'today' | 'week' | 'month';
  isLoading: boolean;
  onRefresh: () => void;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  dateRange,
  isLoading,
  // _onRefresh, // Unused parameter
}) => {
  const [metrics, setMetrics] = useState<MetricsData>({
    newUsers: 0,
    storyCount: 0,
    apiErrors: 0,
    activeUsers: 0,
    apiUsage: 0,
    averageResponseTime: 0,
  });
  
  const [previousMetrics, setPreviousMetrics] = useState<MetricsData>({
    newUsers: 0,
    storyCount: 0,
    apiErrors: 0,
    activeUsers: 0,
    apiUsage: 0,
    averageResponseTime: 0,
  });

  // Fetch metrics data based on date range
  useEffect(() => {
    if (!isLoading) {
      // In a real implementation, this would fetch data from your backend
      // For now, we'll use mock data with different values based on date range
      let mockData: MetricsData;
      let previousData: MetricsData;
      
      switch (dateRange) {
        case 'week':
          mockData = {
            newUsers: 78,
            storyCount: 412,
            apiErrors: 15,
            activeUsers: 156,
            apiUsage: 1250,
            averageResponseTime: 1.8,
          };
          previousData = {
            newUsers: 65,
            storyCount: 380,
            apiErrors: 12,
            activeUsers: 140,
            apiUsage: 1100,
            averageResponseTime: 1.9,
          };
          break;
        case 'month':
          mockData = {
            newUsers: 342,
            storyCount: 1876,
            apiErrors: 64,
            activeUsers: 523,
            apiUsage: 5200,
            averageResponseTime: 1.7,
          };
          previousData = {
            newUsers: 310,
            storyCount: 1650,
            apiErrors: 58,
            activeUsers: 480,
            apiUsage: 4800,
            averageResponseTime: 1.8,
          };
          break;
        case 'today':
        default:
          mockData = {
            newUsers: 12,
            storyCount: 87,
            apiErrors: 3,
            activeUsers: 45,
            apiUsage: 250,
            averageResponseTime: 1.5,
          };
          previousData = {
            newUsers: 10,
            storyCount: 75,
            apiErrors: 2,
            activeUsers: 40,
            apiUsage: 220,
            averageResponseTime: 1.6,
          };
      }
      
      setMetrics(mockData);
      setPreviousMetrics(previousData);
    }
  }, [dateRange, isLoading]);

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.round(Math.abs(change)),
      isPositive: change >= 0,
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricCard
        title="New Users"
        value={metrics.newUsers}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        }
        color="green"
        change={calculateChange(metrics.newUsers, previousMetrics.newUsers)}
        isLoading={isLoading}
      />
      
      <MetricCard
        title="Stories Generated"
        value={metrics.storyCount}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        }
        color="blue"
        change={calculateChange(metrics.storyCount, previousMetrics.storyCount)}
        isLoading={isLoading}
      />
      
      <MetricCard
        title="API Errors"
        value={metrics.apiErrors}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        color="red"
        change={{
          ...calculateChange(metrics.apiErrors, previousMetrics.apiErrors),
          isPositive: metrics.apiErrors <= previousMetrics.apiErrors,
        }}
        isLoading={isLoading}
      />
      
      <MetricCard
        title="Active Users"
        value={metrics.activeUsers}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        }
        color="purple"
        change={calculateChange(metrics.activeUsers, previousMetrics.activeUsers)}
        isLoading={isLoading}
      />
      
      <MetricCard
        title="API Usage"
        value={`${metrics.apiUsage} calls`}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
        color="yellow"
        change={calculateChange(metrics.apiUsage, previousMetrics.apiUsage)}
        isLoading={isLoading}
      />
      
      <MetricCard
        title="Avg Response Time"
        value={`${metrics.averageResponseTime.toFixed(1)}s`}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        color="indigo"
        change={{
          ...calculateChange(previousMetrics.averageResponseTime, metrics.averageResponseTime),
          isPositive: metrics.averageResponseTime <= previousMetrics.averageResponseTime,
        }}
        isLoading={isLoading}
      />
    </div>
  );
};