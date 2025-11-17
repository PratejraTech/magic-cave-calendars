import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import App from '../App'

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [
            { id: 1, day: 1, is_opened: false, opened_at: null },
            { id: 2, day: 2, is_opened: true, opened_at: '2023-12-02T00:00:00Z' },
          ],
          error: null,
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null,
        })),
      })),
    })),
  },
  AdventDay: {},
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads and displays advent days', async () => {
    render(<App />)

    // Check loading state
    expect(screen.getByText('Loading magic...')).toBeInTheDocument()

    // Wait for days to load
    await waitFor(() => {
      expect(screen.queryByText('Loading magic...')).not.toBeInTheDocument()
    })

    // Check that VillageScene and MusicPlayer are rendered
    expect(screen.getByTestId('village-scene')).toBeInTheDocument()
    expect(screen.getByTestId('music-player')).toBeInTheDocument()
  })

  it('handles opening a day', async () => {
    const mockSupabase = vi.mocked(require('../lib/supabase').supabase)
    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText('Loading magic...')).not.toBeInTheDocument()
    })

    // Simulate opening day 1
    const dayButton = screen.getByTestId('day-1')
    dayButton.click()

    // Check Supabase update was called
    expect(mockSupabase.from).toHaveBeenCalledWith('advent_days')
    expect(mockSupabase.from().update).toHaveBeenCalledWith({
      is_opened: true,
      opened_at: expect.any(String),
    })
    expect(mockSupabase.from().update().eq).toHaveBeenCalledWith('id', 1)
  })
})