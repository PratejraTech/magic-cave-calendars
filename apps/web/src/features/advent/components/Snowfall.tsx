import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AnimationPerformanceMonitor } from '../animations/AnimationPerformanceMonitor';

interface Snowflake {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  duration: number;
  layer: number; // 0 = background, 1 = mid, 2 = foreground
  color: string;
  shape: 'circle' | 'star' | 'diamond';
  wind: number; // Horizontal drift factor
}

interface SnowfallProps {
  themeId?: string;
  intensity?: 'light' | 'medium' | 'heavy';
  className?: string;
}

export function Snowfall({
  themeId = 'snow',
  intensity = 'medium',
  className = ''
}: SnowfallProps) {
  const performanceMonitor = AnimationPerformanceMonitor.getInstance();
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  // Particle count based on intensity and performance
  const particleCount = useMemo(() => {
    const baseCounts = { light: 30, medium: 60, heavy: 100 };
    const baseCount = baseCounts[intensity];

    // Reduce count if performance is poor
    const metrics = performanceMonitor.getMetrics();
    if (metrics.fps < 50) return Math.floor(baseCount * 0.6);
    if (metrics.fps < 30) return Math.floor(baseCount * 0.3);

    return baseCount;
  }, [intensity, performanceMonitor]);

  // Theme-aware particle configurations
  const particleConfig = useMemo(() => {
    const configs = {
      snow: {
        shapes: ['circle', 'star', 'diamond'] as const,
        colors: ['#FFFFFF', '#E0F6FF', '#B8D4E3'],
        windStrength: 0.5,
      },
      warm: {
        shapes: ['circle', 'star'] as const,
        colors: ['#FEF3C7', '#FCD34D', '#F59E0B'],
        windStrength: 0.3,
      },
      candy: {
        shapes: ['circle', 'star', 'diamond'] as const,
        colors: ['#F472B6', '#FB7185', '#FDA4AF'],
        windStrength: 0.4,
      },
      forest: {
        shapes: ['circle', 'diamond'] as const,
        colors: ['#10B981', '#34D399', '#6EE7B7'],
        windStrength: 0.6,
      },
      starlight: {
        shapes: ['star', 'diamond'] as const,
        colors: ['#A78BFA', '#C4B5FD', '#DDD6FE'],
        windStrength: 0.2,
      },
    };

    return configs[themeId as keyof typeof configs] || configs.snow;
  }, [themeId]);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const createSnowflakes = () => {
      const flakes: Snowflake[] = [];

      for (let i = 0; i < particleCount; i++) {
        // Distribute particles across layers for depth
        const layer = i % 3; // 0, 1, 2
        const layerMultiplier = [0.3, 0.6, 1][layer]; // Background particles are smaller/slower

        flakes.push({
          id: i,
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          size: (Math.random() * 6 + 2) * layerMultiplier,
          speed: (Math.random() * 3 + 0.5) * layerMultiplier,
          opacity: (Math.random() * 0.6 + 0.2) * layerMultiplier,
          duration: Math.random() * 8 + 6,
          layer,
          color: particleConfig.colors[Math.floor(Math.random() * particleConfig.colors.length)],
          shape: particleConfig.shapes[Math.floor(Math.random() * particleConfig.shapes.length)],
          wind: (Math.random() - 0.5) * particleConfig.windStrength,
        });
      }

      setSnowflakes(flakes);
    };

    createSnowflakes();
  }, [particleCount, dimensions, particleConfig]);

  useEffect(() => {
    if (!performanceMonitor.shouldRunAnimation({ id: 'snowfall', priority: 'medium', lazyLoad: false, maxFrameTime: 16.67 })) {
      return;
    }

    const animate = () => {
      setSnowflakes(prev =>
        prev.map(flake => {
          let newY = flake.y + flake.speed;
          let newX = flake.x + Math.sin(flake.y * 0.005) * flake.wind;

          // Reset particle when it goes off screen
          if (newY > dimensions.height + 50) {
            newY = -20;
            newX = Math.random() * dimensions.width;
          }

          // Wrap around horizontally
          if (newX < -20) newX = dimensions.width + 20;
          if (newX > dimensions.width + 20) newX = -20;

          return {
            ...flake,
            y: newY,
            x: newX,
          };
        })
      );
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, [dimensions, performanceMonitor]);

  const getShapeStyles = (shape: string, size: number, color: string) => {
    const baseStyles = {
      position: 'absolute' as const,
      width: size,
      height: size,
    };

    switch (shape) {
      case 'star':
        return {
          ...baseStyles,
          backgroundColor: color,
          clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        };
      case 'diamond':
        return {
          ...baseStyles,
          backgroundColor: color,
          transform: 'rotate(45deg)',
        };
      default: // circle
        return {
          ...baseStyles,
          backgroundColor: color,
          borderRadius: '50%',
          boxShadow: `0 0 ${size * 0.8}px ${color}60`,
        };
    }
  };

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          style={{
            left: flake.x,
            top: flake.y,
            opacity: flake.opacity,
            zIndex: flake.layer,
            ...getShapeStyles(flake.shape, flake.size, flake.color),
          }}
          animate={{
            y: dimensions.height + 50,
            rotate: flake.shape === 'circle' ? 360 : 180,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: flake.duration,
            repeat: Infinity,
            ease: 'linear',
            scale: {
              duration: flake.duration * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        />
      ))}
    </div>
  );
}
