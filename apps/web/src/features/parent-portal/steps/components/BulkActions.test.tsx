import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BulkActions } from './BulkActions';
import { DayEntry } from './DayCard';

// Mock httpClient
const mockHttpClient = {
  get: vi.fn(),
  put: vi.fn(),
  post: vi.fn()
};

vi.mock('../../../../lib/httpClient', () => ({
  httpClient: mockHttpClient
}));

describe('BulkActions', () => {
  const mockOnBulkUpdate = vi.fn();
  const mockOnSaveAll = vi.fn();
  const calendarId = 'calendar-123';

  const createMockDayEntries = (count: number): DayEntry[] => {
    return Array.from({ length: count }, (_, i) => ({
      dayNumber: i + 1,
      title: `Day ${i + 1}`,
      photo: null,
      photoUrl: i % 2 === 0 ? `https://example.com/photo${i + 1}.jpg` : '',
      message: i < 20 ? `Message for day ${i + 1}` : '',
      isValid: i < 20,
      isSaved: false
    }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all bulk action buttons', () => {
    const dayEntries = createMockDayEntries(24);

    render(
      <BulkActions
        dayEntries={dayEntries}
        onBulkUpdate={mockOnBulkUpdate}
        onSaveAll={mockOnSaveAll}
        calendarId={calendarId}
      />
    );

    expect(screen.getByText('Bulk Actions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate all messages/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear all photos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset all messages/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save all changes/i })).toBeInTheDocument();
  });

  it('shows help text for bulk actions', () => {
    const dayEntries = createMockDayEntries(24);

    render(
      <BulkActions
        dayEntries={dayEntries}
        onBulkUpdate={mockOnBulkUpdate}
        onSaveAll={mockOnSaveAll}
        calendarId={calendarId}
      />
    );

    expect(screen.getByText(/AI Generation:/)).toBeInTheDocument();
    expect(screen.getByText(/Bulk Actions:/)).toBeInTheDocument();
  });

  it('disables clear photos button when no photos exist', () => {
    const dayEntries = createMockDayEntries(24).map(entry => ({
      ...entry,
      photo: null,
      photoUrl: ''
    }));

    render(
      <BulkActions
        dayEntries={dayEntries}
        onBulkUpdate={mockOnBulkUpdate}
        onSaveAll={mockOnSaveAll}
        calendarId={calendarId}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear all photos/i });
    expect(clearButton).toBeDisabled();
  });

  it('enables clear photos button when photos exist', () => {
    const dayEntries = createMockDayEntries(24);

    render(
      <BulkActions
        dayEntries={dayEntries}
        onBulkUpdate={mockOnBulkUpdate}
        onSaveAll={mockOnSaveAll}
        calendarId={calendarId}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear all photos/i });
    expect(clearButton).toBeEnabled();
  });

  it('disables reset messages button when no messages exist', () => {
    const dayEntries = createMockDayEntries(24).map(entry => ({
      ...entry,
      message: ''
    }));

    render(
      <BulkActions
        dayEntries={dayEntries}
        onBulkUpdate={mockOnBulkUpdate}
        onSaveAll={mockOnSaveAll}
        calendarId={calendarId}
      />
    );

    const resetButton = screen.getByRole('button', { name: /reset all messages/i });
    expect(resetButton).toBeDisabled();
  });

  it('enables reset messages button when messages exist', () => {
    const dayEntries = createMockDayEntries(24);

    render(
      <BulkActions
        dayEntries={dayEntries}
        onBulkUpdate={mockOnBulkUpdate}
        onSaveAll={mockOnSaveAll}
        calendarId={calendarId}
      />
    );

    const resetButton = screen.getByRole('button', { name: /reset all messages/i });
    expect(resetButton).toBeEnabled();
  });

  it('disables save all button when no unsaved changes exist', () => {
    const dayEntries = createMockDayEntries(24).map(entry => ({
      ...entry,
      isSaved: true
    }));

    render(
      <BulkActions
        dayEntries={dayEntries}
        onBulkUpdate={mockOnBulkUpdate}
        onSaveAll={mockOnSaveAll}
        calendarId={calendarId}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save all changes/i });
    expect(saveButton).toBeDisabled();
  });

  it('enables save all button when unsaved changes exist', () => {
    const dayEntries = createMockDayEntries(24).map(entry => ({
      ...entry,
      isSaved: false,
      message: 'Unsaved message'
    }));

    render(
      <BulkActions
        dayEntries={dayEntries}
        onBulkUpdate={mockOnBulkUpdate}
        onSaveAll={mockOnSaveAll}
        calendarId={calendarId}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save all changes/i });
    expect(saveButton).toBeEnabled();
  });

  it('handles AI message generation successfully', async () => {
    const dayEntries = createMockDayEntries(24);
    const generatedMessages = dayEntries.map(entry => ({
      dayNumber: entry.dayNumber,
      message: `AI generated message for day ${entry.dayNumber}`
    }));

    mockHttpClient.post.mockResolvedValue({
      data: { messages: generatedMessages }
    });

    render(
      <BulkActions
        dayEntries={dayEntries}
        onBulkUpdate={mockOnBulkUpdate}
        onSaveAll={mockOnSaveAll}
        calendarId={calendarId}
      />
    );

    const generateButton = screen.getByRole('button', { name: /generate all messages/i });
    fireEvent.click(generateButton);

    expect(screen.getByText('Generating...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockHttpClient.post).toHaveBeenCalledWith('/calendars/calendar-123/generate-messages', {
        // The backend will generate messages for all days
      });
    });

    await waitFor(() => {
      expect(mockOnBulkUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          1: { message: 'AI generated message for day 1', isValid: true },
          2: { message: 'AI generated message for day 2', isValid: true }
        })
      );
    });

    expect(screen.queryByText('Generating...')).not.toBeInTheDocument();
  });

  it('handles AI message generation error', async () => {
    const dayEntries = createMockDayEntries(24);

    mockHttpClient.post.mockRejectedValue({
      response: { data: { message: 'AI generation failed' } }
    });

    render(
      <BulkActions
        dayEntries={dayEntries}
        onBulkUpdate={mockOnBulkUpdate}
        onSaveAll={mockOnSaveAll}
        calendarId={calendarId}
      />
    );

    const generateButton = screen.getByRole('button', { name: /generate all messages/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('AI generation failed')).toBeInTheDocument();
    });

    expect(mockOnBulkUpdate).not.toHaveBeenCalled();
  });

  it('clears all photos when clear button is clicked', () => {
    const dayEntries = createMockDayEntries(24);

    render(
      <BulkActions
        dayEntries={dayEntries}
        onBulkUpdate={mockOnBulkUpdate}
        onSaveAll={mockOnSaveAll}
        calendarId={calendarId}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear all photos/i });
    fireEvent.click(clearButton);

    expect(mockOnBulkUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        1: { photo: null, photoUrl: '' },
        2: { photo: null, photoUrl: '' },
        3: { photo: null, photoUrl: '' }
      })
    );
  });

  it('resets all messages when reset button is clicked', () => {
    const dayEntries = createMockDayEntries(24);

    render(
      <BulkActions
        dayEntries={dayEntries}
        onBulkUpdate={mockOnBulkUpdate}
        onSaveAll={mockOnSaveAll}
        calendarId={calendarId}
      />
    );

    const resetButton = screen.getByRole('button', { name: /reset all messages/i });
    fireEvent.click(resetButton);

    expect(mockOnBulkUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        1: { message: '', isValid: false },
        2: { message: '', isValid: false },
        3: { message: '', isValid: false }
      })
    );
  });

  it('calls onSaveAll when save button is clicked', async () => {
    const dayEntries = createMockDayEntries(24).map(entry => ({
      ...entry,
      isSaved: false,
      message: 'Unsaved message'
    }));

    mockOnSaveAll.mockResolvedValue(undefined);

    render(
      <BulkActions
        dayEntries={dayEntries}
        onBulkUpdate={mockOnBulkUpdate}
        onSaveAll={mockOnSaveAll}
        calendarId={calendarId}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save all changes/i });
    fireEvent.click(saveButton);

    expect(screen.getByText('Saving...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockOnSaveAll).toHaveBeenCalled();
    });

    expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
  });

  it('shows loading state during save operation', async () => {
    const dayEntries = createMockDayEntries(24).map(entry => ({
      ...entry,
      isSaved: false,
      message: 'Unsaved message'
    }));

    mockOnSaveAll.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <BulkActions
        dayEntries={dayEntries}
        onBulkUpdate={mockOnBulkUpdate}
        onSaveAll={mockOnSaveAll}
        calendarId={calendarId}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save all changes/i });
    fireEvent.click(saveButton);

    expect(screen.getByText('Saving...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
    });
  });

  it('enables buttons based on state', () => {
    const dayEntries = createMockDayEntries(24);

    render(
      <BulkActions
        dayEntries={dayEntries}
        onBulkUpdate={mockOnBulkUpdate}
        onSaveAll={mockOnSaveAll}
        calendarId={calendarId}
      />
    );

    const generateButton = screen.getByRole('button', { name: /generate all messages/i });
    const clearButton = screen.getByRole('button', { name: /clear all photos/i });
    const resetButton = screen.getByRole('button', { name: /reset all messages/i });

    // Initially all buttons should be enabled (except save which depends on unsaved changes)
    expect(generateButton).toBeEnabled();
    expect(clearButton).toBeEnabled();
    expect(resetButton).toBeEnabled();

    // Mock unsaved changes for save button
    const dayEntriesWithChanges = dayEntries.map(entry => ({
      ...entry,
      isSaved: false,
      message: 'Changed message'
    }));

    render(
      <BulkActions
        dayEntries={dayEntriesWithChanges}
        onBulkUpdate={mockOnBulkUpdate}
        onSaveAll={mockOnSaveAll}
        calendarId={calendarId}
      />
    );

    const saveButtonWithChanges = screen.getByRole('button', { name: /save all changes/i });
    expect(saveButtonWithChanges).toBeEnabled();
  });

  it('handles mixed state correctly', () => {
    // Create entries with mixed states: some with photos, some with messages, some saved, some not
    const mixedEntries: DayEntry[] = [
      {
        dayNumber: 1,
        title: 'Day 1',
        photo: null,
        photoUrl: 'https://example.com/photo1.jpg',
        message: 'Message 1',
        isValid: true,
        isSaved: true
      },
      {
        dayNumber: 2,
        title: 'Day 2',
        photo: null,
        photoUrl: '',
        message: 'Message 2',
        isValid: true,
        isSaved: false
      },
      {
        dayNumber: 3,
        title: 'Day 3',
        photo: null,
        photoUrl: 'https://example.com/photo3.jpg',
        message: '',
        isValid: false,
        isSaved: true
      }
    ];

    render(
      <BulkActions
        dayEntries={mixedEntries}
        onBulkUpdate={mockOnBulkUpdate}
        onSaveAll={mockOnSaveAll}
        calendarId={calendarId}
      />
    );

    // Clear photos should be enabled (entry 1 and 3 have photos)
    const clearButton = screen.getByRole('button', { name: /clear all photos/i });
    expect(clearButton).toBeEnabled();

    // Reset messages should be enabled (entry 1 and 2 have messages)
    const resetButton = screen.getByRole('button', { name: /reset all messages/i });
    expect(resetButton).toBeEnabled();

    // Save should be enabled (entry 2 is not saved)
    const saveButton = screen.getByRole('button', { name: /save all changes/i });
    expect(saveButton).toBeEnabled();
  });

  it('clears error message when retrying operation', async () => {
    const dayEntries = createMockDayEntries(24);

    // First call fails
    mockHttpClient.post.mockRejectedValueOnce({
      response: { data: { message: 'First attempt failed' } }
    });

    // Second call succeeds
    mockHttpClient.post.mockResolvedValueOnce({
      data: { messages: [] }
    });

    render(
      <BulkActions
        dayEntries={dayEntries}
        onBulkUpdate={mockOnBulkUpdate}
        onSaveAll={mockOnSaveAll}
        calendarId={calendarId}
      />
    );

    const generateButton = screen.getByRole('button', { name: /generate all messages/i });

    // First attempt - should show error
    fireEvent.click(generateButton);
    await waitFor(() => {
      expect(screen.getByText('First attempt failed')).toBeInTheDocument();
    });

    // Second attempt - error should be cleared
    fireEvent.click(generateButton);
    await waitFor(() => {
      expect(screen.queryByText('First attempt failed')).not.toBeInTheDocument();
    });
  });
});