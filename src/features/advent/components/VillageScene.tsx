import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { AdventDay } from '../../../lib/supabase';
import { HouseCard } from './HouseCard';
import { Snowfall } from './Snowfall';
import { NorthernLights } from './NorthernLights';
import { FloatingFireflies } from './FloatingFireflies';
import { ButterflyCollection } from './ButterflyCollection';
import { ButterflyPath } from './ButterflyPath';
import { SoundManager } from '../utils/SoundManager';
import dailyContent from '../../../lib/dailyContent.json';

interface VillageSceneProps {
  days: AdventDay[];
  onOpenDay: (dayId: number) => void;
  isDecember: boolean;
}

export function VillageScene({ days, onOpenDay, isDecember }: VillageSceneProps) {
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [collectedButterflies, setCollectedButterflies] = useState<string[]>([]);
  const soundManager = SoundManager.getInstance();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    soundManager.init();
    // Load some basic sounds
    soundManager.loadSound('door-creak', '/assets/christmas/audio/sfx/door-creak.mp3');
    soundManager.loadSound('magical-ding', '/assets/christmas/audio/sfx/magical-ding.mp3');
    soundManager.loadSound('confetti-burst', '/assets/christmas/audio/sfx/confetti-burst.mp3');
    soundManager.loadSound('elf-giggle', '/assets/christmas/audio/sfx/elf-giggle.mp3');
    soundManager.loadSound('butterfly-caught', '/assets/christmas/audio/sfx/butterfly-caught.mp3');

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          setPanX(prev => Math.max(-200, prev - 20));
          break;
        case 'ArrowRight':
          setPanX(prev => Math.min(200, prev + 20));
          break;
        case 'ArrowUp':
          setPanY(prev => Math.max(-100, prev - 20));
          break;
        case 'ArrowDown':
          setPanY(prev => Math.min(100, prev + 20));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate positions for houses in a village layout
  const getHousePosition = (dayId: number) => {
    const row = Math.floor((dayId - 1) / 6);
    const col = (dayId - 1) % 6;
    const baseX = col * 120 + (row % 2) * 60; // Offset every other row
    const baseY = row * 100;
    return { x: baseX, y: baseY };
  };

  // Merge days with daily content
  const enrichedDays = days.map(day => ({
    ...day,
    ...dailyContent.find(content => content.day === day.id)
  } as AdventDay));

  const handlePan = (_event: any, info: any) => {
    setPanX(prev => Math.max(-200, Math.min(200, prev + info.delta.x)));
    setPanY(prev => Math.max(-100, Math.min(100, prev + info.delta.y)));
  };

  const handleButterflyCaught = (type: string) => {
    setCollectedButterflies(prev => [...prev, type]);
  };

  // Sample butterfly path
  const butterflyPath = [
    { x: 100, y: 200 },
    { x: 200, y: 150 },
    { x: 300, y: 250 },
    { x: 400, y: 200 },
    { x: 500, y: 300 }
  ];

  const pathButterflies = [
    { type: 'blue' as const, position: 0.2 },
    { type: 'pink' as const, position: 0.5 },
    { type: 'orange' as const, position: 0.8 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-100 via-sky-100 to-orange-100 relative overflow-hidden" data-testid="village-scene">
      {/* Background effects */}
      <Snowfall />
      <NorthernLights />
      <FloatingFireflies />
      <ButterflyCollection />

      {/* Main content */}
      <div className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">
            Magical Christmas Village
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {days.map((day) => (
              <HouseCard
                key={day.id}
                day={day}
                onOpen={onOpenDay}
                isDecember={isDecember}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}