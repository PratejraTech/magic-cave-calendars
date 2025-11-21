import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { gsap } from 'gsap';
import { CalendarDay } from '../../../lib/api';
import { ConfettiSystem } from '../utils/ConfettiSystem';
import { SoundManager } from '../utils/SoundManager';
import { useCurrentTheme } from '../../../themes/ThemeProvider';
import { ThemeAnimationSystem } from '../animations/ThemeAnimationSystem';
import { AnimationPerformanceMonitor } from '../animations/AnimationPerformanceMonitor';

interface HouseCardProps {
  day: CalendarDay;
  onOpen: (dayId: string) => void;
  canOpen: boolean;
}

export function HouseCard({ day, onOpen, canOpen }: HouseCardProps) {
  const [isOpened, setIsOpened] = useState(day.is_opened);
  const doorRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const soundManager = SoundManager.getInstance();
  const currentTheme = useCurrentTheme();
  const animationSystem = ThemeAnimationSystem.getInstance();
  const performanceMonitor = AnimationPerformanceMonitor.getInstance();

  useEffect(() => {
    soundManager.init();
  }, [soundManager]);

  const handleClick = async () => {
    if (!canOpen || isOpened) return;

    const themeId = currentTheme?.id || 'snow';

    // Check if animations should run
    if (performanceMonitor.shouldReduceMotion()) {
      // Simple animation for reduced motion
      setIsOpened(true);
      onOpen(day.day_id);
      return;
    }

    soundManager.duckMusic(2000);

    // Get theme-specific unlock animation sequence
    const unlockSequence = animationSystem.getUnlockAnimation(themeId);

    // Play theme-appropriate sound
    const unlockSound = currentTheme?.sounds.unlock || 'door-creak';
    soundManager.play(unlockSound);

    // Execute unlock animation sequence
    const tl = gsap.timeline();

    unlockSequence.forEach((animation, index) => {
      tl.to(doorRef.current, {
        scale: index === 0 ? 1.2 : index === 1 ? 1.1 : 1.5,
        rotation: index === 0 ? 3 : index === 1 ? -2 : 0,
        duration: animation.duration,
        ease: animation.ease,
        delay: animation.delay || 0,
      });
    });

    // Final reveal and effects
    tl.call(() => {
      soundManager.play('magical-ding');

      // Theme-specific confetti effect
      const confettiType = currentTheme?.animations.confetti || day.confetti_type || 'snow';
      ConfettiSystem.burst({
        type: confettiType,
        count: 80,
        origin: { x: 0.5, y: 0.3 }
      });

      // Additional theme-specific effects
      if ((confettiType as string) === 'hearts') {
        setTimeout(() => ConfettiSystem.heartBurst({ x: 0.5, y: 0.3 }, 0.3), 200);
      } else if ((confettiType as string) === 'stars') {
        setTimeout(() => ConfettiSystem.sparkle({ x: 0.5, y: 0.3 }, 1000), 300);
      }

      soundManager.play('confetti-burst');
      setIsOpened(true);
      onOpen(day.day_id);
    });

    // Framer Motion door opening animation
    await controls.start({
      rotateY: 180,
      transition: { duration: 0.8, ease: "easeInOut" }
    });
  };

  return (
    <motion.div
      ref={doorRef}
      className="w-full cursor-pointer flex justify-center"
      style={{ transformStyle: 'preserve-3d' }}
      animate={controls}
      whileHover={{ scale: canOpen ? 1.1 : 1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      data-testid={`day-${day.day_number}`}
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
              {day.day_number}
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
            src={day.photo_asset_id ? `https://picsum.photos/400/300?random=${day.day_number}` : `https://picsum.photos/400/300?random=${day.day_number}`}
            alt={`Day ${day.day_number}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
            <p className="text-xs text-white text-center font-semibold">
              {day.title || `Day ${day.day_number}`}
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 to-transparent animate-pulse"></div>
        </motion.div>
      )}
    </motion.div>
  );
}
