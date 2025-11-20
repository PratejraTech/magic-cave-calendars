import { useCallback, useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { SoundManager } from '../features/advent/utils/SoundManager';

export const THEME_TRACK_PATH = encodeURI('/music/Ben Bohmer, Nils Hoffmann & Malou - Breathing.mp3');
const RANDOM_START_WINDOW_SECONDS = 120;

export const playThemeAtRandomPoint = (manager: SoundManager) => {
  const randomStart = Math.floor(Math.random() * RANDOM_START_WINDOW_SECONDS);
  manager.playMusic(THEME_TRACK_PATH, randomStart);
};

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(true);
  const soundManager = SoundManager.getInstance();

  const startAtRandomPoint = useCallback(() => {
    playThemeAtRandomPoint(soundManager);
  }, [soundManager]);

  useEffect(() => {
    const initMusic = async () => {
      await soundManager.init();
      startAtRandomPoint();
    };
    initMusic();
  }, [soundManager, startAtRandomPoint]);

  const togglePlay = () => {
    if (isPlaying) {
      soundManager.stopMusic();
      setIsPlaying(false);
    } else {
      startAtRandomPoint();
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" data-testid="music-player">
      <button
        onClick={togglePlay}
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
