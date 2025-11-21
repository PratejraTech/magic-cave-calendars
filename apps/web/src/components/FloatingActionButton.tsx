import React from 'react';
import { motion } from 'framer-motion';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  theme?: 'christmas' | 'winter' | 'magical';
  notificationCount?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  disabled?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  label,
  theme = 'christmas',
  notificationCount = 0,
  position = 'bottom-right',
  disabled = false
}) => {
  const getThemeStyles = () => {
    switch (theme) {
      case 'winter':
        return {
          bg: 'bg-blue-500 hover:bg-blue-600',
          shadow: 'shadow-blue-400/50',
          glow: 'hover:shadow-blue-400/70'
        };
      case 'magical':
        return {
          bg: 'bg-purple-500 hover:bg-purple-600',
          shadow: 'shadow-purple-400/50',
          glow: 'hover:shadow-purple-400/70'
        };
      default: // christmas
        return {
          bg: 'bg-pink-500 hover:bg-pink-600',
          shadow: 'shadow-pink-400/50',
          glow: 'hover:shadow-pink-400/70'
        };
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      default: // bottom-right
        return 'bottom-6 right-6';
    }
  };

  const themeStyles = getThemeStyles();

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`fixed ${getPositionStyles()} z-40 w-14 h-14 rounded-full ${themeStyles.bg} text-white shadow-lg ${themeStyles.shadow} ${themeStyles.glow} flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.5
      }}
    >
      {icon}

      {/* Notification Badge */}
      {notificationCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
        >
          {notificationCount > 9 ? '9+' : notificationCount}
        </motion.div>
      )}

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, x: position.includes('right') ? 10 : -10 }}
        whileHover={{ opacity: 1, x: 0 }}
        className={`absolute ${position.includes('right') ? 'right-16' : 'left-16'} top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap opacity-0 pointer-events-none`}
      >
        {label}
        <div className={`absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45 ${position.includes('right') ? 'right-[-4px]' : 'left-[-4px]'}`} />
      </motion.div>
    </motion.button>
  );
};