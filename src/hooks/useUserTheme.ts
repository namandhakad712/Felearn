import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Hook that automatically applies the user's saved theme preference
 * Should be used in the main dashboard or app component
 */
export const useUserTheme = () => {
  const { user } = useAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (user?.settings) {
      try {
        let userSettings;
        
        // Parse settings if it's a string
        if (typeof user.settings === 'string') {
          userSettings = JSON.parse(user.settings);
        } else {
          userSettings = user.settings;
        }

        // Apply user's theme preference if it exists
        if (userSettings?.theme && (userSettings.theme === 'light' || userSettings.theme === 'dark')) {
          console.log('Applying user theme from settings:', userSettings.theme);
          setTheme(userSettings.theme);
        }
      } catch (error) {
        console.error('Error parsing user settings for theme:', error);
      }
    }
  }, [user?.settings, setTheme]);
};