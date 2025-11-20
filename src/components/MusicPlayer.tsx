import { useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { SoundManager } from '../features/advent/utils/SoundManager';

const THEME_TRACK_FILENAME = 'Ben Bohmer, Nils Hoffmann & Malou - Breathing.mp3';
export const THEME_TRACK_PATH = `/music/${encodeURIComponent(THEME_TRACK_FILENAME)}`;
const RANDOM_START_WINDOW_SECONDS = 120;

const startThemeFromRandomPoint = async (manager: SoundManager) => {
  const randomStart = Math.floor(Math.random() * RANDOM_START_WINDOW_SECONDS);
  await manager.playMusic(THEME_TRACK_PATH, randomStart);
};

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundManager = SoundManager.getInstance();

  useEffect(() => {
    soundManager.init();
  }, [soundManager]);

  const handleToggle = async () => {
    if (isPlaying) {
      soundManager.stopMusic();
      setIsPlaying(false);
      return;
    }

    try {
      await startThemeFromRandomPoint(soundManager);
      setIsPlaying(true);
    } catch (error) {
      setIsPlaying(false);
    }
  };

  return (
    <div data-testid="music-player" className="flex justify-center">
      <button
        onClick={handleToggle}
        className="p-4 rounded-full transition-all duration-300 transform hover:scale-125 bg-gradient-to-br from-golden to-peppermint shadow-lg hover:shadow-xl"
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 text-white" />
        ) : (
          <Play className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
