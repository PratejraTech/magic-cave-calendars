import { useCallback, useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { SoundManager } from '../features/advent/utils/SoundManager';

export const THEME_TRACK_PATH = encodeURI('/music/Ben Bohmer, Nils Hoffmann & Malou - Breathing.mp3');
const RANDOM_START_WINDOW_SECONDS = 120;

export const playThemeAtRandomPoint = (manager: SoundManager) => {
  const randomStart = Math.floor(Math.random() * RANDOM_START_WINDOW_SECONDS);
  return manager.playMusic(THEME_TRACK_PATH, randomStart);
};

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundManager = SoundManager.getInstance();

  const startAtRandomPoint = useCallback(async () => {
    await playThemeAtRandomPoint(soundManager);
  }, [soundManager]);

  useEffect(() => {
    let isMounted = true;
    const initMusic = async () => {
      await soundManager.init();
      try {
        await startAtRandomPoint();
        if (isMounted) setIsPlaying(true);
      } catch {
        if (isMounted) setIsPlaying(false);
      }
    };

    initMusic();

    const unlockAudio = () => {
      initMusic();
      window.removeEventListener('pointerdown', unlockAudio);
    };

    window.addEventListener('pointerdown', unlockAudio);

    return () => {
      isMounted = false;
      window.removeEventListener('pointerdown', unlockAudio);
    };
  }, [soundManager, startAtRandomPoint]);

  const togglePlay = () => {
    if (isPlaying) {
      soundManager.stopMusic();
      setIsPlaying(false);
      return;
    }

    startAtRandomPoint()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
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
