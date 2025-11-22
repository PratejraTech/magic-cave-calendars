/**
 * Theme Provider Component
 * Provides theme context throughout the application
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeTemplate, getThemeById, resolveThemeInheritance, BASE_THEMES } from './definitions';

interface ThemeContextType {
  currentTheme: ThemeTemplate | null;
  setTheme: (themeId: string) => void;
  availableThemes: ThemeTemplate[];
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultThemeId?: string;
}

export function ThemeProvider({ children, defaultThemeId = 'snow' }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load available themes
  const availableThemes = Object.values(BASE_THEMES);

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        setIsLoading(true);
        const theme = resolveThemeInheritance(defaultThemeId);
        setCurrentTheme(theme);
       } catch (error) {
         // Log error for debugging but fallback to default theme
         // Fallback to snow theme
        const fallbackTheme = getThemeById('snow');
        if (fallbackTheme) {
          setCurrentTheme(fallbackTheme);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, [defaultThemeId]);

  const setTheme = (themeId: string) => {
    try {
      const theme = resolveThemeInheritance(themeId);
      setCurrentTheme(theme);

      // Store theme preference (could be localStorage or user preferences)
      localStorage.setItem('advent-calendar-theme', themeId);
     } catch (error) {
         // Log error for debugging but don't break theme change
     }
  };

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for getting current theme with type safety
export function useCurrentTheme(): ThemeTemplate | null {
  const { currentTheme } = useTheme();
  return currentTheme;
}

// Hook for theme utilities
export function useThemeUtils() {
  const { currentTheme, setTheme } = useTheme();

  const getThemeClass = (baseClass: string, themeOverride?: string): string => {
    if (!currentTheme) return baseClass;

    // Apply theme-specific overrides
    const themeClass = themeOverride || currentTheme.colors.background;
    return `${baseClass} ${themeClass}`;
  };

  const getThemeColor = (colorKey: keyof ThemeTemplate['colors']): string => {
    return currentTheme?.colors[colorKey] || '#3b82f6';
  };

  const getAnimationClass = (animationKey: keyof ThemeTemplate['animations']): string => {
    return currentTheme?.animations[animationKey] || 'fade-in';
  };

  return {
    getThemeClass,
    getThemeColor,
    getAnimationClass,
    setTheme,
  };
}