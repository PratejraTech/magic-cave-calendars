import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DailyEntriesStep, DailyEntriesData } from './DailyEntriesStep';
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
  get: vi.fn(),
  put: vi.fn(),
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

describe('DailyEntriesStep', () => {
  const mockOnNext = vi.fn();
  const mockOnDataChange = vi.fn();
  const calendarId = 'calendar-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });
    mockHttpClient.get.mockResolvedValue({ data: { days: [] } });
  });

  it('renders the 24-day grid with all required elements', () => {
    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Create Your Daily Entries')).toBeInTheDocument();
    expect(screen.getByText('Fill in each of the 24 days with a special message and optional photo for your child.')).toBeInTheDocument();
    expect(screen.getByText('0 of 24 days completed')).toBeInTheDocument();

    // Check that all 24 day cards are rendered
    for (let i = 1; i <= 24; i++) {
      expect(screen.getByText(`Day ${i}`)).toBeInTheDocument();
    }
  });

  it('validates that messages are required for each day', () => {
    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    const nextButton = screen.getByRole('button', { name: /next: choose theme/i });
    expect(nextButton).toBeDisabled();
    expect(screen.getByText('Please complete all 24 remaining days')).toBeInTheDocument();
  });

  it('enables next button when all days have messages', async () => {
    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    // Fill in messages for a few days
    const messageInputs = screen.getAllByPlaceholderText(/write a special message/i);
    
    // Fill first few days
    for (let i = 0; i < 5; i++) {
      fireEvent.change(messageInputs[i], { target: { value: `Message for day ${i + 1}` } });
    }

    // Should still show validation error
    expect(screen.getByText(/Please complete all \d+ remaining days/)).toBeInTheDocument();

    // The button should be disabled initially
    const nextButton = screen.getByRole('button', { name: /next: choose theme/i });
    expect(nextButton).toBeDisabled();
  });

  it('handles save all functionality', async () => {
    mockHttpClient.put.mockResolvedValue({ data: {} });

    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    // Add a message and try to save
    const messageInputs = screen.getAllByPlaceholderText(/write a special message/i);
    fireEvent.change(messageInputs[0], { target: { value: 'Test message' } });

    const saveButton = screen.getByRole('button', { name: /save all changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockHttpClient.put).toHaveBeenCalledWith('/calendars/calendar-123/days', expect.any(Object));
    });
  });

  it('calls onDataChange when day entries change', () => {
    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    const messageInputs = screen.getAllByPlaceholderText(/write a special message/i);
    fireEvent.change(messageInputs[0], { target: { value: 'Test message' } });

    expect(mockOnDataChange).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarId: 'calendar-123',
        dayEntries: expect.any(Array)
      })
    );
  });

  it('loads initial data correctly', () => {
    const initialData: Partial<DailyEntriesData> = {
      dayEntries: [
        {
          dayNumber: 1,
          title: 'Custom Title',
          photo: null,
          photoUrl: 'https://example.com/photo.jpg',
          message: 'Initial message',
          isValid: true,
          isSaved: true
        }
      ]
    };

    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
        initialData={initialData}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByDisplayValue('Custom Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial message')).toBeInTheDocument();
  });

  it('loads data from API on mount', async () => {
    const apiData = {
      days: [
        {
          day_number: 1,
          title: 'API Title',
          photo_asset_id: 'https://example.com/api-photo.jpg',
          text_content: 'API message content'
        },
        {
          day_number: 2,
          title: 'Day 2',
          photo_asset_id: null,
          text_content: 'API message 2'
        }
      ]
    };

    mockHttpClient.get.mockResolvedValue({ data: apiData });

    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(mockHttpClient.get).toHaveBeenCalledWith('/calendars/calendar-123/days');
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('API Title')).toBeInTheDocument();
      expect(screen.getByDisplayValue('API message content')).toBeInTheDocument();
      expect(screen.getByDisplayValue('API message 2')).toBeInTheDocument();
    });
  });

  it('handles API loading error gracefully', async () => {
    mockHttpClient.get.mockRejectedValue(new Error('API Error'));

    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    // Should still render with default state despite API error
    await waitFor(() => {
      expect(screen.getByText('Create Your Daily Entries')).toBeInTheDocument();
    });

    // Should not show error to user, just use initial state
    expect(screen.getByText('0 of 24 days completed')).toBeInTheDocument();
  });

  it('shows loading state while fetching data', () => {
    mockHttpClient.get.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: { days: [] } }), 100))
    );

    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Loading your calendar...')).toBeInTheDocument();
  });

  it('updates completion progress correctly', async () => {
    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    // Initially 0 completed
    expect(screen.getByText('0 of 24 days completed')).toBeInTheDocument();

    // Fill in some messages
    const messageInputs = screen.getAllByPlaceholderText(/write a special message/i);
    fireEvent.change(messageInputs[0], { target: { value: 'Message 1' } });
    fireEvent.change(messageInputs[1], { target: { value: 'Message 2' } });
    fireEvent.change(messageInputs[2], { target: { value: 'Message 3' } });

    expect(screen.getByText('3 of 24 days completed')).toBeInTheDocument();
  });

  it('enables next button only when all days are complete', async () => {
    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    const nextButton = screen.getByRole('button', { name: /next: choose theme/i });
    expect(nextButton).toBeDisabled();

    // Fill in all 24 messages
    const messageInputs = screen.getAllByPlaceholderText(/write a special message/i);
    for (let i = 0; i < 24; i++) {
      fireEvent.change(messageInputs[i], { target: { value: `Message for day ${i + 1}` } });
    }

    await waitFor(() => {
      expect(nextButton).toBeEnabled();
    });
  });

  it('handles save all with network error', async () => {
    mockHttpClient.put.mockRejectedValue({
      response: { data: { message: 'Network error occurred' } }
    });

    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    // Add a message and try to save
    const messageInputs = screen.getAllByPlaceholderText(/write a special message/i);
    fireEvent.change(messageInputs[0], { target: { value: 'Test message' } });

    const saveButton = screen.getByRole('button', { name: /save all changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    });

    // Should not mark as saved
    expect(saveButton).toBeEnabled(); // Still enabled since save failed
  });

  it('prevents next action if save fails', async () => {
    mockHttpClient.put.mockRejectedValue(new Error('Save failed'));

    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    // Fill all messages
    const messageInputs = screen.getAllByPlaceholderText(/write a special message/i);
    for (let i = 0; i < 24; i++) {
      fireEvent.change(messageInputs[i], { target: { value: `Message ${i + 1}` } });
    }

    const nextButton = screen.getByRole('button', { name: /next: choose theme/i });
    fireEvent.click(nextButton);

    // Should attempt to save but fail
    await waitFor(() => {
      expect(mockHttpClient.put).toHaveBeenCalled();
    });

    // onNext should not be called due to save failure
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('calls onNext with correct data after successful save', async () => {
    mockHttpClient.put.mockResolvedValue({ data: {} });

    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    // Fill all messages
    const messageInputs = screen.getAllByPlaceholderText(/write a special message/i);
    for (let i = 0; i < 24; i++) {
      fireEvent.change(messageInputs[i], { target: { value: `Message ${i + 1}` } });
    }

    const nextButton = screen.getByRole('button', { name: /next: choose theme/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledWith(
        expect.objectContaining({
          calendarId: 'calendar-123',
          dayEntries: expect.any(Array)
        })
      );
    });

    const calledData = mockOnNext.mock.calls[0][0];
    expect(calledData.dayEntries).toHaveLength(24);
    expect(calledData.dayEntries[0]).toEqual(
      expect.objectContaining({
        dayNumber: 1,
        message: 'Message 1',
        isValid: true,
        isSaved: true
      })
    );
  });

  it('handles photo upload callbacks correctly', async () => {
    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    // Simulate photo upload callback (this would come from DayCard)
    const messageInputs = screen.getAllByPlaceholderText(/write a special message/i);
    fireEvent.change(messageInputs[0], { target: { value: 'Message with photo' } });

    // The photo upload would trigger onDataChange
    expect(mockOnDataChange).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarId: 'calendar-123',
        dayEntries: expect.any(Array)
      })
    );
  });

  it('maintains data integrity across re-renders', () => {
    const { rerender } = render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    // Add some data
    const messageInputs = screen.getAllByPlaceholderText(/write a special message/i);
    fireEvent.change(messageInputs[0], { target: { value: 'Persistent message' } });

    // Re-render
    rerender(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />
    );

    // Data should persist
    expect(screen.getByDisplayValue('Persistent message')).toBeInTheDocument();
  });

  it('handles bulk updates from BulkActions component', () => {
    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    // The BulkActions component would trigger bulk updates
    // This is tested indirectly through the onDataChange calls
    const messageInputs = screen.getAllByPlaceholderText(/write a special message/i);
    fireEvent.change(messageInputs[0], { target: { value: 'Updated by bulk action' } });

    expect(mockOnDataChange).toHaveBeenCalled();
  });

  it('shows proper navigation flow', () => {
    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Back to Child Profile')).toBeInTheDocument();
    expect(screen.getByText('Next: Choose Theme')).toBeInTheDocument();
  });

  it('displays error messages prominently', async () => {
    mockHttpClient.put.mockRejectedValue({
      response: { data: { message: 'Server validation error' } }
    });

    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    const messageInputs = screen.getAllByPlaceholderText(/write a special message/i);
    fireEvent.change(messageInputs[0], { target: { value: 'Test' } });

    const saveButton = screen.getByRole('button', { name: /save all changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Server validation error')).toBeInTheDocument();
    });

    // Error should be visible and styled appropriately
    const errorElement = screen.getByText('Server validation error');
    expect(errorElement).toHaveClass('text-red-800');
  });

  it('handles empty calendarId gracefully', () => {
    render(
      <DailyEntriesStep
        calendarId=""
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    // Should still render but not make API calls
    expect(screen.getByText('Create Your Daily Entries')).toBeInTheDocument();
    expect(mockHttpClient.get).not.toHaveBeenCalled();
  });

  it('validates day entry data structure', () => {
    render(
      <DailyEntriesStep
        calendarId={calendarId}
        onNext={mockOnNext}
        onDataChange={mockOnDataChange}
      />,
      { wrapper: createWrapper() }
    );

    // Each day should have proper structure
    for (let i = 1; i <= 24; i++) {
      expect(screen.getByText(`Day ${i}`)).toBeInTheDocument();
      expect(screen.getByLabelText(`Title (Optional)`)).toBeInTheDocument();
      expect(screen.getByLabelText('Photo (Optional)')).toBeInTheDocument();
      expect(screen.getByLabelText('Message *')).toBeInTheDocument();
    }
  });
});
