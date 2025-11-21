import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthRoute } from './AuthRoute';
import { SupabaseProvider } from '../providers/SupabaseProvider';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
  }
};

vi.mock('../providers/SupabaseProvider', () => ({
  useSupabase: () => mockSupabase
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </SupabaseProvider>
    </QueryClientProvider>
  );
};

describe('AuthRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock already authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null
    });
  });

  it('redirects authenticated users to parent portal', async () => {
    render(<AuthRoute />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(window.location.pathname).toBe('/parent-portal');
    });
  });

  it('shows sign in form by default', async () => {
    // Mock no authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });

    render(<AuthRoute />, { wrapper: createWrapper() });

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('can switch between sign in and sign up modes', async () => {
    // Mock no authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });

    render(<AuthRoute />, { wrapper: createWrapper() });

    // Click sign up link
    fireEvent.click(screen.getByText("Don't have an account? Sign up"));

    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();

    // Click sign in link
    fireEvent.click(screen.getByText('Already have an account? Sign in'));

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });

  it('handles sign in successfully', async () => {
    // Mock no authenticated user initially
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null
    });

    // Mock successful sign in
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null
    });

    render(<AuthRoute />, { wrapper: createWrapper() });

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' }
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('shows error for invalid credentials', async () => {
    // Mock no authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });

    // Mock sign in error
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' }
    });

    render(<AuthRoute />, { wrapper: createWrapper() });

    // Fill and submit form
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'wrongpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
    });
  });

  it('validates password confirmation on signup', async () => {
    // Mock no authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });

    render(<AuthRoute />, { wrapper: createWrapper() });

    // Switch to signup
    fireEvent.click(screen.getByText("Don't have an account? Sign up"));

    // Fill form with mismatched passwords
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'differentpassword' }
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });
});