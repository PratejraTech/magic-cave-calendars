import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import { createAdventDay } from './testUtils';

const mockOrder = vi.fn();
const mockSelect = vi.fn();
const mockUpdateEq = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    });
    mockSelect.mockReturnValue({ order: mockOrder });
    mockUpdate.mockReturnValue({ eq: mockUpdateEq });
    mockOrder.mockResolvedValue({
      data: [
        createAdventDay({ id: 1 }),
        createAdventDay({ id: 2, is_opened: true, opened_at: '2023-12-02T00:00:00Z' }),
      ],
      error: null,
    });
    mockUpdateEq.mockResolvedValue({ error: null });
  });

  it('loads and displays advent days', async () => {
    render(<App />);

    expect(screen.getByText('Loading magic...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading magic...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('village-scene')).toBeInTheDocument();
    expect(screen.getByTestId('music-player')).toBeInTheDocument();
    expect(mockFrom).toHaveBeenCalledWith('advent_days');
    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockOrder).toHaveBeenCalledWith('id', { ascending: true });
  });

  it('handles opening a day', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading magic...')).not.toBeInTheDocument();
    });

    const dayButton = screen.getByTestId('day-1');
    dayButton.click();

    expect(mockFrom).toHaveBeenCalledWith('advent_days');
    expect(mockUpdate).toHaveBeenCalledWith({
      is_opened: true,
      opened_at: expect.any(String),
    });
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 1);
  });
});
