import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import AppRoutes from './components/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { GlobalStyle, theme, preventStyledComponentsError17 } from './utils/styledComponentsConfig';
import { NetworkStatus } from './components/ui';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Prevent styled-components Error #17
preventStyledComponentsError17();

function App() {
  return (
    <BrowserRouter>
      <StyledThemeProvider theme={theme}>
        <GlobalStyle />
        <ErrorBoundary>
          <AuthProvider>
            <ThemeProvider>
              <NetworkStatus />
              <AppRoutes />
            </ThemeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </StyledThemeProvider>
    </BrowserRouter>
  );
}

export default App;