import React from 'react';
import { motion } from 'framer-motion';
import { useThemeUtils } from '../../../../themes/ThemeProvider';

export interface ProgressIndicatorProps {
  current: number;
  total: number;
  variant?: 'dots' | 'bar' | 'circles' | 'numbers';
  size?: 'sm' | 'md' | 'lg';
  theme?: string;
  className?: string;
  showPercentage?: boolean;
  showNumbers?: boolean;
  onItemClick?: (index: number) => void;
}

/**
 * ProgressIndicator - Visual progress tracking component
 *
 * Displays completion progress across different product types using various
 * visual styles (dots, progress bar, circles, numbers). Supports interactive
 * navigation and theme-aware styling.
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
  variant = 'dots',
  size = 'md',
  theme = 'default',
  className = '',
  showPercentage = false,
  showNumbers = false,
  onItemClick
}) => {
  const { getThemeColor } = useThemeUtils();
  const percentage = Math.round((current / total) * 100);

  // Size configurations
  const sizeConfig = {
    sm: { dot: 'w-2 h-2', circle: 'w-6 h-6', bar: 'h-1', text: 'text-xs' },
    md: { dot: 'w-3 h-3', circle: 'w-8 h-8', bar: 'h-2', text: 'text-sm' },
    lg: { dot: 'w-4 h-4', circle: 'w-10 h-10', bar: 'h-3', text: 'text-base' }
  };

  // Theme-aware colors using the theme system
  const getThemeColors = () => {
    return {
      active: `bg-[${getThemeColor('primary')}]`,
      inactive: 'bg-gray-300',
      completed: `bg-[${getThemeColor('accent')}]`,
      text: `text-[${getThemeColor('primary')}]`
    };
  };

  const colors = getThemeColors();

  // Dots variant - shows individual progress dots
  const renderDots = () => (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {Array.from({ length: total }, (_, index) => {
        const isCompleted = index < current;
        const isActive = index === current - 1;

        return (
          <motion.button
            key={index}
            className={`${sizeConfig[size].dot} rounded-full transition-all duration-200 ${
              isCompleted ? colors.completed :
              isActive ? colors.active : colors.inactive
            } ${onItemClick ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
            onClick={() => onItemClick?.(index)}
            whileHover={onItemClick ? { scale: 1.2 } : {}}
            whileTap={onItemClick ? { scale: 0.9 } : {}}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 }}
          />
        );
      })}
      {showPercentage && (
        <span className={`ml-3 ${sizeConfig[size].text} font-medium ${colors.text}`}>
          {percentage}%
        </span>
      )}
    </div>
  );

  // Progress bar variant - shows continuous progress
  const renderBar = () => (
    <div className={`w-full ${className}`}>
      <div className={`w-full ${sizeConfig[size].bar} bg-gray-200 rounded-full overflow-hidden`}>
        <motion.div
          className={`${sizeConfig[size].bar} ${colors.active} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className={`${sizeConfig[size].text} ${colors.text} font-medium`}>
          {current} of {total} completed
        </span>
        {showPercentage && (
          <span className={`${sizeConfig[size].text} ${colors.text} font-bold`}>
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );

  // Circles variant - shows numbered circles
  const renderCircles = () => (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {Array.from({ length: total }, (_, index) => {
        const isCompleted = index < current;
        const isActive = index === current - 1;

        return (
          <motion.button
            key={index}
            className={`${sizeConfig[size].circle} rounded-full border-2 flex items-center justify-center font-bold transition-all duration-200 ${
              isCompleted
                ? `${colors.completed} border-transparent text-white`
                : isActive
                ? `${colors.active} border-transparent text-white`
                : `bg-white ${colors.inactive} border-current text-gray-500`
            } ${onItemClick ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
            onClick={() => onItemClick?.(index)}
            whileHover={onItemClick ? { scale: 1.1 } : {}}
            whileTap={onItemClick ? { scale: 0.9 } : {}}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
          >
            {showNumbers ? (index + 1) : (isCompleted ? '✓' : '')}
          </motion.button>
        );
      })}
    </div>
  );

  // Numbers variant - shows current/total numbers
  const renderNumbers = () => (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <motion.div
        className={`${sizeConfig[size].text} font-bold ${colors.text}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        key={current}
      >
        {current}
      </motion.div>
      <div className={`${sizeConfig[size].text} ${colors.text}`}>of</div>
      <div className={`${sizeConfig[size].text} ${colors.text} font-medium`}>
        {total}
      </div>
      {showPercentage && (
        <motion.div
          className={`${sizeConfig[size].text} font-bold ${colors.active}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          key={percentage}
        >
          ({percentage}%)
        </motion.div>
      )}
    </div>
  );

  // Render based on variant
  switch (variant) {
    case 'bar':
      return renderBar();
    case 'circles':
      return renderCircles();
    case 'numbers':
      return renderNumbers();
    case 'dots':
    default:
      return renderDots();
  }
};

export default ProgressIndicator;