import { useCallback, useEffect, useMemo, useState } from 'react';
import { VillageScene } from './features/advent/components/VillageScene';
import { MusicPlayer, playThemeAtRandomPoint, THEME_TRACK_PATH } from './components/MusicPlayer';
import { adventMemories } from './data/adventMemories';
import type { AdventDay } from './types/advent';
import { seedImageStore, getImageForDay } from './lib/localImageStore';
import { loadOpenedDayMap, persistOpenedDay } from './lib/openedDaysStorage';
import { MemoryModal } from './features/advent/components/MemoryModal';
import { PastMemoryCarousel } from './features/advent/components/PastMemoryCarousel';
import { SurprisePortal } from './features/advent/components/SurprisePortal';
import { ChatWithDaddy } from './features/chat/ChatWithDaddy';
import { SoundManager } from './features/advent/utils/SoundManager';

const ACCESS_KEY = 'access-codeword';
const ACCESS_PHRASE = 'grace janin';

function App() {
  const [days, setDays] = useState<AdventDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<AdventDay | null>(null);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [codeAttempt, setCodeAttempt] = useState('');
  const [authError, setAuthError] = useState('');
  const soundManager = SoundManager.getInstance();
  const forceUnlock =
    String(import.meta.env.VITE_FORCE_UNLOCK ?? import.meta.env.FORCE_UNLOCK ?? '').toLowerCase() === 'true';
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
        const assignedPhoto = memory.photoPath ?? getImageForDay(memory.id, memory.palette);
        const openedAt = forceUnlock ? null : openedMap[memory.id] ?? null;
        return {
          id: memory.id,
          title: memory.title,
          message: memory.message,
          photo_url: assignedPhoto,
          is_opened: forceUnlock ? false : Boolean(openedAt),
          opened_at: openedAt,
          created_at: new Date(Date.UTC(2023, 11, memory.id)).toISOString(),
          confettiType: memory.confettiType,
          unlockEffect: memory.unlockEffect,
          musicUrl: memory.musicUrl,
          voiceUrl: memory.voiceUrl,
          photoMarkdownPath: memory.photoMarkdownPath ?? null,
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(ACCESS_KEY);
    if (stored && stored.toLowerCase() === ACCESS_PHRASE) {
      setIsAuthorized(true);
    }
  }, []);

  const handleCodeSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (codeAttempt.trim().toLowerCase() === ACCESS_PHRASE) {
      localStorage.setItem(ACCESS_KEY, ACCESS_PHRASE);
      setIsAuthorized(true);
      setAuthError('');
    } else {
      setAuthError('Hmm, that does not sound right. Try again!');
    }
  };

  const handleOpenDay = (dayId: number) => {
    const openedAt = new Date().toISOString();
    if (!forceUnlock) {
      persistOpenedDay(dayId, openedAt);
    }

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

  const ensureMusicPlaying = () => {
    soundManager.init().then(() => {
      const startMusic = async () => {
        try {
          if (!soundManager.isMusicPlaying()) {
            await playThemeAtRandomPoint(soundManager);
          } else {
            await soundManager.playMusic(THEME_TRACK_PATH);
          }
        } catch {
          // Autoplay prevented; will retry on next interaction
        }
      };
      startMusic();
    });
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

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-sky-100 to-amber-100 p-6 text-center">
        <form
          onSubmit={handleCodeSubmit}
          className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg space-y-4"
        >
          <h1 className="text-2xl font-extrabold text-pink-500">What is your Middle and Last Name?</h1>
          <p className="text-sm text-slate-500">Please share the secret codeword so Daddy can open the village.</p>
          <input
            type="text"
            value={codeAttempt}
            onChange={(event) => setCodeAttempt(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
            placeholder="Type it here"
          />
          {authError && <p className="text-pink-600 text-sm">{authError}</p>}
          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white font-semibold py-3 shadow-lg hover:scale-105 transition"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

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

export default App;
