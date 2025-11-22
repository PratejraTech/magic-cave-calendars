import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DayCard, DayEntry } from './DayCard';
import { SupabaseProvider } from '../../../../app/providers/SupabaseProvider';

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

vi.mock('../../../../app/providers/SupabaseProvider', () => ({
  useSupabase: () => mockSupabase
}));

// Mock FileReader
interface MockFileReader {
  readAsDataURL: ReturnType<typeof vi.fn>;
  onload: ((event: { target: { result: string } }) => void) | null;
  onerror: ((event: { target: { error: Error } }) => void) | null;
  result: string;
}

const mockFileReader: MockFileReader = {
  readAsDataURL: vi.fn(),
  onload: null,
  onerror: null,
  result: 'data:image/jpeg;base64,mockdata'
};

global.FileReader = vi.fn(() => mockFileReader) as unknown as typeof FileReader;

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <SupabaseProvider>
      {children}
    </SupabaseProvider>
  );
};

describe('DayCard', () => {
  const mockOnUpdate = vi.fn();
  const mockOnPhotoUpload = vi.fn();

  const defaultDayEntry: DayEntry = {
    dayNumber: 1,
    title: 'Day 1',
    photo: null,
    photoUrl: '',
    message: '',
    isValid: false,
    isSaved: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders day card with all required elements', () => {
    render(
      <DayCard
        dayEntry={defaultDayEntry}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Day 1')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByLabelText('Title (Optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Photo (Optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Message *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write a special message for day 1...')).toBeInTheDocument();
  });

  it('displays validation error when message is empty', () => {
    render(
      <DayCard
        dayEntry={defaultDayEntry}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Message is required')).toBeInTheDocument();
  });

  it('updates title when input changes', () => {
    render(
      <DayCard
        dayEntry={defaultDayEntry}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    const titleInput = screen.getByDisplayValue('Day 1');
    fireEvent.change(titleInput, { target: { value: 'Custom Title' } });

    expect(mockOnUpdate).toHaveBeenCalledWith({ title: 'Custom Title' });
  });

  it('updates message and validation when input changes', () => {
    render(
      <DayCard
        dayEntry={defaultDayEntry}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    const messageInput = screen.getByPlaceholderText('Write a special message for day 1...');
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    expect(mockOnUpdate).toHaveBeenCalledWith({
      message: 'Test message',
      isValid: true
    });
  });

  it('shows character count for message input', () => {
    render(
      <DayCard
        dayEntry={defaultDayEntry}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    const messageInput = screen.getByPlaceholderText('Write a special message for day 1...');
    fireEvent.change(messageInput, { target: { value: 'Test message with content' } });

    expect(screen.getByText('23/1000')).toBeInTheDocument();
  });

  it('validates photo file type correctly', async () => {
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    render(
      <DayCard
        dayEntry={defaultDayEntry}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    const fileInput = screen.getByLabelText('Photo (Optional)').nextElementSibling as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('Please select a valid image file')).toBeInTheDocument();
    });
  });

  it('validates photo file size correctly', async () => {
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

    render(
      <DayCard
        dayEntry={defaultDayEntry}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    const fileInput = screen.getByLabelText('Photo (Optional)').nextElementSibling as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText('Image file must be less than 5MB')).toBeInTheDocument();
    });
  });

  it('validates photo file extension correctly', async () => {
    const invalidFile = new File(['test'], 'test.bmp', { type: 'image/bmp' });

    render(
      <DayCard
        dayEntry={defaultDayEntry}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    const fileInput = screen.getByLabelText('Photo (Optional)').nextElementSibling as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText('Please use JPG, PNG, or WebP images')).toBeInTheDocument();
    });
  });

  it('uploads valid photo successfully', async () => {
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    mockSupabase.storage.from().upload.mockResolvedValue({ error: null });
    mockSupabase.storage.from().getPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://example.com/uploaded-photo.jpg' }
    });

    render(
      <DayCard
        dayEntry={defaultDayEntry}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    const fileInput = screen.getByLabelText('Photo (Optional)').nextElementSibling as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Trigger FileReader onload
    mockFileReader.onload?.({ target: { result: 'data:image/jpeg;base64,mockdata' } });

    await waitFor(() => {
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('photos');
      expect(mockOnUpdate).toHaveBeenCalledWith({
        photo: validFile,
        photoUrl: 'https://example.com/uploaded-photo.jpg'
      });
      expect(mockOnPhotoUpload).toHaveBeenCalledWith(1, 'https://example.com/uploaded-photo.jpg');
    });
  });

  it('handles photo upload error gracefully', async () => {
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    mockSupabase.storage.from().upload.mockRejectedValue(new Error('Upload failed'));

    render(
      <DayCard
        dayEntry={defaultDayEntry}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    const fileInput = screen.getByLabelText('Photo (Optional)').nextElementSibling as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    mockFileReader.onload?.({ target: { result: 'data:image/jpeg;base64,mockdata' } });

    await waitFor(() => {
      expect(screen.getByText('Failed to upload photo')).toBeInTheDocument();
    });
  });

  it('displays photo preview when photoUrl is provided', () => {
    const dayEntryWithPhoto: DayEntry = {
      ...defaultDayEntry,
      photoUrl: 'https://example.com/photo.jpg'
    };

    render(
      <DayCard
        dayEntry={dayEntryWithPhoto}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByAltText('Day 1 photo')).toHaveAttribute('src', 'https://example.com/photo.jpg');
    expect(screen.getByText('Photo uploaded')).toBeInTheDocument();
  });

  it('removes photo when remove button is clicked', () => {
    const dayEntryWithPhoto: DayEntry = {
      ...defaultDayEntry,
      photoUrl: 'https://example.com/photo.jpg'
    };

    render(
      <DayCard
        dayEntry={dayEntryWithPhoto}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      photo: null,
      photoUrl: ''
    });
  });

  it('shows drag over state when dragging files', () => {
    render(
      <DayCard
        dayEntry={defaultDayEntry}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    const dropZone = screen.getByText('Drop photo here').closest('div');

    fireEvent.dragOver(dropZone!);
    expect(dropZone).toHaveClass('border-pink-400');

    fireEvent.dragLeave(dropZone!);
    expect(dropZone).not.toHaveClass('border-pink-400');
  });

  it('handles file drop correctly', async () => {
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockDataTransfer = {
      files: [validFile]
    };

    mockSupabase.storage.from().upload.mockResolvedValue({ error: null });

    render(
      <DayCard
        dayEntry={defaultDayEntry}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    const dropZone = screen.getByText('Drop photo here').closest('div');

    fireEvent.drop(dropZone!, {
      dataTransfer: mockDataTransfer
    });

    mockFileReader.onload?.({ target: { result: 'data:image/jpeg;base64,mockdata' } });

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        photo: validFile,
        photoUrl: 'https://example.com/photo.jpg'
      });
    });
  });

  it('shows completion status indicators correctly', () => {
    // Test incomplete state (no message, no photo)
    render(
      <DayCard
        dayEntry={defaultDayEntry}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByRole('img', { name: /check/i })).not.toBeInTheDocument();

    // Test partial completion (message but no photo)
    const partialEntry: DayEntry = {
      ...defaultDayEntry,
      message: 'Test message',
      isValid: true
    };

    render(
      <DayCard
        dayEntry={partialEntry}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('img', { name: /alert/i })).toBeInTheDocument();

    // Test complete state (message and photo)
    const completeEntry: DayEntry = {
      ...defaultDayEntry,
      message: 'Test message',
      photoUrl: 'https://example.com/photo.jpg',
      isValid: true
    };

    render(
      <DayCard
        dayEntry={completeEntry}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('img', { name: /check/i })).toBeInTheDocument();
  });

  it('shows loading state during photo upload', async () => {
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    mockSupabase.storage.from().upload.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );

    render(
      <DayCard
        dayEntry={defaultDayEntry}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    const fileInput = screen.getByLabelText('Photo (Optional)').nextElementSibling as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    mockFileReader.onload?.({ target: { result: 'data:image/jpeg;base64,mockdata' } });

    expect(screen.getByText('Uploading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Uploading...')).not.toBeInTheDocument();
    });
  });

  it('enforces message length limit', () => {
    render(
      <DayCard
        dayEntry={defaultDayEntry}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    const messageInput = screen.getByPlaceholderText('Write a special message for day 1...');
    const longMessage = 'a'.repeat(1001);

    fireEvent.change(messageInput, { target: { value: longMessage } });

    expect(messageInput).toHaveValue('a'.repeat(1000)); // Should be truncated
  });

  it('enforces title length limit', () => {
    render(
      <DayCard
        dayEntry={defaultDayEntry}
        onUpdate={mockOnUpdate}
        onPhotoUpload={mockOnPhotoUpload}
      />,
      { wrapper: createWrapper() }
    );

    const titleInput = screen.getByDisplayValue('Day 1');
    const longTitle = 'a'.repeat(101);

    fireEvent.change(titleInput, { target: { value: longTitle } });

    expect(titleInput).toHaveValue('a'.repeat(100)); // Should be truncated
  });
});