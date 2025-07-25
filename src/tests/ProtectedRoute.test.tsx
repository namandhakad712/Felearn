import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the auth context
vi.mock('../hooks', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
  })),
}));

// Mock the Navigate component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: vi.fn(() => <div data-testid="navigate">Redirected</div>),
  };
});

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to login when user is not authenticated', () => {
    // Mock useAuth to return not authenticated
    const { useAuth } = require('../hooks');
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Check that it redirected
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show loading state when authentication is being checked', () => {
    // Mock useAuth to return loading state
    const { useAuth } = require('../hooks');
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Check that it shows loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    // Mock useAuth to return authenticated
    const { useAuth } = require('../hooks');
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { $id: 'test-user-id', email: 'test@example.com' },
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Check that it renders children
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('should redirect to custom path when specified', () => {
    // Mock useAuth to return not authenticated
    const { useAuth } = require('../hooks');
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute redirectTo="/custom-login">
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Check that it redirected
    const { Navigate } = require('react-router-dom');
    expect(Navigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/custom-login',
      }),
      expect.anything()
    );
  });
});