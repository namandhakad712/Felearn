import { User } from '../types';
import { appwriteService } from './appwrite';
// import { Query } from 'appwrite';

interface UserActivity {
  type: string;
  timestamp: string;
  details: string;
}

class AdminService {
  /**
   * Get all users with pagination
   */
  async getUsers(): Promise<User[]> {
    try {
      // Check if current user is admin
      const currentUser = await appwriteService.getCurrentUser();
      if (!currentUser?.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Get all users from the database
      const users = await appwriteService.getAllUsers();
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error('Failed to get users. Please try again.');
    }
  }

  /**
   * Get user activity history
   */
  async getUserActivity(userId: string): Promise<UserActivity[]> {
    try {
      // Check if current user is admin
      const currentUser = await appwriteService.getCurrentUser();
      if (!currentUser?.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Get user activity from the database
      const activity = await appwriteService.getUserActivity(userId);
      
      // Format activity data
      return activity.map(item => ({
        type: item.type,
        timestamp: item.timestamp,
        details: item.details
      }));
    } catch (error) {
      console.error('Error getting user activity:', error);
      throw new Error('Failed to get user activity. Please try again.');
    }
  }

  /**
   * Update user status (enable/disable)
   */
  async updateUserStatus(userId: string, disabled: boolean): Promise<void> {
    try {
      // Check if current user is admin
      const currentUser = await appwriteService.getCurrentUser();
      if (!currentUser?.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Update user status
      await appwriteService.updateUserStatus(userId, disabled);
      
      // Log admin action
      await appwriteService.createAdminLog(
        disabled ? 'user.disable' : 'user.enable',
        { userId, adminId: currentUser.$id }
      );
    } catch (error) {
      console.error('Error updating user status:', error);
      throw new Error('Failed to update user status. Please try again.');
    }
  }

  /**
   * Get admin dashboard metrics
   */
  async getDashboardMetrics(): Promise<{
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    storyCount: number;
    errorCount: number;
  }> {
    try {
      // Check if current user is admin
      const currentUser = await appwriteService.getCurrentUser();
      if (!currentUser?.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Get metrics from the database
      const metrics = await appwriteService.getAdminMetrics();
      return metrics;
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw new Error('Failed to get dashboard metrics. Please try again.');
    }
  }

  /**
   * Get error logs with filtering
   */
  async getErrorLogs(): Promise<any[]> {
    try {
      // Check if current user is admin
      const currentUser = await appwriteService.getCurrentUser();
      if (!currentUser?.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Get error logs from the database
      const errorLogs = await appwriteService.getErrorLogs();
      return errorLogs;
    } catch (error) {
      console.error('Error getting error logs:', error);
      throw new Error('Failed to get error logs. Please try again.');
    }
  }

  /**
   * Resolve an error
   */
  async resolveError(errorId: string): Promise<void> {
    try {
      // Check if current user is admin
      const currentUser = await appwriteService.getCurrentUser();
      if (!currentUser?.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Mark error as resolved
      await appwriteService.resolveError(errorId);
      
      // Log admin action
      await appwriteService.createAdminLog(
        'error.resolve',
        { errorId, adminId: currentUser.$id }
      );
    } catch (error) {
      console.error('Error resolving error:', error);
      throw new Error('Failed to resolve error. Please try again.');
    }
  }

  /**
   * Create error report
   */
  async createErrorReport(errorData: {
    type: 'frontend' | 'backend' | 'api';
    message: string;
    stack?: string;
    userId?: string;
    context: Record<string, any>;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    try {
      // Create error report in the database
      await appwriteService.createErrorReport(errorData);
    } catch (error) {
      console.error('Error creating error report:', error);
      throw new Error('Failed to create error report. Please try again.');
    }
  }
}

export const adminService = new AdminService();