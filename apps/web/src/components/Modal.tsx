import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SoundManager } from '../features/advent/utils/SoundManager';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  text: string;
  photo: string;
  theme?: 'christmas' | 'winter' | 'magical' | 'candy' | 'forest';
  voiceUrl?: string;
  musicUrl?: string;
  confettiType?: 'snow' | 'stars' | 'candy' | 'reindeer';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  text,
  photo,
  theme = 'christmas',
  voiceUrl,
  musicUrl,
  confettiType
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const soundManagerRef = useRef(SoundManager.getInstance());

  // Theme-based styling
  const getThemeStyles = () => {
    switch (theme) {
      case 'winter':
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          accent: 'text-cyan-600',
          button: 'bg-blue-500 hover:bg-blue-600',
          glow: 'shadow-blue-200'
        };
      case 'magical':
        return {
          bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
          border: 'border-purple-200',
          text: 'text-purple-900',
          accent: 'text-pink-600',
          button: 'bg-purple-500 hover:bg-purple-600',
          glow: 'shadow-purple-200'
        };
      default: // christmas
        return {
          bg: 'bg-gradient-to-br from-pink-50 to-red-50',
          border: 'border-pink-200',
          text: 'text-red-900',
          accent: 'text-pink-600',
          button: 'bg-pink-500 hover:bg-pink-600',
          glow: 'shadow-pink-200'
        };
    }
  };

  const themeStyles = getThemeStyles();

  // Enhanced typewriter effect
  useEffect(() => {
    if (!isOpen || !text) return;

    setDisplayedText('');
    setIsTyping(true);
    setIsLoading(false);

    let currentIndex = 0;
    const typingSpeed = 50; // ms per character

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeNextChar, typingSpeed);
      } else {
        setIsTyping(false);
        // Play voice clip when typing completes
        if (voiceUrl) {
          soundManagerRef.current.init().then(() => {
            soundManagerRef.current.loadSound('voice', voiceUrl);
            soundManagerRef.current.play('voice');
          });
        }
      }
    };

    // Start typing after a brief delay
    setTimeout(typeNextChar, 500);
  }, [isOpen, text, voiceUrl]);

  // Handle modal opening
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setImageLoaded(false);
      setDisplayedText('');

      // Play background music if provided
      if (musicUrl) {
        soundManagerRef.current.init().then(() => {
          soundManagerRef.current.playMusic(musicUrl);
        });
      }
    }
  }, [isOpen, musicUrl]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className={`${themeStyles.bg} rounded-3xl p-8 max-w-2xl w-full mx-4 border-2 ${themeStyles.border} shadow-2xl ${themeStyles.glow}`}
            onClick={(e) => e.stopPropagation()}
          >
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-6"
                >
                  <h2 className={`text-3xl font-bold ${themeStyles.text} mb-2`}>
                    {title}
                  </h2>
                  <div className={`w-24 h-1 bg-gradient-to-r ${themeStyles.accent} rounded-full mx-auto`}></div>
                </motion.div>

                {/* Photo */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0.9 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="relative mb-6 overflow-hidden rounded-2xl shadow-lg"
                >
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-2xl"></div>
                  )}
                  <motion.img
                    src={photo}
                    alt="Memory"
                    className="w-full h-80 object-cover"
                    onLoad={handleImageLoad}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: imageLoaded ? 1 : 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                  {imageLoaded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-2xl"
                    />
                  )}
                </motion.div>

                {/* Text with enhanced typewriter */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mb-8"
                >
                  <p className={`text-lg leading-relaxed ${themeStyles.text} font-medium`}>
                    {displayedText}
                    {isTyping && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className={`${themeStyles.accent} ml-1`}
                      >
                        |
                      </motion.span>
                    )}
                  </p>
                </motion.div>

                {/* Close button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex justify-center"
                >
                  <button
                    onClick={onClose}
                    className={`px-8 py-3 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${themeStyles.button}`}
                  >
                    Close Memory ✨
                  </button>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
