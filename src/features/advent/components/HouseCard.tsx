import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { gsap } from 'gsap';
import { AdventDay } from '../../../lib/supabase';
import { ConfettiSystem } from '../utils/ConfettiSystem';
import { SoundManager } from '../utils/SoundManager';

interface HouseCardProps {
  day: AdventDay;
  onOpen: (dayId: number) => void;
  canOpen: boolean;
  position: { x: number; y: number };
}

export function HouseCard({ day, onOpen, canOpen, position }: HouseCardProps) {
  const [isOpened, setIsOpened] = useState(day.is_opened);
  const doorRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const soundManager = SoundManager.getInstance();

  useEffect(() => {
    soundManager.init();
  }, []);

  const handleClick = async () => {
    if (!canOpen || isOpened) return;

    soundManager.duckMusic(2000);
    soundManager.play('door-creak');

    // GSAP explosive sequence
    const tl = gsap.timeline();
    tl.to(doorRef.current, {
      scale: 1.5,
      rotation: 5,
      duration: 0.3,
      ease: "back.out(1.7)",
      yoyo: true,
      repeat: 3
    })
    .to(doorRef.current, {
      scale: 2,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)"
    }, "-=0.2")
    .call(() => {
      soundManager.play('magical-ding');
      ConfettiSystem.burst({
        type: day.confettiType || 'snow',
        count: 100,
        origin: { x: 0.5, y: 0.3 }
      });
      soundManager.play('confetti-burst');
      setIsOpened(true);
      onOpen(day.id);
    });

    // Framer Motion for smooth reveal
    await controls.start({
      rotateY: 180,
      transition: { duration: 0.8, ease: "easeInOut" }
    });
  };

  return (
    <motion.div
      ref={doorRef}
      className="absolute cursor-pointer"
      style={{
        left: position.x,
        top: position.y,
        transformStyle: 'preserve-3d'
      }}
      animate={controls}
      whileHover={{ scale: canOpen ? 1.1 : 1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      data-testid={`day-${day.id}`}
    >
      {!isOpened ? (
        <div
          className={`house-door w-24 h-24 rounded-lg shadow-lg border-4 border-white relative overflow-hidden ${
            !canOpen ? 'opacity-50 grayscale' : ''
          }`}
          style={{
            background: 'linear-gradient(145deg, #FF69B4, #FFD700)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg"></div>
          <div className="absolute inset-2 flex items-center justify-center">
            <span className="text-2xl font-bold text-white drop-shadow-lg">
              {day.id}
            </span>
          </div>
          {canOpen && !day.is_opened && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce">
              <span className="text-xs">✨</span>
            </div>
          )}
        </div>
      ) : (
        <motion.div
          className="house-opened w-32 h-32 rounded-lg shadow-xl overflow-hidden relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{
            background: 'linear-gradient(145deg, #FFD700, #FF69B4)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.4), inset 0 4px 8px rgba(255,255,255,0.4)'
          }}
        >
          <img
            src={day.photo_url}
            alt={`Day ${day.id}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
            <p className="text-xs text-white text-center font-semibold">
              {day.title || `Day ${day.id}`}
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 to-transparent animate-pulse"></div>
        </motion.div>
      )}
    </motion.div>
  );
}
