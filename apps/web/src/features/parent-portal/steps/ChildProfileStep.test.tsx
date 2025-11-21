import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ChildProfileStep, ChildProfileData } from './ChildProfileStep';
import { SupabaseProvider } from '../../../app/providers/SupabaseProvider';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/photo.jpg' } }))
    }))
  }
};

vi.mock('../../../app/providers/SupabaseProvider', () => ({
  useSupabase: () => mockSupabase
}));

// Mock httpClient
const mockHttpClient = {
  post: vi.fn()
};

vi.mock('../../../lib/httpClient', () => ({
  httpClient: mockHttpClient
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
        {children}
      </SupabaseProvider>
    </QueryClientProvider>
  );
};

describe('ChildProfileStep', () => {
  const mockOnNext = vi.fn();
  const mockOnDataChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });
  });

  it('renders the form with all required fields', () => {
    render(
      <ChildProfileStep onNext={mockOnNext} onDataChange={mockOnDataChange} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Set up your child\'s profile')).toBeInTheDocument();
    expect(screen.getByLabelText(/child's name/i)).toBeInTheDocument();
    expect(screen.getByText('Hero Photo (Optional)')).toBeInTheDocument();
    expect(screen.getByText('Chat Persona *')).toBeInTheDocument();
    expect(screen.getByText('Mummy')).toBeInTheDocument();
    expect(screen.getByText('Daddy')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('validates child name is required', async () => {
    render(
      <ChildProfileStep onNext={mockOnNext} onDataChange={mockOnDataChange} />,
      { wrapper: createWrapper() }
    );

    const nextButton = screen.getByRole('button', { name: /next: daily entries/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Child name is required')).toBeInTheDocument();
    });
  });

  it('validates child name length', async () => {
    render(
      <ChildProfileStep onNext={mockOnNext} onDataChange={mockOnDataChange} />,
      { wrapper: createWrapper() }
    );

    const nameInput = screen.getByLabelText(/child's name/i);
    fireEvent.change(nameInput, { target: { value: 'A'.repeat(101) } });

    const nextButton = screen.getByRole('button', { name: /next: daily entries/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Child name must be between 1 and 100 characters')).toBeInTheDocument();
    });
  });

  it('allows selecting different chat personas', () => {
    render(
      <ChildProfileStep onNext={mockOnNext} onDataChange={mockOnDataChange} />,
      { wrapper: createWrapper() }
    );

    const daddyButton = screen.getByRole('button', { name: /daddy/i });
    fireEvent.click(daddyButton);

    expect(daddyButton).toHaveClass('ring-pink-200');
  });

  it('shows custom prompt field when custom persona is selected', () => {
    render(
      <ChildProfileStep onNext={mockOnNext} onDataChange={mockOnDataChange} />,
      { wrapper: createWrapper() }
    );

    const customButton = screen.getByRole('button', { name: /custom/i });
    fireEvent.click(customButton);

    expect(screen.getByLabelText(/custom persona prompt/i)).toBeInTheDocument();
  });

  it('validates custom prompt is required when custom persona selected', async () => {
    render(
      <ChildProfileStep onNext={mockOnNext} onDataChange={mockOnDataChange} />,
      { wrapper: createWrapper() }
    );

    // Select custom persona
    const customButton = screen.getByRole('button', { name: /custom/i });
    fireEvent.click(customButton);

    // Try to submit without prompt
    const nextButton = screen.getByRole('button', { name: /next: daily entries/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Custom persona prompt is required')).toBeInTheDocument();
    });
  });

  it('validates photo file type', async () => {
    render(
      <ChildProfileStep onNext={mockOnNext} onDataChange={mockOnDataChange} />,
      { wrapper: createWrapper() }
    );

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement;

    // Mock the file input change event
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false
    });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('Please select a valid image file')).toBeInTheDocument();
    });
  });

  it('validates photo file size', async () => {
    render(
      <ChildProfileStep onNext={mockOnNext} onDataChange={mockOnDataChange} />,
      { wrapper: createWrapper() }
    );

    // Create a large file (6MB)
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
      writable: false
    });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('Image file must be less than 5MB')).toBeInTheDocument();
    });
  });

  it('handles successful form submission', async () => {
    mockHttpClient.post.mockResolvedValue({ data: { child_id: 'child-123' } });

    render(
      <ChildProfileStep onNext={mockOnNext} onDataChange={mockOnDataChange} />,
      { wrapper: createWrapper() }
    );

    // Fill required fields
    const nameInput = screen.getByLabelText(/child's name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Child' } });

    // Select persona
    const mummyButton = screen.getByRole('button', { name: /mummy/i });
    fireEvent.click(mummyButton);

    // Submit form
    const nextButton = screen.getByRole('button', { name: /next: daily entries/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockHttpClient.post).toHaveBeenCalledWith('/child', {
        child_name: 'Test Child',
        hero_photo_url: '',
        chat_persona: 'mummy'
      });
      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  it('handles API errors gracefully', async () => {
    mockHttpClient.post.mockRejectedValue({
      response: { data: { message: 'Validation failed' } }
    });

    render(
      <ChildProfileStep onNext={mockOnNext} onDataChange={mockOnDataChange} />,
      { wrapper: createWrapper() }
    );

    // Fill required fields
    const nameInput = screen.getByLabelText(/child's name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Child' } });

    const mummyButton = screen.getByRole('button', { name: /mummy/i });
    fireEvent.click(mummyButton);

    // Submit form
    const nextButton = screen.getByRole('button', { name: /next: daily entries/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Validation failed')).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    mockHttpClient.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <ChildProfileStep onNext={mockOnNext} onDataChange={mockOnDataChange} />,
      { wrapper: createWrapper() }
    );

    // Fill required fields
    const nameInput = screen.getByLabelText(/child's name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Child' } });

    const mummyButton = screen.getByRole('button', { name: /mummy/i });
    fireEvent.click(mummyButton);

    // Submit form
    const nextButton = screen.getByRole('button', { name: /next: daily entries/i });
    fireEvent.click(nextButton);

    expect(screen.getByText('Creating Profile...')).toBeInTheDocument();
  });

  it('calls onDataChange when form data changes', () => {
    render(
      <ChildProfileStep onNext={mockOnNext} onDataChange={mockOnDataChange} />,
      { wrapper: createWrapper() }
    );

    const nameInput = screen.getByLabelText(/child's name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Child' } });

    expect(mockOnDataChange).toHaveBeenCalledWith(
      expect.objectContaining({ childName: 'Test Child' })
    );
  });

  it('loads initial data correctly', () => {
    const initialData: Partial<ChildProfileData> = {
      childName: 'Initial Child',
      chatPersona: 'daddy',
      heroPhotoUrl: 'https://example.com/photo.jpg'
    };

    render(
      <ChildProfileStep
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
        initialData={initialData}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByDisplayValue('Initial Child')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /daddy/i })).toHaveClass('ring-pink-200');
  });
});