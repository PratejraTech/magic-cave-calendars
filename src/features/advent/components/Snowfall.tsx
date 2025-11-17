import { useEffect, useState } from 'react';

interface Snowflake {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  duration: number;
}

export function Snowfall() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const createSnowflakes = () => {
      const flakes: Snowflake[] = [];
      for (let i = 0; i < 50; i++) {
        flakes.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 4 + 2,
          speed: Math.random() * 2 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          duration: Math.random() * 5 + 5
        });
      }
      setSnowflakes(flakes);
    };

    createSnowflakes();

    const animate = () => {
      setSnowflakes(prev =>
        prev.map(flake => ({
          ...flake,
          y: flake.y + flake.speed,
          x: flake.x + Math.sin(flake.y * 0.01) * 0.5,
          ...(flake.y > window.innerHeight && {
            y: -10,
            x: Math.random() * window.innerWidth
          })
        }))
      );
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="snowflake absolute rounded-full bg-white"
          style={{
            left: flake.x,
            top: flake.y,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            boxShadow: `0 0 ${flake.size}px rgba(255,255,255,0.8)`
          }}
          animate={{
            y: window.innerHeight + 20,
            rotate: 360,
          }}
          transition={{
            duration: flake.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}