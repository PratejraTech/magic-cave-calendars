import React from 'react';
import { motion } from 'framer-motion';

export interface LoadingSkeletonProps {
  type: 'calendar' | 'storybook' | 'game' | 'generic';
  theme?: string;
  className?: string;
}

/**
 * LoadingSkeleton - Product-type-specific loading skeletons
 *
 * Provides animated loading placeholders that match the structure
 * and visual style of different product types.
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type,
  theme = 'default',
  className = ''
}) => {
  // Theme-aware colors for skeleton animations
  const getSkeletonColors = () => {
    switch (theme) {
      case 'snow':
      case 'christmas':
        return {
          base: 'bg-gray-200',
          shimmer: 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200'
        };
      case 'warm':
      case 'winter':
        return {
          base: 'bg-amber-100',
          shimmer: 'bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100'
        };
      case 'candy':
        return {
          base: 'bg-pink-100',
          shimmer: 'bg-gradient-to-r from-pink-100 via-pink-50 to-pink-100'
        };
      case 'forest':
        return {
          base: 'bg-green-100',
          shimmer: 'bg-gradient-to-r from-green-100 via-green-50 to-green-100'
        };
      case 'starlight':
      case 'magical':
        return {
          base: 'bg-purple-100',
          shimmer: 'bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100'
        };
      default:
        return {
          base: 'bg-gray-200',
          shimmer: 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200'
        };
    }
  };

  const colors = getSkeletonColors();

  // Shimmer animation component
  const ShimmerBox: React.FC<{ className: string; delay?: number }> = ({ className, delay = 0 }) => (
    <motion.div
      className={`${className} ${colors.base} rounded-lg overflow-hidden`}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <motion.div
        className={`h-full w-full ${colors.shimmer}`}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          backgroundSize: '200% 100%'
        }}
      />
    </motion.div>
  );

  // Calendar loading skeleton - shows grid of day tiles
  const CalendarSkeleton = () => (
    <div className={`p-4 min-h-screen ${className}`}>
      {/* Title skeleton */}
      <ShimmerBox className="h-12 w-80 mx-auto mb-8" />

      {/* Progress indicator skeleton */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2">
          {Array.from({ length: 5 }, (_, i) => (
            <ShimmerBox key={i} className="w-3 h-3 rounded-full" delay={i * 0.1} />
          ))}
        </div>
      </div>

      {/* Calendar grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
        {Array.from({ length: 24 }, (_, i) => (
          <ShimmerBox
            key={i}
            className="w-24 h-24 rounded-full"
            delay={i * 0.02}
          />
        ))}
      </div>
    </div>
  );

  // Storybook loading skeleton - shows page layout
  const StorybookSkeleton = () => (
    <div className={`p-4 min-h-screen ${className}`}>
      {/* Title skeleton */}
      <ShimmerBox className="h-10 w-64 mx-auto mb-8" />

      {/* Progress indicator skeleton */}
      <div className="flex justify-center mb-8">
        <ShimmerBox className="w-32 h-2 rounded-full" />
      </div>

      {/* Page content skeleton */}
      <div className="max-w-2xl mx-auto">
        {/* Illustration placeholder */}
        <ShimmerBox className="w-full h-64 mb-6 rounded-lg" />

        {/* Text content placeholders */}
        <div className="space-y-3">
          <ShimmerBox className="h-4 w-full" />
          <ShimmerBox className="h-4 w-5/6" />
          <ShimmerBox className="h-4 w-4/5" />
          <ShimmerBox className="h-4 w-full" />
          <ShimmerBox className="h-4 w-3/4" />
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <ShimmerBox className="w-24 h-10 rounded-lg" />
          <ShimmerBox className="w-24 h-10 rounded-lg" />
        </div>
      </div>
    </div>
  );

  // Game loading skeleton - shows level grid
  const GameSkeleton = () => (
    <div className={`p-4 min-h-screen ${className}`}>
      {/* Title skeleton */}
      <ShimmerBox className="h-12 w-72 mx-auto mb-8" />

      {/* Progress indicator skeleton */}
      <div className="flex justify-center mb-8">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }, (_, i) => (
            <ShimmerBox key={i} className="w-8 h-8 rounded" delay={i * 0.05} />
          ))}
        </div>
      </div>

      {/* Game level grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="space-y-3">
            <ShimmerBox className="w-full h-32 rounded-lg" delay={i * 0.03} />
            <ShimmerBox className="h-4 w-3/4 mx-auto" delay={i * 0.03 + 0.1} />
          </div>
        ))}
      </div>
    </div>
  );

  // Generic loading skeleton
  const GenericSkeleton = () => (
    <div className={`p-4 min-h-screen flex items-center justify-center ${className}`}>
      <div className="text-center">
        <motion.div
          className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <ShimmerBox className="h-6 w-48 mx-auto" />
      </div>
    </div>
  );

  // Render based on type
  switch (type) {
    case 'calendar':
      return <CalendarSkeleton />;
    case 'storybook':
      return <StorybookSkeleton />;
    case 'game':
      return <GameSkeleton />;
    case 'generic':
    default:
      return <GenericSkeleton />;
  }
};

export default LoadingSkeleton;