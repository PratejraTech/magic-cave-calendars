import React, { useState } from 'react';
import { getAdelaideDate } from '../../lib/date';
import { Butterfly } from '../../components/Butterfly';
import Modal from '../../components/Modal';
import { AdventDay } from '../../lib/supabase';

interface Memory {
  title: string;
  text: string;
  photo: string;
}

interface AdventCalendarProps {
  days: AdventDay[];
  onOpenDay: (dayId: number) => void;
}

const AdventCalendar: React.FC<AdventCalendarProps> = ({ days, onOpenDay }) => {
  const [isAnimating, setIsAnimating]   = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const currentDate = getAdelaideDate();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth();

  const memories: { [key: number]: Memory } = {
    1: {
      title: 'A Special Day',
      text: 'This is a beautiful memory from a special day.',
      photo: 'https://via.placeholder.com/400x300',
    },
    // Add more memories for each day here
  };

  const handleButtonClick = (day: AdventDay) => {
    onOpenDay(day.id);
    setIsAnimating(true);
    const memory = memories[day.id] || {
      title: `Day ${day.id}`,
      text: 'A placeholder memory for this day.',
      photo: 'https://via.placeholder.com/400x300',
    };
    setSelectedMemory(memory);
  };

  const onAnimationComplete = () => {
    setIsAnimating(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMemory(null);
  };

  return (
    <div className="p-4 bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 min-h-screen">
      {isAnimating && <Butterfly onAnimationComplete={onAnimationComplete} />}
      {selectedMemory && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={selectedMemory.title}
          text={selectedMemory.text}
          photo={selectedMemory.photo}
        />
      )}
      <h1 className="text-4xl font-bold text-center text-white mb-8">
        Christmas Advent Calendar
      </h1>
      <div className="grid grid-cols-5 gap-4">
        {days.map((day) => {
          const isButtonDisabled = !(currentMonth === 11 && currentDay === day.id);
          return (
            <button
              key={day.id}
              disabled={isButtonDisabled}
              onClick={() => handleButtonClick(day)}
              className={`w-24 h-24 text-white font-bold flex items-center justify-center text-2xl transition-transform transform hover:scale-110 ${
                isButtonDisabled
                  ? 'bg-pink-400 cursor-not-allowed'
                  : 'bg-pink-500 hover:bg-pink-600'
              }`}
              style={{
                clipPath:
                  'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")',
              }}
            >
              {day.id}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AdventCalendar;
