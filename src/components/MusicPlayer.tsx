import { useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { SoundManager } from '../features/advent/utils/SoundManager';

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundManager = SoundManager.getInstance();

  useEffect(() => {
    const initMusic = async () => {
      await soundManager.init();
    };
    initMusic();
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      soundManager.stopMusic();
    } else {
      soundManager.playMusic('/assets/christmas/audio/music/calm-carols.mp3');
    }
    setIsPlaying(!isPlaying);
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
