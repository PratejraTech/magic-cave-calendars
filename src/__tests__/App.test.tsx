import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import App from '../App';
import { adventMemories } from '../data/adventMemories';

vi.mock('../features/advent/utils/SoundManager', () => ({
  SoundManager: {
    getInstance: () => ({
      init: vi.fn(),
      loadSound: vi.fn(),
      duckMusic: vi.fn(),
      play: vi.fn(),
    }),
  },
}));

vi.mock('../features/advent/utils/ConfettiSystem', () => ({
  ConfettiSystem: {
    burst: vi.fn(),
    snowstorm: vi.fn(),
  },
}));

vi.mock('gsap', () => ({
  gsap: {
    timeline: () => {
      const timeline = {
        to: () => timeline,
        call: (cb?: () => void) => {
          cb?.();
          return timeline;
        },
      };
      return timeline;
    },
  },
}));

const OPENED_STORAGE_KEY = 'advent-opened-days';

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-12-05T09:00:00Z'));
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads and displays local advent memories', async () => {
    render(<App />);

    expect(screen.getByText('Loading magic...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('village-scene')).toBeInTheDocument();
    });

    expect(screen.getByText(/Harper's Xmas Village/i)).toBeInTheDocument();
    expect(screen.getByTestId('music-player')).toBeInTheDocument();
    expect(screen.queryByText('Loading magic...')).not.toBeInTheDocument();
  });

  it('stores opened progress in localStorage', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('village-scene')).toBeInTheDocument();
    });

    const dayButton = screen.getByTestId('day-1');
    fireEvent.click(dayButton);

    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(OPENED_STORAGE_KEY) ?? '{}');
      expect(stored['1']).toBeTruthy();
    });

    await waitFor(() => {
      expect(screen.getByText(adventMemories[0].title)).toBeInTheDocument();
    });
    expect(screen.getByText(/Download Photo/i)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
  });

  it('shows past memories in the carousel and rotates them', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('village-scene')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('day-1'));
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.click(screen.getByTestId('day-2'));
    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.getByTestId('past-memory-carousel')).toBeInTheDocument();
    });

    expect(screen.getByText(adventMemories[0].message)).toBeInTheDocument();

    vi.advanceTimersByTime(8000);

    await waitFor(() => {
      expect(screen.getByText(adventMemories[1].message)).toBeInTheDocument();
    });
  });

  it('closes the modal with Escape until another day opens it', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('village-scene')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('day-1'));

    await waitFor(() => {
      expect(screen.getByText(adventMemories[0].title)).toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText(adventMemories[0].title)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('day-2'));

    await waitFor(() => {
      expect(screen.getByText(adventMemories[1].title)).toBeInTheDocument();
    });
  });

  it('opens the surprise video portal when the button is pressed', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('village-scene')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Surprise!'));

    await waitFor(() => {
      expect(screen.getByTestId('surprise-portal')).toBeInTheDocument();
    });
  });
});
