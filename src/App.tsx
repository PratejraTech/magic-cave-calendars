import { useCallback, useEffect, useMemo, useState } from 'react';
import { VillageScene } from './features/advent/components/VillageScene';
import { MusicPlayer } from './components/MusicPlayer';
import { adventMemories } from './data/adventMemories';
import type { AdventDay } from './types/advent';
import { seedImageStore, getImageForDay } from './lib/localImageStore';
import { loadOpenedDayMap, persistOpenedDay } from './lib/openedDaysStorage';
import { MemoryModal } from './features/advent/components/MemoryModal';
import { PastMemoryCarousel } from './features/advent/components/PastMemoryCarousel';
import { SurprisePortal } from './features/advent/components/SurprisePortal';
import { ChatWithDaddy } from './features/chat/ChatWithDaddy';

function App() {
  const [days, setDays] = useState<AdventDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<AdventDay | null>(null);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentSurpriseUrl, setCurrentSurpriseUrl] = useState<string | null>(null);

  const sortOpenedDays = useCallback((opened: AdventDay[]) => {
    return [...opened].sort((a, b) => {
      if (a.opened_at && b.opened_at) {
        return a.opened_at.localeCompare(b.opened_at);
      }
      if (a.opened_at) return -1;
      if (b.opened_at) return 1;
      return a.id - b.id;
    });
  }, []);

  useEffect(() => {
    const init = () => {
      seedImageStore(adventMemories);
      const openedMap = loadOpenedDayMap();

      const preparedDays: AdventDay[] = adventMemories.map((memory) => {
        const openedAt = openedMap[memory.id] ?? null;
        return {
          id: memory.id,
          title: memory.title,
          message: memory.message,
          photo_url: getImageForDay(memory.id, memory.palette),
          is_opened: Boolean(openedAt),
          opened_at: openedAt,
          created_at: new Date(Date.UTC(2023, 11, memory.id)).toISOString(),
          confettiType: memory.confettiType,
          unlockEffect: memory.unlockEffect,
          musicUrl: memory.musicUrl,
          voiceUrl: memory.voiceUrl,
        };
      });

      setDays(preparedDays);
      setLoading(false);
    };

    init();
  }, [sortOpenedDays]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMemoryOpen(false);
        setSelectedDay(null);
        setIsSurpriseOpen(false);
        setIsChatOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenDay = (dayId: number) => {
    const openedAt = new Date().toISOString();
    persistOpenedDay(dayId, openedAt);

    let openedDay: AdventDay | null = null;
    setDays((prevDays) =>
      prevDays.map((day) => {
        if (day.id === dayId) {
          openedDay = { ...day, is_opened: true, opened_at: openedAt };
          return openedDay;
        }
        return day;
      })
    );

    if (openedDay) {
      setSelectedDay(openedDay);
      setIsMemoryOpen(true);
    }
  };

  const handleCloseMemory = () => {
    setIsMemoryOpen(false);
    setSelectedDay(null);
  };

  const openedMemories = useMemo(
    () => sortOpenedDays(days.filter((day) => day.is_opened)),
    [days, sortOpenedDays]
  );

  const surpriseOptions = useMemo(
    () =>
      adventMemories
        .map((memory) => memory.surpriseVideoUrl)
        .filter((url): url is string => Boolean(url)),
    []
  );

  const openRandomSurprise = () => {
    if (surpriseOptions.length === 0) return;
    const nextUrl = surpriseOptions[Math.floor(Math.random() * surpriseOptions.length)];
    setCurrentSurpriseUrl(nextUrl);
    setIsSurpriseOpen(true);
  };

  const closeSurprise = () => {
    setIsSurpriseOpen(false);
    setCurrentSurpriseUrl(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lavender-100 via-sky-100 to-orange-100">
        <div
          className="clay-card rounded-[20px] px-8 py-6 text-2xl font-bold"
          style={{
            background: 'linear-gradient(145deg, #e8d5f2, #d4e8f7)',
            boxShadow: '8px 8px 16px #b8a8c4, -8px -8px 16px #ffffff',
          }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">
            Loading magic...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <VillageScene days={days} onOpenDay={handleOpenDay} />
      <PastMemoryCarousel memories={openedMemories} />
      <MemoryModal isOpen={isMemoryOpen} day={selectedDay} onClose={handleCloseMemory} />
      <MusicPlayer />
      <div className="fixed top-6 right-6 flex flex-row-reverse gap-3 z-40">
        <button
          onClick={openRandomSurprise}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-semibold shadow-lg hover:scale-105 transition"
        >
          Surprise!
        </button>
        <button
          onClick={() => setIsChatOpen(true)}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-semibold shadow-lg hover:scale-105 transition"
        >
          Chat With Daddy
        </button>
      </div>
      <SurprisePortal isOpen={isSurpriseOpen} videoUrl={currentSurpriseUrl} onClose={closeSurprise} />
      <ChatWithDaddy isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}

export default App;
