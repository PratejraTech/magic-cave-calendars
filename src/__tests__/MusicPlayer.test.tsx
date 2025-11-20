import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MusicPlayer } from '../components/MusicPlayer';

const mockInit = vi.fn();
const mockPlayMusic = vi.fn();
const mockStopMusic = vi.fn();

vi.mock('../features/advent/utils/SoundManager', () => ({
  SoundManager: {
    getInstance: () => ({
      init: mockInit,
      playMusic: mockPlayMusic,
      stopMusic: mockStopMusic,
    }),
  },
}));

describe('MusicPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the play button by default', () => {
    render(<MusicPlayer />);

    const button = screen.getByRole('button', { name: /play music/i });
    expect(button).toBeInTheDocument();
    expect(mockInit).toHaveBeenCalled();
  });

  it('toggles playback via the SoundManager', async () => {
    const user = userEvent.setup();
    render(<MusicPlayer />);
    const button = screen.getByRole('button');

    await user.click(button);
    expect(mockPlayMusic).toHaveBeenCalledWith('/assets/christmas/audio/music/calm-carols.mp3');
    expect(button).toHaveAttribute('aria-label', 'Pause music');

    await user.click(button);
    expect(mockStopMusic).toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-label', 'Play music');
  });
});
