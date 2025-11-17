import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      const duration = audio.duration;
      const randomStart = Math.random() * Math.max(0, duration - 10);
      audio.currentTime = randomStart;
      audio.play().catch((err) => console.log('Autoplay prevented:', err));
    };

    audio.addEventListener('canplaythrough', handleCanPlay);

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <audio ref={audioRef} loop>
        <source src="/music.mp3" type="audio/mpeg" />
      </audio>

      {isLoaded && (
        <button
          onClick={toggleMute}
          className="clay-button p-4 rounded-full transition-all duration-300 transform hover:scale-125"
          style={{
            background: 'linear-gradient(145deg, #1e3a8a, #0f4c75)',
            boxShadow: '8px 8px 16px #1a1a2e, -8px -8px 16px #0f4c75, inset 2px 2px 4px rgba(100, 200, 255, 0.4)',
          }}
          aria-label={isMuted ? 'Unmute music' : 'Mute music'}
        >
          {isMuted ? (
            <VolumeX className="w-6 h-6 text-cyan-300" />
          ) : (
            <Volume2 className="w-6 h-6 text-orange-300" />
          )}
        </button>
      )}
    </div>
  );
}
