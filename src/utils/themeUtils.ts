/**
 * Theme persistence utilities to prevent theme reversion issues
 */

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';
export const THEME_MANUAL_KEY = 'theme-manual';
export const THEME_TIMESTAMP_KEY = 'theme-timestamp';

/**
 * Get the current theme from localStorage with fallback
 */
export const getStoredTheme = (): Theme | null => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  return null;
};

/**
 * Store theme with timestamp to track when it was set
 */
export const storeTheme = (theme: Theme, isManual: boolean = true): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    localStorage.setItem(THEME_MANUAL_KEY, isManual.toString());
    localStorage.setItem(THEME_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Failed to store theme in localStorage:', error);
  }
};

/**
 * Check if theme was manually set by user
 */
export const isThemeManuallySet = (): boolean => {
  try {
    return localStorage.getItem(THEME_MANUAL_KEY) === 'true';
  } catch (error) {
    console.warn('Failed to check manual theme flag:', error);
    return false;
  }
};

/**
 * Get timestamp of when theme was last set
 */
export const getThemeTimestamp = (): number => {
  try {
    const timestamp = localStorage.getItem(THEME_TIMESTAMP_KEY);
    return timestamp ? parseInt(timestamp, 10) : 0;
  } catch (error) {
    console.warn('Failed to get theme timestamp:', error);
    return 0;
  }
};

/**
 * Clear theme manual flag (used when applying user settings)
 */
export const clearManualThemeFlag = (): void => {
  try {
    localStorage.removeItem(THEME_MANUAL_KEY);
  } catch (error) {
    console.warn('Failed to clear manual theme flag:', error);
  }
};

/**
 * Apply theme to document with proper class management
 */
export const applyThemeToDocument = (theme: Theme): void => {
  // Add transition for smooth theme changes
  document.documentElement.classList.add('transition-colors', 'duration-300');
  
  // Apply theme class
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Remove transition after animation completes
  setTimeout(() => {
    document.documentElement.classList.remove('transition-colors', 'duration-300');
  }, 300);
};