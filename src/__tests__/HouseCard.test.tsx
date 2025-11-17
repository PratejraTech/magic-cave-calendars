import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { HouseCard } from '../features/advent/components/HouseCard'

const mockDay = { id: 1, day: 1, is_opened: false, opened_at: null, message: 'Test', photo_url: 'test.jpg', created_at: '2023-12-01T00:00:00Z' }

describe('HouseCard', () => {
  it('renders closed day', () => {
    const mockOnOpen = vi.fn()
    render(<HouseCard day={mockDay} onOpen={mockOnOpen} isDecember={true} />)

    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('calls onOpen when clicked', () => {
    const mockOnOpen = vi.fn()
    render(<HouseCard day={mockDay} onOpen={mockOnOpen} isDecember={true} />)

    const card = screen.getByTestId('day-1')
    fireEvent.click(card)

    expect(mockOnOpen).toHaveBeenCalledWith(1)
  })

  it('shows opened state', () => {
    const openedDay = { ...mockDay, is_opened: true, opened_at: '2023-12-01T00:00:00Z' }
    const mockOnOpen = vi.fn()
    render(<HouseCard day={openedDay} onOpen={mockOnOpen} canOpen={true} position={{ x: 0, y: 0 }} />)

    // Check for opened styling or content
    const card = screen.getByTestId('day-1')
    expect(card).toHaveClass('scale-105') // Assuming opened style
  })
})