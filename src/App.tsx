import { useEffect, useState } from 'react';
import { supabase, AdventDay } from './lib/supabase';
import { VillageScene } from './features/advent/components/VillageScene';
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
    <div className="min-h-screen">
      <VillageScene
        days={days}
        onOpenDay={handleOpenDay}
        isDecember={isDecember}
      />
      <MusicPlayer />
    </div>
  );
}

export default App;
