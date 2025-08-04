import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin';
import { Card } from '../../components/ui';
import { adminService } from '../../services';
import { analyticsService } from '../../services/analytics';
import { AdminLog } from '../../types';
import { LineChart, BarChart, HeatmapCalendar } from '../../components/admin/charts';

/**
 * Helper function to format a timestamp as a relative time string (e.g., "5 minutes ago")
 */
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
};

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    newUsers: 0,
    storyCount: 0,
    apiErrors: 0,
    activeUsers: 0,
  });
  
  const [recentLogs, setRecentLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogsLoading, setIsLogsLoading] = useState(true);
  const [isChartsLoading, setIsChartsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Analytics chart data
  const [newUsersChartData, setNewUsersChartData] = useState<{ labels: string[], data: number[] }>({
    labels: [],
    data: [],
  });
  
  const [storyGenerationsChartData, setStoryGenerationsChartData] = useState<{ labels: string[], data: number[] }>({
    labels: [],
    data: [],
  });
  
  const [apiUsageHeatmapData, setApiUsageHeatmapData] = useState<{ date: string, count: number }[]>([]);
  
  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      // Fetch stats from admin service
      const dashboardStats = await adminService.getDashboardStats(dateRange);
      setStats({
        newUsers: dashboardStats.newUsers,
        storyCount: 0, // TODO: Implement story count
        apiErrors: dashboardStats.errorCount,
        activeUsers: dashboardStats.activeUsers,
      });
      
      // Fetch recent logs
      const logs = await adminService.getRecentLogs(5);
      setRecentLogs(logs);
      
      setIsLoading(false);
      setIsLogsLoading(false);
      setIsRefreshing(false);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to fetch dashboard data');
      setIsLoading(false);
      setIsLogsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Function to fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setIsChartsLoading(true);
      
      // Fetch daily new users data
      const newUsersData = await analyticsService.getDailyNewUsers();
      setNewUsersChartData({
        labels: newUsersData.map(item => {
          // Format date as MM/DD
          const date = new Date(item.date);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        }),
        data: newUsersData.map(item => item.value),
      });
      
      // Fetch daily story generations data
      const storyGenerationsData = await analyticsService.getDailyStoryGenerations();
      setStoryGenerationsChartData({
        labels: storyGenerationsData.map(item => {
          // Format date as MM/DD
          const date = new Date(item.date);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        }),
        data: storyGenerationsData.map(item => item.value),
      });
      
      // Fetch API usage heatmap data
      const heatmapData = await analyticsService.getApiUsageHeatmap();
      setApiUsageHeatmapData(heatmapData);
      
      setIsChartsLoading(false);
    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      setIsChartsLoading(false);
    }
  };
  
  // Fetch data on initial load and when date range changes
  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);
  
  // Fetch analytics data on initial load
  useEffect(() => {
    fetchAnalyticsData();
  }, []);
  
  // Set up auto-refresh every 5 minutes
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
      fetchAnalyticsData();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, [dateRange]);
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Overview of system performance and user activity
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Date Range Selector */}
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setDateRange('today')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                  dateRange === 'today'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } border border-gray-300 dark:border-gray-600`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDateRange('week')}
                className={`px-4 py-2 text-sm font-medium ${
                  dateRange === 'week'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } border-t border-b border-gray-300 dark:border-gray-600`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => setDateRange('month')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  dateRange === 'month'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } border border-gray-300 dark:border-gray-600`}
              >
                Month
              </button>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={fetchDashboardData}
              disabled={isRefreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isRefreshing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Today's Stats */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Today's Snapshot
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      New Users
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.newUsers}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Stories Generated
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.storyCount}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      API Errors
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.apiErrors}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active Users
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.activeUsers}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error Loading Dashboard Data
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {error}
                </p>
                <button
                  onClick={() => setError(null)}
                  className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Recent Activity
          </h2>
          
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isLogsLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        </td>
                      </tr>
                    ))
                  ) : recentLogs.length > 0 ? (
                    recentLogs.map((log, index) => {
                      // Generate initials for the admin avatar
                      const initials = log.adminId.substring(0, 2).toUpperCase();
                      
                      // Generate a consistent color based on the adminId
                      const colors = ['bg-indigo-500', 'bg-pink-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500', 'bg-blue-500'];
                      const colorIndex = log.adminId.charCodeAt(0) % colors.length;
                      const avatarColor = colors[colorIndex];
                      
                      // Format the timestamp
                      const timestamp = new Date(log.timestamp);
                      const timeAgo = getTimeAgo(timestamp);
                      
                      return (
                        <tr key={log.$id || index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`h-8 w-8 rounded-full ${avatarColor} flex items-center justify-center text-white`}>
                                {initials}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  Admin
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {log.adminId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {log.action}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {timeAgo}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button 
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              onClick={() => alert(JSON.stringify(log.details, null, 2))}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No recent activity logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        
        {/* Analytics Charts */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Analytics
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Daily New Users Chart */}
            <Card>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">
                Daily New Users (Last 30 Days)
              </h3>
              
              {isChartsLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <LineChart
                  title="New Users"
                  labels={newUsersChartData.labels}
                  data={newUsersChartData.data}
                  borderColor="rgb(59, 130, 246)"
                  backgroundColor="rgba(59, 130, 246, 0.2)"
                  height={250}
                />
              )}
            </Card>
            
            {/* Daily Story Generations Chart */}
            <Card>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">
                Daily Story Generations (Last 30 Days)
              </h3>
              
              {isChartsLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <BarChart
                  title="Story Generations"
                  labels={storyGenerationsChartData.labels}
                  data={storyGenerationsChartData.data}
                  backgroundColor="rgba(99, 102, 241, 0.8)"
                  height={250}
                />
              )}
            </Card>
          </div>
          
          {/* API Usage Heatmap */}
          <div className="mb-4">
            {isChartsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ) : (
              <HeatmapCalendar
                title="API Usage Heatmap (Last 30 Days)"
                data={apiUsageHeatmapData}
              />
            )}
          </div>
        </div>
        
        {/* System Health */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            System Health
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                API Response Time
              </h3>
              <div className="h-40 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Chart will be implemented in the next phase
                </p>
              </div>
            </Card>
            
            <Card>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                Server Load
              </h3>
              <div className="h-40 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Chart will be implemented in the next phase
                </p>
              </div>
            </Card>
          </div>
          

        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;