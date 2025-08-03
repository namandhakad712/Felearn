import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from '../hooks';
import { 
  getStoredTheme, 
  storeTheme, 
  isThemeManuallySet, 
  applyThemeToDocument,
  type Theme 
} from '../utils/themeUtils';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check if theme is stored in localStorage using utility
    const savedTheme = getStoredTheme();
    
    // If no saved theme, use system preference
    if (!savedTheme) {
      return systemColorScheme;
    }
    
    return savedTheme;
  });

  // Custom setTheme function that ensures persistence
  const setTheme = (newTheme: Theme, isManual: boolean = true) => {
    console.log('🎨 Setting theme:', newTheme, 'Manual:', isManual);
    setThemeState(newTheme);
    storeTheme(newTheme, isManual);
  };

  useEffect(() => {
    // Apply theme to document
    applyThemeToDocument(theme);
  }, [theme]);

  // Update theme when system preference changes (only if not manually set)
  useEffect(() => {
    const savedTheme = getStoredTheme();
    const manuallySet = isThemeManuallySet();
    
    if (!savedTheme && !manuallySet) {
      console.log('🎨 Applying system theme:', systemColorScheme);
      setThemeState(systemColorScheme);
      storeTheme(systemColorScheme, false);
    }
  }, [systemColorScheme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('🎨 Toggling theme from', theme, 'to', newTheme);
    setTheme(newTheme, true);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};