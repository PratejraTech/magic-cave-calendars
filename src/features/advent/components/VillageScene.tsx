import { useEffect, useState } from 'react';
import { AdventDay } from '../../../types/advent';
import { HouseCard } from './HouseCard';
import { Snowfall } from './Snowfall';
import { NorthernLights } from './NorthernLights';
import { FloatingFireflies } from './FloatingFireflies';
import { ButterflyCollection } from './ButterflyCollection';
import { SoundManager } from '../utils/SoundManager';
import { getAdelaideDate } from '../../../lib/date';
import { EnchantedBackground } from './EnchantedBackground';

interface VillageSceneProps {
  days: AdventDay[];
  onOpenDay: (dayId: number) => void;
}

const shouldForceUnlock = import.meta.env.DEV || import.meta.env.VITE_FORCE_UNLOCK === 'true';

export function VillageScene({ days, onOpenDay }: VillageSceneProps) {
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

  const handleButterflyCaught = (type: string) => {
    setCollectedButterflies(prev => [...prev, type]);
  };

  const adelaideDate = getAdelaideDate();
  const isAdelaideDecember = adelaideDate.getMonth() === 11;
  const currentAdelaideDay = adelaideDate.getDate();
  const allowDevUnlocks = shouldForceUnlock;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#02030a] via-[#080f1f] to-[#0d0420] relative overflow-hidden border border-white/15 rounded-[32px] m-2 sm:m-6 shadow-[0_25px_60px_rgba(0,0,0,0.55)]"
      data-testid="village-scene"
    >
      {/* Background effects */}
      <EnchantedBackground />
      <Snowfall />
      <NorthernLights />
      <FloatingFireflies />
      <ButterflyCollection onButterflyCaught={handleButterflyCaught} />

      {/* Main content */}
      <div className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 space-y-4">
            <p className="uppercase text-sm tracking-[0.4em] text-[#ff7be0] font-semibold">
              welcome to
            </p>
            <div className="inline-flex items-center justify-center px-6 py-3 rounded-[30px] border border-white/20 bg-white/5 backdrop-blur-sm shadow-[0_20px_45px_rgba(0,255,255,0.15)]">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-amber-200 drop-shadow-[0_0_25px_rgba(255,0,200,0.45)]">
                Harper&apos;s Xmas Village
              </h1>
            </div>
            <p className="text-cyan-200 font-medium mt-2">
              Unlock a flutter of memories each day with neon butterflies, heartbeats, and sparkles.
            </p>
          </div>
          {collectedButterflies.length > 0 && (
            <p className="text-center text-pink-300 font-semibold mb-6">
              Butterflies collected: {collectedButterflies.length}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {days.map((day) => {
              const canOpen =
                allowDevUnlocks || (isAdelaideDecember && currentAdelaideDay >= day.id);

              return (
                <HouseCard
                  key={day.id}
                  day={day}
                  onOpen={onOpenDay}
                  canOpen={canOpen}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
