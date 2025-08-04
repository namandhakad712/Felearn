import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  getStoredTheme, 
  isThemeManuallySet, 
  getThemeTimestamp,
  type Theme 
} from '@/utils/themeUtils';

/**
 * Hook that automatically applies the user's saved theme preference
 * Should be used in the main dashboard or app component
 * Only applies theme on initial load, respects manual theme changes
 */
export const useUserTheme = () => {
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const hasAppliedUserTheme = useRef(false);
  const userLoadTimestamp = useRef<number>(0);

  useEffect(() => {
    // Only apply user theme once when user data first loads
    if (user?.settings && !hasAppliedUserTheme.current) {
      try {
        let userSettings;
        
        // Parse settings if it's a string
        if (typeof user.settings === 'string') {
          userSettings = JSON.parse(user.settings);
        } else {
          userSettings = user.settings;
        }

        // Check if user has a theme preference
        if (userSettings?.theme && (userSettings.theme === 'light' || userSettings.theme === 'dark')) {
          const currentTheme = getStoredTheme();
          const isManual = isThemeManuallySet();
          const themeTimestamp = getThemeTimestamp();
          const currentTime = Date.now();
          
          // Only apply user theme if:
          // 1. No theme is currently set, OR
          // 2. Theme was not manually set recently (within last 5 minutes), OR
          // 3. Current theme matches user preference (no conflict)
          const recentManualChange = isManual && (currentTime - themeTimestamp) < 5 * 60 * 1000; // 5 minutes
          
          if (!currentTheme || (!recentManualChange && currentTheme !== userSettings.theme)) {
            // Applying user theme from settings
            setTheme(userSettings.theme as Theme); // Mark as non-manual
          } else {
            // Keeping current theme
          }
        }
        
        hasAppliedUserTheme.current = true;
        userLoadTimestamp.current = Date.now();
      } catch (error) {
        console.error('Error parsing user settings for theme:', error);
      }
    }
  }, [user?.settings, setTheme]);
};