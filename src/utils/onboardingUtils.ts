/**
 * Onboarding Session Management Utilities
 * Handles session-based onboarding state to prevent users from getting stuck
 */

export const ONBOARDING_SESSION_KEY = 'felearn_onboarding_session';

export interface OnboardingSession {
  started: number;
  currentStep: number;
  completed: boolean;
  skipped?: boolean;
}

/**
 * Initialize a new onboarding session
 */
export const initOnboardingSession = (): void => {
  const sessionData: OnboardingSession = {
    started: Date.now(),
    currentStep: 1,
    completed: false
  };
  
  sessionStorage.setItem(ONBOARDING_SESSION_KEY, JSON.stringify(sessionData));
  console.log('🆕 New onboarding session initialized');
};

/**
 * Get current onboarding session data
 */
export const getOnboardingSession = (): OnboardingSession | null => {
  const sessionData = sessionStorage.getItem(ONBOARDING_SESSION_KEY);
  if (!sessionData) return null;
  
  try {
    return JSON.parse(sessionData);
  } catch (error) {
    console.error('❌ Error parsing onboarding session:', error);
    return null;
  }
};

/**
 * Update onboarding session step
 */
export const updateOnboardingStep = (step: number): void => {
  const session = getOnboardingSession();
  if (session) {
    session.currentStep = step;
    sessionStorage.setItem(ONBOARDING_SESSION_KEY, JSON.stringify(session));
  }
};

/**
 * Mark onboarding session as completed
 */
export const completeOnboardingSession = (skipped: boolean = false): void => {
  const session = getOnboardingSession();
  if (session) {
    session.completed = true;
    session.skipped = skipped;
    sessionStorage.setItem(ONBOARDING_SESSION_KEY, JSON.stringify(session));
    console.log('✅ Onboarding session marked as completed');
  }
};

/**
 * Clear onboarding session
 */
export const clearOnboardingSession = (): void => {
  sessionStorage.removeItem(ONBOARDING_SESSION_KEY);
  console.log('🧹 Onboarding session cleared');
};

/**
 * Check if user has an active onboarding session
 */
export const hasActiveOnboardingSession = (): boolean => {
  const session = getOnboardingSession();
  return session !== null && !session.completed;
};

/**
 * Check if onboarding session is completed
 */
export const isOnboardingSessionCompleted = (): boolean => {
  const session = getOnboardingSession();
  return session !== null && session.completed;
};

/**
 * Handle page unload/visibility change to clear session
 */
export const setupOnboardingSessionCleanup = (): (() => void) => {
  const handleBeforeUnload = () => {
    clearOnboardingSession();
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      clearOnboardingSession();
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

/**
 * Reset onboarding state for a user (useful for testing or recovery)
 */
export const resetUserOnboardingState = async (userId: string): Promise<void> => {
  try {
    const { databaseService } = await import('@/services/database');
    await databaseService.updateUserDocument(userId, {
      onboardingcompleted: false
    });
    clearOnboardingSession();
    console.log('🔄 User onboarding state reset');
  } catch (error) {
    console.error('❌ Failed to reset onboarding state:', error);
    throw error;
  }
}; 