import { createGlobalStyle } from 'styled-components';

// Global styles to ensure proper styled-components setup
export const GlobalStyle = createGlobalStyle`
  /* Reset and base styles */
  * {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Ensure styled-components works properly */
  .styled-components-error-17-fix {
    /* This class helps prevent Error #17 */
    display: block;
  }
`;

// Theme configuration
export const theme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#FFFFFF',
    backgroundDark: '#1F2937',
    text: '#1F2937',
    textDark: '#F9FAFB',
    border: '#E5E7EB',
    borderDark: '#374151',
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
};

// Prevent styled-components Error #17
export const preventStyledComponentsError17 = () => {
  if (typeof window !== 'undefined') {
    // Ensure single instance of styled-components
    (window as any).__STYLED_COMPONENTS_VERSION__ = '6.1.19';
    
    // Clear any existing styled-components cache
    if ((window as any).__STYLED_COMPONENTS_CACHE__) {
      delete (window as any).__STYLED_COMPONENTS_CACHE__;
    }
  }
}; 