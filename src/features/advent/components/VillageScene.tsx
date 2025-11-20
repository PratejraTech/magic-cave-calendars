import { useEffect, useState } from 'react';
import { AdventDay } from '../../../lib/supabase';
import { HouseCard } from './HouseCard';
import { Snowfall } from './Snowfall';
import { NorthernLights } from './NorthernLights';
import { FloatingFireflies } from './FloatingFireflies';
import { ButterflyCollection } from './ButterflyCollection';
import { SoundManager } from '../utils/SoundManager';

const ADELAIDE_OFFSET_MINUTES = 630;

const getAdelaideDate = () => {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcTime + ADELAIDE_OFFSET_MINUTES * 60000);
};

interface VillageSceneProps {
  days: AdventDay[];
  onOpenDay: (dayId: number) => void;
  isDecember: boolean;
}

export function VillageScene({ days, onOpenDay, isDecember }: VillageSceneProps) {
  const [collectedButterflies, setCollectedButterflies] = useState<string[]>([]);
  const soundManager = SoundManager.getInstance();

  useEffect(() => {
    soundManager.init();
    // Load some basic sounds
    soundManager.loadSound('door-creak', '/assets/christmas/audio/sfx/door-creak.mp3');
    soundManager.loadSound('magical-ding', '/assets/christmas/audio/sfx/magical-ding.mp3');
    soundManager.loadSound('confetti-burst', '/assets/christmas/audio/sfx/confetti-burst.mp3');
    soundManager.loadSound('elf-giggle', '/assets/christmas/audio/sfx/elf-giggle.mp3');
    soundManager.loadSound('butterfly-caught', '/assets/christmas/audio/sfx/butterfly-caught.mp3');
  }, [soundManager]);

  // Generate positions for houses in a village layout
  const getHousePosition = (dayId: number) => {
    const row = Math.floor((dayId - 1) / 6);
    const col = (dayId - 1) % 6;
    const baseX = col * 120 + (row % 2) * 60; // Offset every other row
    const baseY = row * 100;
    return { x: baseX, y: baseY };
  };

  const handleButterflyCaught = (type: string) => {
    setCollectedButterflies(prev => [...prev, type]);
  };

  const adelaideDate = getAdelaideDate();
  const isAdelaideDecember = adelaideDate.getMonth() === 11;
  const currentAdelaideDay = adelaideDate.getDate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-100 via-sky-100 to-orange-100 relative overflow-hidden" data-testid="village-scene">
      {/* Background effects */}
      <Snowfall />
      <NorthernLights />
      <FloatingFireflies />
      <ButterflyCollection onButterflyCaught={handleButterflyCaught} />

      {/* Main content */}
      <div className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">
            Magical Christmas Village
          </h1>
          {collectedButterflies.length > 0 && (
            <p className="text-center text-pink-500 font-semibold mb-6">
              Butterflies collected: {collectedButterflies.length}
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {days.map((day) => {
              const canOpen = isDecember && isAdelaideDecember && currentAdelaideDay >= day.id;
              const position = getHousePosition(day.id);

              return (
                <HouseCard
                  key={day.id}
                  day={day}
                  onOpen={onOpenDay}
                  canOpen={canOpen}
                  position={position}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
