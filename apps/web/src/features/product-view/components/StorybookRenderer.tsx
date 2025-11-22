import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductRendererProps } from '../types/product';
import { ProgressIndicator } from './navigation/ProgressIndicator';


type StorybookTheme = 'storybook' | 'fairy-tale' | 'adventure' | 'bedtime';

/**
 * StorybookRenderer - Specialized renderer for interactive storybook products
 *
 * Provides page-turning navigation with smooth transitions, illustrations,
 * and sequential reading experience optimized for children.
 */
export const StorybookRenderer: React.FC<ProductRendererProps> = ({
  product,
  content,
  onContentOpen,
  theme
}) => {

  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Map theme system themes to storybook themes
  const mapThemeToStorybook = (theme?: string): StorybookTheme => {
    switch (theme) {
      case 'warm':
        return 'bedtime';
      case 'starlight':
        return 'fairy-tale';
      case 'forest':
        return 'adventure';
      case 'storybook':
        return 'storybook';
      default:
        return 'storybook';
    }
  };

  const storybookTheme = mapThemeToStorybook(theme);

  const handlePageTurn = (direction: 'next' | 'prev') => {
    if (isTransitioning) return;

    const newPage = direction === 'next'
      ? Math.min(currentPage + 1, content.length - 1)
      : Math.max(currentPage - 1, 0);

    if (newPage !== currentPage) {
      setIsTransitioning(true);
      setCurrentPage(newPage);
      onContentOpen(content[newPage].id);

      // Reset transition state after animation
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const handlePageSelect = (pageIndex: number) => {
    if (isTransitioning || pageIndex === currentPage) return;

    setIsTransitioning(true);
    setCurrentPage(pageIndex);
    onContentOpen(content[pageIndex].id);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const getThemeBackground = () => {
    switch (storybookTheme) {
      case 'bedtime':
        return 'bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500';
      case 'fairy-tale':
        return 'bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300';
      case 'adventure':
        return 'bg-gradient-to-br from-green-400 via-blue-500 to-purple-600';
      default: // storybook
        return 'bg-gradient-to-br from-blue-400 via-purple-400 to-pink-500';
    }
  };

  const currentContent = content[currentPage];
  const completedPages = content.filter(item => item.is_completed).length;

  return (
    <div className={`min-h-screen ${getThemeBackground()} relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-bounce"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-yellow-200 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-200 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
          {product.title || 'Magical Storybook'}
        </h1>
        <p className="text-white/80 text-lg drop-shadow">
          A story of wonder and adventure
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="relative z-10 px-6 mb-6">
        <ProgressIndicator
          current={completedPages}
          total={content.length}
          variant="dots"
          theme={theme}
          showPercentage={true}
          className="justify-center"
        />
      </div>

      {/* Main Story Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-24">
        <div className="max-w-4xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 50, rotateY: 15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -50, rotateY: -15 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 min-h-[500px] flex flex-col"
            >
              {/* Page Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {currentContent?.title || `Page ${currentPage + 1}`}
                </h2>
                <div className="text-sm text-gray-600">
                  Page {currentPage + 1} of {content.length}
                </div>
              </div>

              {/* Story Content */}
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                {/* Illustration Placeholder */}
                <div className="mb-8 w-64 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="text-6xl">
                    {currentPage % 4 === 0 ? '🏰' :
                     currentPage % 4 === 1 ? '🧚‍♀️' :
                     currentPage % 4 === 2 ? '🐉' : '🌟'}
                  </div>
                </div>

                {/* Story Text */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="max-w-2xl text-lg text-gray-700 leading-relaxed"
                >
                  {currentContent?.content || 'Once upon a time, in a magical land far away...'}
                </motion.div>

                {/* Audio controls placeholder */}
                {currentContent?.media_assets?.voice && (
                  <div className="mt-6 flex items-center space-x-4">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors">
                      🔊 Play Story
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center space-x-4 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePageTurn('prev')}
            disabled={currentPage === 0 || isTransitioning}
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors disabled:cursor-not-allowed"
          >
            ←
          </motion.button>

          {/* Page Thumbnails */}
          <div className="flex space-x-2">
            {content.slice(Math.max(0, currentPage - 2), Math.min(content.length, currentPage + 3)).map((_, index) => {
              const pageIndex = Math.max(0, currentPage - 2) + index;
              const isActive = pageIndex === currentPage;

              return (
                <motion.button
                  key={pageIndex}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => handlePageSelect(pageIndex)}
                  disabled={isTransitioning}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    isActive
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {pageIndex + 1}
                </motion.button>
              );
            })}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePageTurn('next')}
            disabled={currentPage === content.length - 1 || isTransitioning}
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors disabled:cursor-not-allowed"
          >
            →
          </motion.button>
        </div>
      </div>

      {/* Page Turn Animation Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
};