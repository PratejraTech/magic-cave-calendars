/**
 * Theme Template System
 * Defines reusable theme templates with inheritance and customization
 */

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

export interface AnimationConfig {
  entrance: string;
  hover: string;
  unlock: string;
  confetti: 'snow' | 'stars' | 'candy' | 'reindeer';
}

export interface SoundConfig {
  unlock: string;
  background?: string;
  entrance?: string;
}

export interface ComponentOverrides {
  button?: {
    borderRadius?: string;
    shadow?: string;
  };
  modal?: {
    backdrop?: string;
    borderRadius?: string;
  };
  calendar?: {
    gridGap?: string;
    daySize?: string;
  };
}

export interface ThemeTemplate {
  id: string;
  name: string;
  description: string;
  colors: ColorPalette;
  animations: AnimationConfig;
  sounds: SoundConfig;
  components: ComponentOverrides;
  inheritance?: string[]; // IDs of parent themes to inherit from
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Base theme templates
export const BASE_THEMES: Record<string, ThemeTemplate> = {
  snow: {
    id: 'snow',
    name: 'Winter Snow',
    description: 'Classic winter theme with snow and ice effects',
    colors: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      accent: '#93c5fd',
      background: 'bg-gradient-to-br from-blue-300 via-cyan-300 to-indigo-400',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
    },
    animations: {
      entrance: 'fade-in',
      hover: 'scale-105',
      unlock: 'snowfall',
      confetti: 'snow',
    },
    sounds: {
      unlock: '/assets/audio/snow-unlock.mp3',
      background: '/assets/audio/winter-wind.mp3',
    },
    components: {
      button: {
        borderRadius: 'rounded-full',
        shadow: 'shadow-lg shadow-blue-400/30',
      },
      modal: {
        backdrop: 'backdrop-blur-sm bg-white/10',
        borderRadius: 'rounded-2xl',
      },
    },
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  warm: {
    id: 'warm',
    name: 'Cozy Warmth',
    description: 'Warm autumn colors with gentle animations',
    colors: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
      accent: '#fcd34d',
      background: 'bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-300',
      surface: '#ffffff',
      text: '#92400e',
      textSecondary: '#a16207',
    },
    animations: {
      entrance: 'slide-up',
      hover: 'bounce-gentle',
      unlock: 'warm-glow',
      confetti: 'stars',
    },
    sounds: {
      unlock: '/assets/audio/warm-chime.mp3',
      background: '/assets/audio/cozy-fire.mp3',
    },
    components: {
      button: {
        borderRadius: 'rounded-lg',
        shadow: 'shadow-lg shadow-amber-400/30',
      },
      modal: {
        backdrop: 'backdrop-blur-sm bg-amber-100/20',
        borderRadius: 'rounded-xl',
      },
    },
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  candy: {
    id: 'candy',
    name: 'Sweet Candy',
    description: 'Bright and playful candy-themed experience',
    colors: {
      primary: '#ec4899',
      secondary: '#f472b6',
      accent: '#fb7185',
      background: 'bg-gradient-to-br from-pink-400 via-red-400 to-yellow-400',
      surface: '#ffffff',
      text: '#be185d',
      textSecondary: '#db2777',
    },
    animations: {
      entrance: 'bounce-in',
      hover: 'jiggle',
      unlock: 'candy-explosion',
      confetti: 'candy',
    },
    sounds: {
      unlock: '/assets/audio/candy-pop.mp3',
      background: '/assets/audio/playful-tune.mp3',
    },
    components: {
      button: {
        borderRadius: 'rounded-full',
        shadow: 'shadow-lg shadow-pink-400/40',
      },
      modal: {
        backdrop: 'backdrop-blur-sm bg-pink-100/30',
        borderRadius: 'rounded-3xl',
      },
    },
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  forest: {
    id: 'forest',
    name: 'Enchanted Forest',
    description: 'Mystical forest with natural greens and magical effects',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#34d399',
      background: 'bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500',
      surface: '#ffffff',
      text: '#064e3b',
      textSecondary: '#065f46',
    },
    animations: {
      entrance: 'grow-from-seed',
      hover: 'leaf-rustle',
      unlock: 'forest-reveal',
      confetti: 'reindeer',
    },
    sounds: {
      unlock: '/assets/audio/forest-magic.mp3',
      background: '/assets/audio/nature-sounds.mp3',
    },
    components: {
      button: {
        borderRadius: 'rounded-xl',
        shadow: 'shadow-lg shadow-green-400/30',
      },
      modal: {
        backdrop: 'backdrop-blur-sm bg-green-100/20',
        borderRadius: 'rounded-2xl',
      },
    },
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  starlight: {
    id: 'starlight',
    name: 'Magical Starlight',
    description: 'Starry night sky with cosmic wonder',
    colors: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
      background: 'bg-gradient-to-br from-purple-300 via-pink-300 to-indigo-400',
      surface: '#ffffff',
      text: '#581c87',
      textSecondary: '#7c2d92',
    },
    animations: {
      entrance: 'twinkle-in',
      hover: 'star-shine',
      unlock: 'cosmic-burst',
      confetti: 'stars',
    },
    sounds: {
      unlock: '/assets/audio/star-magic.mp3',
      background: '/assets/audio/night-sky.mp3',
    },
    components: {
      button: {
        borderRadius: 'rounded-full',
        shadow: 'shadow-lg shadow-purple-400/40',
      },
      modal: {
        backdrop: 'backdrop-blur-sm bg-purple-100/30',
        borderRadius: 'rounded-3xl',
      },
    },
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

// Theme inheritance resolver
export function resolveThemeInheritance(themeId: string): ThemeTemplate {
  const baseTheme = BASE_THEMES[themeId];
  if (!baseTheme) {
    throw new Error(`Theme '${themeId}' not found`);
  }

  // For now, return base theme. In future, implement inheritance logic
  return baseTheme;
}

// Get all available themes
export function getAvailableThemes(): ThemeTemplate[] {
  return Object.values(BASE_THEMES);
}

// Get theme by ID
export function getThemeById(themeId: string): ThemeTemplate | null {
  return BASE_THEMES[themeId] || null;
}