import React from 'react';
import { motion } from 'framer-motion';
import { useThemeUtils } from '../../../../themes/ThemeProvider';

export interface NavigationControlsProps {
  currentIndex: number;
  totalItems: number;
  onPrevious?: () => void;
  onNext?: () => void;
  onJumpTo?: (index: number) => void;
  showJumpTo?: boolean;
  variant?: 'buttons' | 'minimal' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  theme?: string;
  className?: string;
  disabled?: boolean;
  showLabels?: boolean;
  customLabels?: {
    previous?: string;
    next?: string;
  };
}

/**
 * NavigationControls - Navigation component for product content
 *
 * Provides Previous/Next navigation controls with optional jump-to-section
 * functionality. Supports different visual styles and theme-aware styling.
 */
export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentIndex,
  totalItems,
  onPrevious,
  onNext,
  onJumpTo,
  showJumpTo = false,
  variant = 'buttons',
  size = 'md',
  theme = 'default',
  className = '',
  disabled = false,
  showLabels = true,
  customLabels = {}
}) => {
  const { getThemeColor } = useThemeUtils();
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalItems - 1;

  // Size configurations
  const sizeConfig = {
    sm: { button: 'px-3 py-1 text-sm', icon: 'w-4 h-4', spacing: 'space-x-2' },
    md: { button: 'px-4 py-2 text-base', icon: 'w-5 h-5', spacing: 'space-x-4' },
    lg: { button: 'px-6 py-3 text-lg', icon: 'w-6 h-6', spacing: 'space-x-6' }
  };

  // Theme-aware colors using the theme system
  const getThemeColors = () => {
    const primaryColor = getThemeColor('primary');
    return {
      enabled: `bg-[${primaryColor}] hover:bg-opacity-80 text-white border-[${primaryColor}]`,
      disabled: 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200',
      floating: `bg-[${primaryColor}] hover:bg-opacity-80 shadow-lg`
    };
  };

  const colors = getThemeColors();

  // Previous button component
  const PreviousButton = () => (
    <motion.button
      className={`${sizeConfig[size].button} rounded-lg border transition-all duration-200 font-medium flex items-center ${sizeConfig[size].spacing} ${
        hasPrevious && !disabled ? colors.enabled : colors.disabled
      } ${variant === 'floating' ? colors.floating : ''}`}
      onClick={onPrevious}
      disabled={!hasPrevious || disabled}
      whileHover={hasPrevious && !disabled ? { scale: 1.05 } : {}}
      whileTap={hasPrevious && !disabled ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <svg className={sizeConfig[size].icon} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      {showLabels && (
        <span>{customLabels.previous || 'Previous'}</span>
      )}
    </motion.button>
  );

  // Next button component
  const NextButton = () => (
    <motion.button
      className={`${sizeConfig[size].button} rounded-lg border transition-all duration-200 font-medium flex items-center ${sizeConfig[size].spacing} ${
        hasNext && !disabled ? colors.enabled : colors.disabled
      } ${variant === 'floating' ? colors.floating : ''}`}
      onClick={onNext}
      disabled={!hasNext || disabled}
      whileHover={hasNext && !disabled ? { scale: 1.05 } : {}}
      whileTap={hasNext && !disabled ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {showLabels && (
        <span>{customLabels.next || 'Next'}</span>
      )}
      <svg className={sizeConfig[size].icon} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    </motion.button>
  );

  // Jump-to-section dropdown
  const JumpToSection = () => {
    if (!showJumpTo || !onJumpTo) return null;

    return (
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <select
          className={`${sizeConfig[size].button} rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
          value={currentIndex}
          onChange={(e) => onJumpTo(parseInt(e.target.value))}
          disabled={disabled}
        >
          {Array.from({ length: totalItems }, (_, index) => (
            <option key={index} value={index}>
              Section {index + 1} {index === currentIndex ? '(Current)' : ''}
            </option>
          ))}
        </select>
      </motion.div>
    );
  };

  // Minimal variant - just Previous/Next buttons
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center ${sizeConfig[size].spacing} ${className}`}>
        <PreviousButton />
        <NextButton />
      </div>
    );
  }

  // Floating variant - overlay style buttons
  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
        <motion.div
          className={`flex items-center bg-white rounded-full shadow-lg p-2 ${sizeConfig[size].spacing}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <PreviousButton />
          {showJumpTo && <JumpToSection />}
          <NextButton />
        </motion.div>
      </div>
    );
  }

  // Default buttons variant - full navigation bar
  return (
    <motion.div
      className={`flex items-center justify-between ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center space-x-4">
        <PreviousButton />
        {showJumpTo && <JumpToSection />}
      </div>

      <div className="text-sm text-gray-600 font-medium">
        {currentIndex + 1} of {totalItems}
      </div>

      <NextButton />
    </motion.div>
  );
};

export default NavigationControls;