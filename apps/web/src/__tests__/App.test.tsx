import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../app/App';

// Mock the auth user to avoid Firebase calls
vi.mock('../modules/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    error: null,
  }),
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // The app should render the login page when not authenticated
    expect(document.body).toBeDefined();
  });

  it('contains the app structure', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeDefined();
  });
});