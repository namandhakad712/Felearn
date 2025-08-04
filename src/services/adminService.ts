import { Query } from 'appwrite';
import { databaseService } from './databaseService';
import { APPWRITE_CONFIG } from '../config/appwrite';
import { AdminLog, User } from '../types';

/**
 * Admin Service
 * Handles all admin-related database operations
 */
export class AdminService {
  private readonly adminLogsCollectionId: string;
  private readonly errorLogsCollectionId: string;
  private readonly usersCollectionId: string;
  
  constructor() {
    this.adminLogsCollectionId = APPWRITE_CONFIG.collections.adminLogs;
    this.errorLogsCollectionId = APPWRITE_CONFIG.collections.errorLogs;
    this.usersCollectionId = APPWRITE_CONFIG.collections.users;
  }

  /**
   * Create an admin log entry
   * @param adminId Admin user ID
   * @param action Action performed
   * @param details Details of the action
   * @returns Promise with the created log
   */
  async createAdminLog(
    adminId: string,
    action: string,
    details: Record<string, any>
  ): Promise<AdminLog> {
    const logData: Partial<AdminLog> = {
      adminId,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    
    return databaseService.createDocument<AdminLog>(
      this.adminLogsCollectionId,
      logData
    );
  }

  /**
   * Get admin logs
   * @param limit Optional limit of logs to return
   * @param offset Optional offset for pagination
   * @returns Promise with logs and total count
   */
  async getAdminLogs(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ logs: AdminLog[]; total: number }> {
    const result = await databaseService.listDocuments<AdminLog>(
      this.adminLogsCollectionId,
      [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc('timestamp')
      ]
    );
    
    return {
      logs: result.documents,
      total: result.total
    };
  }

  /**
   * Get admin logs by admin ID
   * @param adminId Admin user ID
   * @param limit Optional limit of logs to return
   * @returns Promise with logs
   */
  async getAdminLogsByAdmin(adminId: string, limit: number = 20): Promise<AdminLog[]> {
    const result = await databaseService.listDocuments<AdminLog>(
      this.adminLogsCollectionId,
      [
        Query.equal('adminId', adminId),
        Query.limit(limit),
        Query.orderDesc('timestamp')
      ]
    );
    
    return result.documents;
  }

  /**
   * Get error logs
   * @param resolved Optional filter for resolved status
   * @param limit Optional limit of logs to return
   * @param offset Optional offset for pagination
   * @returns Promise with error logs and total count
   */
  async getErrorLogs(
    resolved?: boolean,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ logs: any[]; total: number }> {
    const queries = [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc('timestamp')
    ];
    
    // Add resolved filter if provided
    if (resolved !== undefined) {
      queries.push(Query.equal('resolved', resolved));
    }
    
    const result = await databaseService.listDocuments<any>(
      this.errorLogsCollectionId,
      queries
    );
    
    return {
      logs: result.documents,
      total: result.total
    };
  }

  /**
   * Mark an error log as resolved
   * @param errorId Error log ID
   * @param resolved Whether the error is resolved
   * @returns Promise with the updated error log
   */
  async resolveError(errorId: string, resolved: boolean = true): Promise<any> {
    return databaseService.updateDocument<any>(
      this.errorLogsCollectionId,
      errorId,
      { resolved }
    );
  }

  /**
   * Get admin metrics
   * @returns Promise with admin metrics
   */
  async getAdminMetrics(): Promise<{
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    errorCount: number;
  }> {
    // Get all users
    const { total: totalUsers, documents: users } = await databaseService.listDocuments<User>(
      this.usersCollectionId,
      [Query.limit(1000)]
    );
    
    // Calculate new users (registered in the last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const newUsers = users.filter(
      user => user.createdAt && new Date(user.createdAt) > oneDayAgo
    ).length;
    
    // Calculate active users (logged in in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = users.filter(user => 
      user.lastLogin && new Date(user.lastLogin) > sevenDaysAgo
    ).length;
    
    // Get unresolved error count
    const { total: errorCount } = await databaseService.listDocuments<any>(
      this.errorLogsCollectionId,
      [Query.equal('resolved', false)]
    );
    
    return {
      totalUsers,
      newUsers,
      activeUsers,
      errorCount
    };
  }

  /**
   * Get all users for admin management
   * @param limit Optional limit of users to return
   * @param offset Optional offset for pagination
   * @returns Promise with users
   */
  async getUsers(limit: number = 100, offset: number = 0): Promise<User[]> {
    const result = await databaseService.listDocuments<User>(
      this.usersCollectionId,
      [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc('createdAt')
      ]
    );
    
    return result.documents;
  }

  /**
   * Get dashboard stats (alias for getAdminMetrics for backward compatibility)
   * @param _dateRange Optional date range filter (currently unused but kept for compatibility)
   * @returns Promise with dashboard stats
   */
  async getDashboardStats(_dateRange?: string): Promise<{
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    errorCount: number;
  }> {
    return this.getAdminMetrics();
  }

  /**
   * Get recent logs (alias for getAdminLogs for backward compatibility)  
   * @param limit Number of logs to return
   * @returns Promise with recent logs
   */
  async getRecentLogs(limit: number = 10): Promise<AdminLog[]> {
    const result = await this.getAdminLogs(limit, 0);
    return result.logs;
  }

  /**
   * Disable user (wrapper for updateUserStatus)
   * @param userId User ID to disable
   * @param adminId Admin performing the action
   * @returns Promise with updated user
   */
  async disableUser(userId: string, adminId: string): Promise<User> {
    return this.updateUserStatus(userId, true, adminId);
  }

  /**
   * Get user activity history
   * @param userId User ID
   * @returns Promise with user activity
   */
  async getUserActivity(userId: string): Promise<any[]> {
    // TODO: Implement user activity tracking
    console.log('User activity tracking not implemented yet for user:', userId);
    return [];
  }

  /**
   * Enable user (wrapper for updateUserStatus)  
   * @param userId User ID to enable
   * @param adminId Admin performing the action
   * @returns Promise with updated user
   */
  async enableUser(userId: string, adminId: string): Promise<User> {
    return this.updateUserStatus(userId, false, adminId);
  }

  /**
   * Update user status (enable/disable)
   * @param userId User ID
   * @param disabled Whether the user should be disabled
   * @param adminId Admin user ID
   * @returns Promise with the updated user
   */
  async updateUserStatus(userId: string, disabled: boolean, adminId: string): Promise<User> {
    // Update user status
    const updatedUser = await databaseService.updateDocument<User>(
      this.usersCollectionId,
      userId,
      { disabled }
    );
    
    // Log the action
    await this.createAdminLog(
      adminId,
      disabled ? 'disable_user' : 'enable_user',
      { userId, disabled }
    );
    
    return updatedUser;
  }

  /**
   * Set user as admin
   * @param userId User ID
   * @param isAdmin Whether the user should be an admin
   * @param adminId Admin user ID performing the action
   * @returns Promise with the updated user
   */
  async setUserAdmin(userId: string, isAdmin: boolean, adminId: string): Promise<User> {
    // Update user admin status
    const updatedUser = await databaseService.updateDocument<User>(
      this.usersCollectionId,
      userId,
      { isAdmin }
    );
    
    // Log the action
    await this.createAdminLog(
      adminId,
      isAdmin ? 'grant_admin' : 'revoke_admin',
      { userId, isAdmin }
    );
    
    return updatedUser;
  }
}

// Create and export a singleton instance
export const adminService = new AdminService();