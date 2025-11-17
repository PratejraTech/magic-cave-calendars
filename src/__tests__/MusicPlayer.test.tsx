import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MusicPlayer } from '../components/MusicPlayer'

// Mock audio
const mockPlay = vi.fn()
const mockPause = vi.fn()
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: mockPlay,
})
Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: mockPause,
})

describe('MusicPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders play button initially', () => {
    render(<MusicPlayer />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('toggles play/pause on click', () => {
    render(<MusicPlayer />)
    const button = screen.getByRole('button')

    // Initial state: play
    fireEvent.click(button)
    expect(mockPlay).toHaveBeenCalled()

    // After click: pause
    fireEvent.click(button)
    expect(mockPause).toHaveBeenCalled()
  })
})