import { useEffect, useState } from 'react';
import { supabase, AdventDay } from './lib/supabase';
import { DayCard } from './components/DayCard';
import { Butterfly } from './components/Butterfly';
import { MusicPlayer } from './components/MusicPlayer';

function App() {
  const [days, setDays] = useState<AdventDay[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const isDecember = currentDate.getMonth() === 11;

  useEffect(() => {
    loadDays();
  }, []);

  const loadDays = async () => {
    try {
      const { data, error } = await supabase
        .from('advent_days')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setDays(data || []);
    } catch (error) {
      console.error('Error loading days:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDay = async (dayId: number) => {
    try {
      const { error } = await supabase
        .from('advent_days')
        .update({
          is_opened: true,
          opened_at: new Date().toISOString(),
        })
        .eq('id', dayId);

      if (error) throw error;

      setDays((prevDays) =>
        prevDays.map((day) =>
          day.id === dayId
            ? { ...day, is_opened: true, opened_at: new Date().toISOString() }
            : day
        )
      );
    } catch (error) {
      console.error('Error opening day:', error);
    }
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Butterfly delay={0} color="blue" />
        <Butterfly delay={2} color="orange" />
        <Butterfly delay={4} color="pink" />
        <Butterfly delay={6} color="lavender" />
        <Butterfly delay={8} color="blue" />
        <Butterfly delay={10} color="orange" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1
            className="text-6xl md:text-7xl font-black mb-4"
            style={{
              textShadow: '0 0 30px rgba(100, 200, 255, 0.6), 4px 4px 12px rgba(0, 0, 0, 0.8)',
            }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-orange-300">
              December Adventures
            </span>
          </h1>
          <p
            className="text-2xl font-bold"
            style={{
              textShadow: '0 0 20px rgba(255, 150, 100, 0.5), 2px 2px 8px rgba(0, 0, 0, 0.8)',
            }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-pink-300">
              A magical calendar for someone special! 🦋
            </span>
          </p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-4 max-w-7xl mx-auto">
          {days.map((day) => (
            <DayCard
              key={day.id}
              day={day}
              onOpen={handleOpenDay}
              isDecember={isDecember}
            />
          ))}
        </div>

        {!isDecember && (
          <div className="mt-12 text-center">
            <div
              className="inline-block clay-card rounded-[20px] px-8 py-4"
              style={{
                background: 'linear-gradient(145deg, #1e3a8a, #0f4c75)',
                boxShadow: '12px 12px 24px #1a1a2e, -12px -12px 24px #0f4c75, inset 2px 2px 4px rgba(100, 200, 255, 0.3)',
              }}
            >
              <p className="text-lg font-bold text-cyan-200">
                Come back in December to open the surprises! 🎄
              </p>
            </div>
          </div>
        )}
      </div>

      <MusicPlayer />
    </div>
  );
}

export default App;
