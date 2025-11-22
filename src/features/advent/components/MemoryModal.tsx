import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import type { AdventDay } from '../../../types/advent';
import { generateModalSubtitle } from '../../chat/chatService';

interface MemoryModalProps {
  isOpen: boolean;
  day: AdventDay | null;
  onNext?: () => void;
  onClose?: () => void;
}

export function MemoryModal({ isOpen, day, onNext, onClose }: MemoryModalProps) {
  const [markdownTitle, setMarkdownTitle] = useState(day?.title ?? (day ? `Day ${day.id}` : ''));
  const [markdownMessage, setMarkdownMessage] = useState(day?.message ?? '');
  const messageCharacters = markdownMessage.split('');
  const heroName = markdownTitle;
  const heroNickname = markdownTitle.split(' ')[0] ?? (day ? `Day ${day.id}` : '');
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const [subtitleLoading, setSubtitleLoading] = useState(false);

  useEffect(() => {
    if (!day || !isOpen) return;
    setMarkdownTitle(day.title ?? `Day ${day.id}`);
    setMarkdownMessage(day.message ?? '');
    if (!day.photoMarkdownPath) return;
    let cancelled = false;
    fetch(day.photoMarkdownPath)
      .then((res) => (res.ok ? res.text() : Promise.reject()))
      .then((text) => {
        if (cancelled) return;
        const lines = text.split(/\r?\n/).map((line) => line.trim());
        const nonEmpty = lines.filter(Boolean);
        if (nonEmpty.length > 0) {
          const [firstLine, ...rest] = nonEmpty;
          setMarkdownTitle(firstLine.replace(/^#\s*/, '') || (day.title ?? `Day ${day.id}`));
          setMarkdownMessage(rest.join('\n') || day.message || '');
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [day, isOpen]);

  useEffect(() => {
    if (!day || !isOpen) {
      setSubtitle(null);
      return;
    }
    let cancelled = false;
    setSubtitleLoading(true);
    const subtitleSource = markdownTitle || day.title || `Day ${day.id}`;
    generateModalSubtitle(subtitleSource)
      .then((result) => {
        if (!cancelled) {
          setSubtitle(result);
        }
      })
      .catch(() => {
        if (!cancelled) setSubtitle(null);
      })
      .finally(() => {
        if (!cancelled) setSubtitleLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [day, isOpen, markdownTitle]);

  const handleDownload = () => {
    if (!day) return;
    const link = document.createElement('a');
    link.href = day.photo_url;
    link.download = `harper-day-${day.id.toString().padStart(2, '0')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOverlayInteraction = () => {
    onClose?.();
  };

  const stopPropagation = (event: MouseEvent | TouchEvent) => {
    event.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && day && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayInteraction}
          onTouchStart={handleOverlayInteraction}
        >
          <motion.div
            className="relative max-w-3xl w-full bg-white/95 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(69,255,255,0.45)]"
            role="dialog"
            aria-modal="true"
            onClick={stopPropagation}
            onTouchStart={stopPropagation}
            initial={{ scale: 0.85, rotateX: -8, opacity: 0 }}
            animate={{ scale: 1, rotateX: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          >
            <div className="grid md:grid-cols-2 gap-0">
              <motion.div
                className="relative h-64 md:h-full"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <img
                  src={day.photo_url}
                  alt={day.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/40 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 bg-white/85 rounded-full px-4 py-2 font-bold text-pink-500 text-sm shadow-md">
                  Day {day.id}
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 text-white backdrop-blur-sm hover:scale-105 transition"
                    aria-label="Close memory"
                  >
                    Esc
                  </button>
                )}
              </motion.div>
              <div className="p-6 md:p-8 space-y-4">
                <p className="text-xs uppercase tracking-[0.5em] text-pink-400">memory unlocked</p>
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-fuchsia-500 to-sky-500">
                  {heroName}
                </h2>
                <p className="text-sm text-rose-400 font-semibold min-h-[24px]">
                  {subtitleLoading
                    ? 'Daddy is whispering...'
                    : subtitle ?? `Butterflies whisper: “This moment belongs to ${heroNickname}!”`}
                </p>
                <motion.p
                  className="text-slate-600 leading-relaxed text-lg min-h-[120px]"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.015 },
                    },
                  }}
                >
                  {messageCharacters.map((char, index) => (
                    <motion.span
                      key={`${day.id}-${index}`}
                      variants={{
                        hidden: { opacity: 0, y: 6 },
                        visible: { opacity: 1, y: 0 },
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.p>
                <div className="flex flex-wrap gap-3 pt-4">
                  {onNext && (
                    <button
                      onClick={onNext}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white font-semibold shadow-lg shadow-cyan-300/40 hover:scale-105 transition"
                    >
                      Next Memory
                      <span aria-hidden="true">🦋</span>
                    </button>
                  )}
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-slate-800 font-semibold shadow-md hover:shadow-lg border border-slate-200"
                  >
                    Download Photo
                    <span aria-hidden="true">⬇️</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
