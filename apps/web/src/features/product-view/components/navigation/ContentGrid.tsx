import React from 'react';
import { motion } from 'framer-motion';
import { ProductContent } from '../../types/product';
import { useThemeUtils } from '../../../../themes/ThemeProvider';

export interface ContentGridProps {
  content: ProductContent[];
  renderItem: (content: ProductContent, index: number) => React.ReactNode;
  columns?: number;
  gap?: string;
  className?: string;
  itemClassName?: string;
  theme?: string;
}

/**
 * ContentGrid - Flexible grid layout component for product content
 *
 * This component provides a responsive grid layout that works across different
 * product types (calendar days, storybook pages, game levels). It handles
 * animation timing, responsive breakpoints, and theme-aware styling.
 */
export const ContentGrid: React.FC<ContentGridProps> = ({
  content,
  renderItem,
  columns = 5,
  gap = 'gap-4',
  className = '',
  itemClassName = '',
  theme = 'default'
}) => {
  const { getThemeClass } = useThemeUtils();

  // Responsive column classes based on product type and screen size
  const getGridClasses = () => {
    // Calendar-specific: 5 columns on desktop, 3 on tablet, 2 on mobile
    if (columns === 5) {
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
    }

    // Storybook/Game: 4 columns on desktop, 2 on tablet, 1 on mobile
    if (columns === 4) {
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }

    // Generic responsive grid
    return `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${Math.min(columns, 6)}`;
  };

  // Theme-aware container styling using the theme system
  const getContainerClasses = () => {
    const baseClasses = `grid ${getGridClasses()} ${gap} p-4 ${className}`;

    // Use theme system for background and spacing
    return getThemeClass(baseClasses, theme);
  };

  return (
    <div className={getContainerClasses()}>
      {content.map((contentItem, index) => (
        <motion.div
          key={contentItem.id}
          className={itemClassName}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }}
          transition={{
            duration: 0.3,
            delay: index * 0.05, // Staggered animation
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        >
          {renderItem(contentItem, index)}
        </motion.div>
      ))}
    </div>
  );
};

export default ContentGrid;