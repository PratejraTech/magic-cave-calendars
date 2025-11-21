import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HouseCard } from '../features/advent/components/HouseCard';
import { createAdventDay } from './testUtils';

const mockDuckMusic = vi.fn();
const mockPlay = vi.fn();
const mockInit = vi.fn();
const mockConfettiBurst = vi.fn();
const mockTimeline = {
  to: vi.fn().mockReturnThis(),
  call: vi.fn().mockImplementation((callback: () => void) => {
    callback();
    return mockTimeline;
  }),
};

vi.mock('../features/advent/utils/SoundManager', () => ({
  SoundManager: {
    getInstance: () => ({
      init: mockInit,
      duckMusic: mockDuckMusic,
      play: mockPlay,
    }),
  },
}));

vi.mock('../features/advent/utils/ConfettiSystem', () => ({
  ConfettiSystem: {
    burst: mockConfettiBurst,
  },
}));

vi.mock('gsap', () => ({
  gsap: {
    timeline: () => mockTimeline,
  },
}));

const defaultProps = () => ({
  day: createAdventDay(),
  onOpen: vi.fn(),
  canOpen: true,
});

describe('HouseCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the closed day state', () => {
    render(<HouseCard {...defaultProps()} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(mockInit).toHaveBeenCalled();
  });

  it('prevents opening when locked', () => {
    const props = { ...defaultProps(), canOpen: false };
    render(<HouseCard {...props} />);

    fireEvent.click(screen.getByTestId('day-1'));

    expect(props.onOpen).not.toHaveBeenCalled();
    expect(mockDuckMusic).not.toHaveBeenCalled();
  });

  it('opens the door and triggers effects', async () => {
    const props = defaultProps();
    render(<HouseCard {...props} />);

    fireEvent.click(screen.getByTestId('day-1'));

    await waitFor(() => {
      expect(props.onOpen).toHaveBeenCalledWith(1);
    });
    expect(mockDuckMusic).toHaveBeenCalledWith(2000);
    expect(mockPlay).toHaveBeenCalledWith('door-creak');
    expect(mockConfettiBurst).toHaveBeenCalled();
  });
});
