import { AuthService } from './auth';

/**
 * Session Manager
 * Handles authentication session management
 */
export class SessionManager {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Initialize authentication session
   * @returns Promise with session status
   */
  async initializeAuthSession(): Promise<{ isAuthenticated: boolean; message: string }> {
    try {
      // Try to get current session
      const session = await this.authService.getCurrentUser();
      
      if (session) {
        return {
          isAuthenticated: true,
          message: 'Active session found'
        };
      }

      return {
        isAuthenticated: false,
        message: 'No active session'
      };
    } catch (error: any) {
      // Don't log 401 errors as they're expected when not logged in
      if (error?.code !== 401) {
        console.error('Session initialization error:', error);
      }
      
      return {
        isAuthenticated: false,
        message: 'No active session'
      };
    }
  }

  /**
   * Check if there's an active session
   * @returns Promise<boolean>
   */
  async hasActiveSession(): Promise<boolean> {
    try {
      const user = await this.authService.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear current session
   */
  async clearSession(): Promise<void> {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }
}

// Export singleton instance
export const sessionManager = new SessionManager(); 