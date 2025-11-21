import { useEffect, useState } from 'react';
import type { AdventDay } from '../../../types/advent';

interface PastMemoryCarouselProps {
  memories: AdventDay[];
  rotationMs?: number;
}

export function PastMemoryCarousel({ memories, rotationMs = 8000 }: PastMemoryCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    if (memories.length <= 1) return;

    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % memories.length);
    }, rotationMs);

    return () => window.clearInterval(interval);
  }, [memories, rotationMs]);

  if (memories.length === 0) {
    return null;
  }

  const current = memories[index] ?? memories[0];

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-end gap-3" data-testid="past-memory-carousel">
      <div className="w-28 h-28 rounded-2xl overflow-hidden border border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.45)] bg-black/40 backdrop-blur">
        <img
          src={current.photo_url}
          alt={current.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="max-w-[220px] rounded-2xl bg-white/85 text-slate-800 text-sm font-semibold shadow-lg p-3">
        {current.message}
      </div>
    </div>
  );
}
