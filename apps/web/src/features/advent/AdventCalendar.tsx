import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdelaideDate } from '../../lib/date';
import { Butterfly } from '../../components/Butterfly';
import Modal from '../../components/Modal';
import { FloatingActionButton } from '../../components/FloatingActionButton';
import { SurprisePortal } from './components/SurprisePortal';
import { ChatWithDaddy } from '../chat/ChatWithDaddy';
import { AdventDay } from '../../types/advent';
import { ConfettiSystem } from './utils/ConfettiSystem';
import { SoundManager } from './utils/SoundManager';
import { adventMemories } from '../../data/adventMemories';

interface AdventCalendarProps {
  days: AdventDay[];
  onOpenDay: (dayId: string) => void;
  theme?: 'snow' | 'warm' | 'candy' | 'forest' | 'starlight' | 'christmas' | 'winter' | 'magical';
}

type CalendarTheme = 'christmas' | 'winter' | 'magical' | 'candy' | 'forest';

// Map parent portal themes to calendar component themes
const mapThemeToCalendar = (theme: AdventCalendarProps['theme']): CalendarTheme => {
  switch (theme) {
    case 'snow':
      return 'christmas';
    case 'warm':
      return 'winter';
    case 'candy':
      return 'candy';
    case 'forest':
      return 'forest';
    case 'starlight':
      return 'magical';
    case 'christmas':
      return 'christmas';
    case 'winter':
      return 'winter';
    case 'magical':
      return 'magical';
    default:
      return 'christmas';
  }
};

const AdventCalendar: React.FC<AdventCalendarProps> = ({
  days,
  onOpenDay,
  theme = 'christmas'
}) => {
  // Map the incoming theme to calendar-compatible theme
  const calendarTheme = mapThemeToCalendar(theme);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<AdventDay | null>(null);
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [surpriseVideoUrl, setSurpriseVideoUrl] = useState<string | null>(null);

  const soundManager = useRef(SoundManager.getInstance());

  const currentDate = getAdelaideDate();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const isDecember = currentMonth === 11;

  // Determine if a day should be unlocked
  const isDayUnlocked = (dayNumber: number) => {
    if (!isDecember) return false;
    if (currentDay >= 25) return dayNumber <= 24; // All days unlocked after Dec 25
    return dayNumber <= currentDay;
  };

  const handleButtonClick = (day: AdventDay) => (event: React.MouseEvent) => {
    const dayId = day.day_id;
    const buttonRect = (event.target as HTMLElement).getBoundingClientRect();
    const origin = {
      x: (buttonRect.left + buttonRect.width / 2) / window.innerWidth,
      y: (buttonRect.top + buttonRect.height / 2) / window.innerHeight
    };

    if (!isDayUnlocked(day.day_number)) return;

    onOpenDay(dayId);
    setIsAnimating(true);
    setSelectedMemory(day);



    // Play unlock sound and confetti
    soundManager.current.init().then(() => {
      soundManager.current.play('unlock');
    });

    // Trigger confetti based on theme
    const confettiType = calendarTheme === 'christmas' ? 'stars' :
                        calendarTheme === 'winter' ? 'snow' :
                        calendarTheme === 'candy' ? 'candy' :
                        calendarTheme === 'forest' ? 'reindeer' : 'candy';
    ConfettiSystem.burst({ type: confettiType, origin });
  };

  const onAnimationComplete = () => {
    setIsAnimating(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMemory(null);
  };

  const handleSurpriseClick = () => {
    // For now, use a random video from adventMemories
    // In production, this would come from the surprise API
    const surpriseVideos = adventMemories
      .map(memory => memory.surpriseVideoUrl)
      .filter(Boolean) as string[];

    if (surpriseVideos.length > 0) {
      const randomVideo = surpriseVideos[Math.floor(Math.random() * surpriseVideos.length)];
      setSurpriseVideoUrl(randomVideo);
      setIsSurpriseOpen(true);
    }
  };

  const handleChatClick = () => {
    setIsChatOpen(true);
  };

  const closeSurprise = () => {
    setIsSurpriseOpen(false);
    setSurpriseVideoUrl(null);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };



  const getThemeBackground = () => {
    switch (calendarTheme) {
      case 'winter':
        return 'bg-gradient-to-br from-blue-300 via-cyan-300 to-indigo-400';
      case 'magical':
        return 'bg-gradient-to-br from-purple-300 via-pink-300 to-indigo-400';
      case 'candy':
        return 'bg-gradient-to-br from-pink-400 via-red-400 to-yellow-400';
      case 'forest':
        return 'bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500';
      default: // christmas
        return 'bg-gradient-to-br from-pink-300 via-red-300 to-green-400';
    }
  };

  return (
    <div className={`p-4 min-h-screen ${getThemeBackground()}`}>
      {isAnimating && <Butterfly onAnimationComplete={onAnimationComplete} />}
      {selectedMemory && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={selectedMemory.title || `Day ${selectedMemory.day_number}`}
          text={selectedMemory.message}
          photo={selectedMemory.photo_asset_id || `https://picsum.photos/400/300?random=${selectedMemory.day_number}`} // Temporary fallback
          theme={calendarTheme}
          voiceUrl={selectedMemory.voice_asset_id || undefined}
          musicUrl={selectedMemory.music_asset_id || undefined}
          confettiType={selectedMemory.confetti_type}
        />
      )}

      {/* Surprise Portal */}
      <SurprisePortal
        isOpen={isSurpriseOpen}
        videoUrl={surpriseVideoUrl}
        onClose={closeSurprise}
      />

      {/* Chat Modal */}
      <ChatWithDaddy
        isOpen={isChatOpen}
        onClose={closeChat}
      />

      {/* Floating Action Buttons */}
      <FloatingActionButton
        onClick={handleSurpriseClick}
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        }
        label="Surprise Video"
        theme={calendarTheme}
        position="bottom-left"
      />

      <FloatingActionButton
        onClick={handleChatClick}
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        }
        label="Chat with Daddy"
        theme={calendarTheme}
        position="bottom-right"
        notificationCount={0} // Unread message count - implement when chat is added
      />

      <h1 className="text-4xl font-bold text-center text-white mb-8">
        Christmas Advent Calendar
      </h1>
      <div className="grid grid-cols-5 gap-4">
        {days.map((day) => {
          const isUnlocked = isDayUnlocked(day.day_number);
          const isLocked = !isUnlocked;

          return (
            <motion.button
              key={day.day_id}
              disabled={isLocked}
              onClick={handleButtonClick(day)}
              className={`relative w-24 h-24 text-white font-bold flex items-center justify-center text-2xl transition-all duration-300 ${
                isLocked
                  ? 'bg-gray-400 cursor-not-allowed opacity-60'
                  : 'bg-pink-500 hover:bg-pink-600 hover:scale-110 hover:shadow-lg hover:shadow-pink-400/50'
              }`}
              style={{
                clipPath: isLocked
                  ? 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")'
                  : 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")',
              }}
              whileHover={isUnlocked ? { scale: 1.1, y: -2 } : {}}
              whileTap={isUnlocked ? { scale: 0.95 } : {}}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                boxShadow: isUnlocked ? '0 0 20px rgba(236, 72, 153, 0.3)' : 'none'
              }}
              transition={{
                duration: 0.3,
                delay: day.day_number * 0.05
              }}
            >
              {isLocked && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </motion.div>
              )}
              {isUnlocked && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: day.day_number * 0.1 }}
                >
                  {day.day_number}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default AdventCalendar;
