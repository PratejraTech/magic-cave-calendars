import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeAnimationSystem } from '../animations/ThemeAnimationSystem';
import { AnimationPerformanceMonitor } from '../animations/AnimationPerformanceMonitor';
import { Snowfall } from './Snowfall';

interface ThemeBackgroundProps {
  themeId: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Floating particle component for theme backgrounds
 */
const FloatingParticles: React.FC<{
  particles: Array<{
    type: string;
    count: number;
    colors: string[];
    size: { min: number; max: number };
    speed: { min: number; max: number };
  }>;
  themeId: string;
}> = ({ particles, themeId }) => {
  const particleElements = useMemo(() => {
    return particles.flatMap((particleConfig, configIndex) => {
      return Array.from({ length: particleConfig.count }, (_, index) => {
        const id = `${themeId}-${configIndex}-${index}`;
        const size = particleConfig.size.min +
          Math.random() * (particleConfig.size.max - particleConfig.size.min);
        const speed = particleConfig.speed.min +
          Math.random() * (particleConfig.speed.max - particleConfig.speed.min);
        const color = particleConfig.colors[Math.floor(Math.random() * particleConfig.colors.length)];
        const delay = Math.random() * 2;
        const duration = 3 + Math.random() * 4;

        return {
          id,
          size,
          speed,
          color,
          delay,
          duration,
          x: Math.random() * 100,
          y: Math.random() * 100,
        };
      });
    });
  }, [particles, themeId]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {particleElements.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full opacity-60"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}40`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [0.5, 1, 0.5],
              y: [0, -20, 0],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * Aurora effect for magical backgrounds
 */
const AuroraEffect: React.FC<{
  colors: string[];
  animation: { duration: number; ease: string; repeat?: number };
}> = ({ colors, animation }) => {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      animate={{
        opacity: [0.4, 0.8, 0.4],
        filter: [
          'blur(40px) hue-rotate(0deg)',
          'blur(40px) hue-rotate(45deg)',
          'blur(40px) hue-rotate(0deg)',
        ],
      }}
      transition={{
        duration: animation.duration,
        repeat: animation.repeat,
        ease: animation.ease,
      }}
      style={{
        background: `radial-gradient(circle at 30% 20%, ${colors[0]}, transparent 45%),
                     radial-gradient(circle at 70% 30%, ${colors[1]}, transparent 55%),
                     radial-gradient(circle at 60% 80%, ${colors[2] || colors[0]}, transparent 60%)`,
      }}
    />
  );
};

/**
 * Horizon glow effect
 */
const HorizonGlow: React.FC<{
  colors: string[];
  animation: { duration: number; ease: string; repeat?: number };
}> = ({ colors, animation }) => {
  return (
    <motion.div
      className="absolute bottom-0 left-0 w-full h-1/3 pointer-events-none"
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{
        duration: animation.duration,
        repeat: animation.repeat,
        ease: animation.ease,
      }}
      style={{
        background: `linear-gradient(180deg, rgba(255,255,255,0), ${colors[0]} 55%, ${colors[1]})`,
      }}
    />
  );
};

/**
 * Shooting stars effect
 */
const ShootingStars: React.FC<{
  colors: string[];
  animation: { duration: number; ease: string; repeat?: number; delay?: number };
}> = ({ colors, animation }) => {
  const stars = useMemo(() => {
    return Array.from({ length: 3 }, (_, index) => ({
      id: index,
      delay: index * 3 + (animation.delay || 0),
    }));
  }, [animation.delay]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute w-24 h-1 rounded-full shadow-lg"
          style={{
            top: `${10 + star.id * 12}%`,
            left: '-20%',
            background: `linear-gradient(90deg, ${colors[0]}, ${colors[1] || colors[0]}, transparent)`,
            boxShadow: `0 0 12px ${colors[0]}80`,
          }}
          animate={{ x: ['-20%', '120%'], opacity: [0, 1, 0] }}
          transition={{
            duration: animation.duration,
            delay: star.delay,
            repeat: animation.repeat,
            ease: animation.ease,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Unified Theme Background Component
 * Renders theme-specific animated backgrounds with performance monitoring
 */
export const ThemeBackground: React.FC<ThemeBackgroundProps> = ({
  themeId,
  className = '',
  children,
}) => {
  const animationSystem = ThemeAnimationSystem.getInstance();
  const performanceMonitor = AnimationPerformanceMonitor.getInstance();

  const backgroundEffect = useMemo(() => {
    return animationSystem.getBackgroundEffect(themeId);
  }, [themeId, animationSystem]);

  // Register performance monitoring
  useEffect(() => {
    const animationId = `theme-background-${themeId}`;

    performanceMonitor.registerAnimation(animationId, () => {
      // Animation callback for performance monitoring
    }, {
      id: animationId,
      priority: 'medium',
      lazyLoad: false,
      maxFrameTime: 16.67, // 60fps
    });

    return () => {
      performanceMonitor.unregisterAnimation(animationId);
    };
  }, [themeId, performanceMonitor]);

  // Check if animations should run
  const shouldAnimate = !performanceMonitor.shouldReduceMotion();

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Base gradient background */}
      <motion.div
        className="absolute inset-0"
        animate={shouldAnimate ? {
          background: [
            backgroundEffect.gradient,
            // Subtle color shifts for each theme
            themeId === 'snow' ? 'bg-gradient-to-br from-blue-200 via-cyan-200 to-indigo-300' :
            themeId === 'warm' ? 'bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-200' :
            themeId === 'candy' ? 'bg-gradient-to-br from-pink-300 via-red-300 to-yellow-300' :
            themeId === 'forest' ? 'bg-gradient-to-br from-green-300 via-emerald-300 to-teal-400' :
            themeId === 'starlight' ? 'bg-gradient-to-br from-purple-200 via-pink-200 to-indigo-300' :
            backgroundEffect.gradient,
          ],
        } : {}}
        transition={{ duration: 12, repeat: shouldAnimate ? Infinity : 0, ease: 'easeInOut' }}
      />

      {/* Theme-specific effects */}
      <AnimatePresence>
        {backgroundEffect.overlays.map((overlay, index) => {
          switch (overlay.type) {
            case 'aurora':
              return (
                <AuroraEffect
                  key={`${themeId}-aurora-${index}`}
                  colors={overlay.colors}
                  animation={overlay.animation}
                />
              );
            case 'horizon':
              return (
                <HorizonGlow
                  key={`${themeId}-horizon-${index}`}
                  colors={overlay.colors}
                  animation={overlay.animation}
                />
              );
            case 'shooting-stars':
              return (
                <ShootingStars
                  key={`${themeId}-stars-${index}`}
                  colors={overlay.colors}
                  animation={overlay.animation}
                />
              );
            default:
              return null;
          }
        })}
      </AnimatePresence>

      {/* Floating particles */}
      {backgroundEffect.particles.length > 0 && (
        <FloatingParticles
          particles={backgroundEffect.particles}
          themeId={themeId}
        />
      )}

      {/* Theme-specific snowfall for winter theme */}
      {themeId === 'snow' && <Snowfall />}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ThemeBackground;