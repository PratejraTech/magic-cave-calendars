import { useParams } from 'react-router-dom';
import { VillageScene } from '../../features/advent/components/VillageScene';
import { MemoryModal } from '../../features/advent/components/MemoryModal';
import { SurprisePortal } from '../../features/advent/components/SurprisePortal';
import { ChatWithDaddy } from '../../features/chat/ChatWithDaddy';
import { PastMemoryCarousel } from '../../features/advent/components/PastMemoryCarousel';
import { ThemeSwitcher } from '../../features/advent/components/ThemeSwitcher';
import { MusicPlayer, playThemeAtRandomPoint } from '../../components/MusicPlayer';
import { SoundManager } from '../../features/advent/utils/SoundManager';
import { useTheme } from '../../themes/ThemeProvider';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchCalendarDays, fetchSurpriseUrls, openCalendarDay, trackAnalytics, type CalendarDay } from '../../lib/api';

export function ChildCalendarRoute() {
  const { shareUuid } = useParams<{ shareUuid: string }>();
  const { setTheme } = useTheme();
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [surpriseUrls, setSurpriseUrls] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
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



  // Load calendar data on mount
  useEffect(() => {
    const loadCalendarData = async () => {
      if (!shareUuid) return;

      try {
        const [calendarResponse, urls] = await Promise.all([
          fetchCalendarDays(shareUuid),
          fetchSurpriseUrls(shareUuid)
        ]);
        setDays(calendarResponse.days);
        setSurpriseUrls(urls);

        // Set theme from calendar data
        if (calendarResponse.childInfo?.theme) {
          setTheme(calendarResponse.childInfo.theme);
        }

        // Track calendar view analytics
        trackAnalytics(shareUuid, 'calendar_open');
      } catch {
        // Error handled silently - could show error page
        // Error handling is done in the API functions with fallbacks
      }
    };

    loadCalendarData();
  }, [shareUuid, setTheme]);

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

  const handleOpenDay = async (dayId: string) => {
    if (!shareUuid) return;

    const openedAt = new Date().toISOString();
    let openedDay: CalendarDay | null = null;

    setDays((prevDays) =>
      prevDays.map((day) => {
        if (day.day_id === dayId) {
          openedDay = { ...day, is_opened: true, opened_at: openedAt };
          return openedDay;
        }
        return day;
      })
    );

    if (openedDay) {
      setSelectedDay(openedDay);
      setIsMemoryOpen(true);

      // Track day open analytics
      trackAnalytics(shareUuid, 'day_open', { day_id: dayId });

      // Mark day as opened in backend
      try {
        await openCalendarDay(shareUuid, dayId);
      } catch {
        // Error handled silently - day opening failed
        // Continue with UI update even if backend call fails
      }
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
    if (surpriseUrls.length === 0) {
      // No surprise URLs available - could show a message or fallback
      return;
    }
    const nextUrl = surpriseUrls[Math.floor(Math.random() * surpriseUrls.length)];
    setCurrentSurpriseUrl(nextUrl);
    setIsSurpriseOpen(true);

    // Track surprise open analytics
    if (shareUuid) {
      trackAnalytics(shareUuid, 'surprise_open');
    }
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
      <ThemeSwitcher />
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