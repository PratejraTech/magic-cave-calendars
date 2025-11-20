import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { VillageScene } from '../features/advent/components/VillageScene'

const mockDays = [
  { id: 1, day: 1, is_opened: false, opened_at: null, message: 'Test message', photo_url: 'test.jpg', created_at: '2023-12-01T00:00:00Z' },
  { id: 2, day: 2, is_opened: true, opened_at: '2023-12-02T00:00:00Z', message: 'Test message 2', photo_url: 'test2.jpg', created_at: '2023-12-02T00:00:00Z' },
]

describe('VillageScene', () => {
  it('renders all house cards', () => {
    const mockOnOpen = vi.fn()
    render(<VillageScene days={mockDays} onOpenDay={mockOnOpen} isDecember={true} />)

    expect(screen.getByText('Magical Christmas Village')).toBeInTheDocument()
    expect(screen.getAllByTestId(/^day-/)).toHaveLength(2)
  })

  it('calls onOpenDay when day is clicked', () => {
    const mockOnOpen = vi.fn()
    render(<VillageScene days={mockDays} onOpenDay={mockOnOpen} isDecember={true} />)

    const day1 = screen.getByTestId('day-1')
    fireEvent.click(day1)

    expect(mockOnOpen).toHaveBeenCalledWith(1)
  })
})