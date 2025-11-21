import { useParams } from 'react-router-dom';
import { VillageScene } from '../../features/calendar-viewer/components/VillageScene';
import { MemoryModal } from '../../features/calendar-viewer/components/MemoryModal';
import { SurprisePortal } from '../../features/calendar-viewer/components/SurprisePortal';
import { ChatWithDaddy } from '../../features/chat/ChatWithDaddy';
import { PastMemoryCarousel } from '../../features/calendar-viewer/components/PastMemoryCarousel';
import { MusicPlayer, playThemeAtRandomPoint } from '../../components/MusicPlayer';
import { SoundManager } from '../../features/advent/utils/SoundManager';
import { useState, useEffect, useMemo, useCallback } from 'react';

// For now, using mock data - will be replaced with API calls
const mockDays = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  title: `Day ${i + 1}`,
  message: `A magical message for day ${i + 1}!`,
  photo_url: `https://picsum.photos/400/300?random=${i + 1}`,
  is_opened: i < 3, // First 3 days opened for demo
  opened_at: i < 3 ? new Date(Date.UTC(2024, 11, i + 1)).toISOString() : null,
  created_at: new Date(Date.UTC(2024, 11, i + 1)).toISOString(),
  confettiType: 'default' as const,
  unlockEffect: 'sparkle' as const,
}));

const mockSurpriseUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=oHg5SJYRHA0',
];

export function ChildCalendarRoute() {
  const { shareUuid } = useParams<{ shareUuid: string }>();
  const [days, setDays] = useState(mockDays);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentSurpriseUrl, setCurrentSurpriseUrl] = useState<string | null>(null);
  const soundManager = SoundManager.getInstance();

  const sortOpenedDays = useCallback((opened: any[]) => {
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
    let openedDay: any = null;

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

  const openRandomSurprise = () => {
    if (mockSurpriseUrls.length === 0) return;
    const nextUrl = mockSurpriseUrls[Math.floor(Math.random() * mockSurpriseUrls.length)];
    setCurrentSurpriseUrl(nextUrl);
    setIsSurpriseOpen(true);
  };

  const closeSurprise = () => {
    setIsSurpriseOpen(false);
    setCurrentSurpriseUrl(null);
  };

  const ensureMusicPlaying = () => {
    soundManager.init().then(() => {
      const startMusic = async () => {
        try {
          if (!soundManager.isMusicPlaying()) {
            await playThemeAtRandomPoint(soundManager);
          } else {
            await soundManager.playMusic('/music/Ben Bohmer, Nils Hoffmann & Malou - Breathing.mp3');
          }
        } catch {
          // Autoplay prevented; will retry on next interaction
        }
      };
      startMusic();
    });
  };

  return (
    <div className="min-h-screen relative">
      <VillageScene days={days} onOpenDay={handleOpenDay} />
      <PastMemoryCarousel memories={openedMemories} />
      <MemoryModal isOpen={isMemoryOpen} day={selectedDay} onClose={handleCloseMemory} />

      <div className="fixed bottom-4 right-4 z-40 w-full max-w-3xl px-4">
        <div className="grid grid-cols-3 gap-3 items-center">
          <button
            onClick={() => {
              ensureMusicPlaying();
              setIsChatOpen(true);
            }}
            className="px-2 sm:px-4 py-3 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-semibold shadow-lg hover:scale-105 transition text-xs sm:text-base"
          >
            Chat With Daddy
          </button>
          <button
            onClick={() => {
              ensureMusicPlaying();
              openRandomSurprise();
            }}
            className="px-2 sm:px-4 py-3 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-semibold shadow-lg hover:scale-105 transition text-xs sm:text-base"
          >
            Surprise!
          </button>
          <div className="flex justify-center">
            <MusicPlayer />
          </div>
        </div>
      </div>

      <SurprisePortal isOpen={isSurpriseOpen} videoUrl={currentSurpriseUrl} onClose={closeSurprise} />
      <ChatWithDaddy isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}