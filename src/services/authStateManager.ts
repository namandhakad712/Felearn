import { User } from '../types/user';
import { AuthService } from './auth';

/**
 * Authentication State Manager
 * Manages authentication state across the application using Appwrite
 */
export class AuthStateManager {
  private static instance: AuthStateManager;
  private listeners: Array<(user: User | null) => void> = [];
  private currentUser: User | null = null;
  private isInitialized = false;
  private authService: AuthService;
  
  // Session storage keys
  private readonly SESSION_KEY = 'auth_session';
  private readonly SESSION_EXPIRY_KEY = 'auth_session_expiry';
  
  // Default session expiry time (24 hours)
  private readonly DEFAULT_SESSION_EXPIRY = 24 * 60 * 60 * 1000;
  
  private constructor() {
    this.authService = new AuthService();
  }
  
  /**
   * Get the singleton instance
   * @returns The AuthStateManager instance
   */
  public static getInstance(): AuthStateManager {
    if (!AuthStateManager.instance) {
      AuthStateManager.instance = new AuthStateManager();
    }
    return AuthStateManager.instance;
  }
  
  /**
   * Initialize the authentication state manager
   * @returns Promise indicating success
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    
    try {
      // Try to restore session
      await this.restoreSession();
      
      // Set up polling for session changes (Appwrite doesn't have a built-in listener)
      this.setupSessionPolling();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing auth state manager:', error);
      this.currentUser = null;
    }
  }
  
  /**
   * Add a listener for authentication state changes
   * @param listener Function to call when auth state changes
   * @returns Function to remove the listener
   */
  public addAuthStateListener(listener: (user: User | null) => void): () => void {
    this.listeners.push(listener);
    
    // Call the listener immediately with the current state
    listener(this.currentUser);
    
    // Return a function to remove the listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Get the current user
   * @returns The current user or null if not authenticated
   */
  public getCurrentUser(): User | null {
    return this.currentUser;
  }
  
  /**
   * Check if a user is currently authenticated
   * @returns Boolean indicating if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.currentUser;
  }
  
  /**
   * Update the authentication state
   * @param user The new user state
   */
  public async updateAuthState(user: User | null): Promise<void> {
    // Only update if the state has changed
    if (this.hasUserChanged(this.currentUser, user)) {
      this.currentUser = user;
      
      // Update session storage
      if (user) {
        this.saveSession(user);
      } else {
        this.clearSession();
      }
      
      // Notify listeners
      this.notifyListeners();
    }
  }

  /**
   * Clear the authentication state
   */
  public async clearAuthState(): Promise<void> {
    this.currentUser = null;
    this.clearSession();
    this.notifyListeners();
  }
  
  /**
   * Restore the authentication session from storage
   * @returns Promise indicating success
   */
  private async restoreSession(): Promise<void> {
    try {
      // First check if session is valid in storage
      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      const sessionExpiry = sessionStorage.getItem(this.SESSION_EXPIRY_KEY);
      
      if (sessionData && sessionExpiry) {
        const expiryTime = parseInt(sessionExpiry, 10);
        
        // Check if session has expired
        if (Date.now() < expiryTime) {
          // Session is still valid in storage, but we need to verify with Appwrite
          const user = await this.authService.getCurrentUser();
          
          if (user) {
            // Session is valid in Appwrite too
            this.currentUser = user;
            return;
          }
        }
        
        // Session has expired or is invalid in Appwrite
        this.clearSession();
      }
      
      // No valid session in storage, check with Appwrite directly
      const user = await this.authService.getCurrentUser();
      
      if (user) {
        // Valid session in Appwrite
        this.currentUser = user;
        this.saveSession(user);
      } else {
        this.currentUser = null;
      }
    } catch (error) {
      console.error('Error restoring session:', error);
      this.currentUser = null;
      this.clearSession();
    }
  }
  
  /**
   * Save the session to storage
   * @param user The user to save
   */
  private saveSession(user: User): void {
    try {
      // Save minimal user data to session storage
      const sessionData = {
        $id: user.$id,
        email: user.email,
      };
      
      // Set expiry time
      const expiryTime = Date.now() + this.DEFAULT_SESSION_EXPIRY;
      
      // Save to session storage
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
      sessionStorage.setItem(this.SESSION_EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }
  
  /**
   * Clear the session from storage
   */
  private clearSession(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem(this.SESSION_EXPIRY_KEY);
  }
  
  /**
   * Set up polling for session changes
   * Appwrite doesn't have a built-in listener for session changes,
   * so we need to poll for changes
   */
  private setupSessionPolling(): void {
    // Poll every 5 minutes
    const POLL_INTERVAL = 5 * 60 * 1000;
    
    setInterval(async () => {
      try {
        // Check if session is still valid
        const user = await this.authService.getCurrentUser();
        
        // Update auth state if needed
        await this.updateAuthState(user);
      } catch (error) {
        console.error('Error polling for session changes:', error);
      }
    }, POLL_INTERVAL);
  }
  
  /**
   * Notify all listeners of the current auth state
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentUser);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }
  
  /**
   * Check if the user state has changed
   * @param oldUser The old user state
   * @param newUser The new user state
   * @returns Boolean indicating if the user has changed
   */
  private hasUserChanged(oldUser: User | null, newUser: User | null): boolean {
    // If both are null or undefined, no change
    if (!oldUser && !newUser) {
      return false;
    }
    
    // If one is null and the other isn't, change
    if ((!oldUser && newUser) || (oldUser && !newUser)) {
      return true;
    }
    
    // If both exist, compare IDs
    return oldUser!.$id !== newUser!.$id;
  }
}

// Export the singleton instance
export const authStateManager = AuthStateManager.getInstance();