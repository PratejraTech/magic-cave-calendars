import { AnimationConfig } from '../../../themes/definitions';
import { gsap } from 'gsap';

/**
 * Theme Animation System
 * Centralized controller for theme-aware animations and effects
 */

export interface AnimationVariant {
  duration: number;
  ease: string;
  delay?: number;
  repeat?: number;
  yoyo?: boolean;
}

export interface ParticleEffect {
  type: 'snow' | 'stars' | 'hearts' | 'leaves' | 'candy' | 'reindeer';
  count: number;
  colors: string[];
  size: { min: number; max: number };
  speed: { min: number; max: number };
  lifetime: number;
}

export interface BackgroundEffect {
  gradient: string;
  particles: ParticleEffect[];
  overlays: Array<{
    type: 'aurora' | 'horizon' | 'shooting-stars' | 'floating-elements';
    colors: string[];
    animation: AnimationVariant;
  }>;
}

export class ThemeAnimationSystem {
  private static instance: ThemeAnimationSystem;
  private themeCache: Map<string, AnimationConfig> = new Map();
  private backgroundCache: Map<string, BackgroundEffect> = new Map();

  private constructor() {}

  static getInstance(): ThemeAnimationSystem {
    if (!ThemeAnimationSystem.instance) {
      ThemeAnimationSystem.instance = new ThemeAnimationSystem();
    }
    return ThemeAnimationSystem.instance;
  }

  /**
   * Get animation configuration for a theme
   */
  getAnimationConfig(themeId: string): AnimationConfig {
    if (this.themeCache.has(themeId)) {
      return this.themeCache.get(themeId)!;
    }

    const config = this.buildAnimationConfig(themeId);
    this.themeCache.set(themeId, config);
    return config;
  }

  /**
   * Get background effect configuration for a theme
   */
  getBackgroundEffect(themeId: string): BackgroundEffect {
    if (this.backgroundCache.has(themeId)) {
      return this.backgroundCache.get(themeId)!;
    }

    const effect = this.buildBackgroundEffect(themeId);
    this.backgroundCache.set(themeId, effect);
    return effect;
  }

  /**
   * Get hover animation for theme-aware components
   */
  getHoverAnimation(themeId: string): AnimationVariant {
    const baseConfig = this.getAnimationConfig(themeId);

    switch (baseConfig.hover) {
      case 'scale-105':
        return { duration: 0.3, ease: 'power2.out' };
      case 'bounce-gentle':
        return { duration: 0.6, ease: 'bounce.out' };
      case 'jiggle':
        return { duration: 0.4, ease: 'power2.inOut', repeat: 1, yoyo: true };
      case 'leaf-rustle':
        return { duration: 0.8, ease: 'power1.inOut', repeat: 2 };
      case 'star-shine':
        return { duration: 0.5, ease: 'power2.out' };
      default:
        return { duration: 0.3, ease: 'power2.out' };
    }
  }

  /**
   * Get unlock animation sequence for theme
   */
  getUnlockAnimation(themeId: string): AnimationVariant[] {
    const baseConfig = this.getAnimationConfig(themeId);

    switch (baseConfig.unlock) {
      case 'snowfall':
        return [
          { duration: 0.5, ease: 'power2.out' }, // Initial scale
          { duration: 0.3, ease: 'bounce.out', delay: 0.2 }, // Bounce
          { duration: 1.0, ease: 'power1.out', delay: 0.5 }, // Settle
        ];
      case 'warm-glow':
        return [
          { duration: 0.4, ease: 'power2.out' },
          { duration: 0.6, ease: 'power1.inOut', delay: 0.2 },
          { duration: 0.8, ease: 'power2.out', delay: 0.4 },
        ];
      case 'candy-explosion':
        return [
          { duration: 0.3, ease: 'back.out(1.7)' },
          { duration: 0.4, ease: 'power2.out', delay: 0.1 },
          { duration: 0.6, ease: 'bounce.out', delay: 0.3 },
        ];
      case 'forest-reveal':
        return [
          { duration: 0.6, ease: 'power2.out' },
          { duration: 0.5, ease: 'power1.inOut', delay: 0.3 },
          { duration: 0.7, ease: 'power2.out', delay: 0.5 },
        ];
      case 'cosmic-burst':
        return [
          { duration: 0.4, ease: 'power3.out' },
          { duration: 0.5, ease: 'power2.out', delay: 0.2 },
          { duration: 0.8, ease: 'power1.out', delay: 0.4 },
        ];
      default:
        return [{ duration: 0.5, ease: 'power2.out' }];
    }
  }

  /**
   * Get entrance animation for components
   */
  getEntranceAnimation(themeId: string): AnimationVariant {
    const baseConfig = this.getAnimationConfig(themeId);

    switch (baseConfig.entrance) {
      case 'fade-in':
        return { duration: 0.8, ease: 'power2.out' };
      case 'slide-up':
        return { duration: 0.6, ease: 'power2.out' };
      case 'bounce-in':
        return { duration: 0.7, ease: 'bounce.out' };
      case 'grow-from-seed':
        return { duration: 0.8, ease: 'back.out(1.7)' };
      case 'twinkle-in':
        return { duration: 0.6, ease: 'power2.out' };
      default:
        return { duration: 0.6, ease: 'power2.out' };
    }
  }

  /**
   * Apply theme-aware animation to an element
   */
  animateElement(
    element: Element | null,
    animationType: 'hover' | 'unlock' | 'entrance',
    themeId: string,
    options?: { delay?: number; onComplete?: () => void }
  ): gsap.core.Timeline | null {
    if (!element) return null;

    let animation: AnimationVariant;

    switch (animationType) {
      case 'hover':
        animation = this.getHoverAnimation(themeId);
        break;
      case 'entrance':
        animation = this.getEntranceAnimation(themeId);
        break;
      case 'unlock':
        // For unlock, we'll use the first animation in the sequence
        animation = this.getUnlockAnimation(themeId)[0];
        break;
    }

    const timeline = gsap.timeline({
      delay: options?.delay || 0,
      onComplete: options?.onComplete,
    });

    // Apply the animation based on type
    switch (animationType) {
      case 'hover':
        timeline.to(element, {
          scale: 1.05,
          duration: animation.duration,
          ease: animation.ease,
          yoyo: animation.yoyo,
          repeat: animation.repeat,
        });
        break;
      case 'entrance':
        timeline.fromTo(element, {
          opacity: 0,
          scale: 0.8,
        }, {
          opacity: 1,
          scale: 1,
          duration: animation.duration,
          ease: animation.ease,
        });
        break;
      case 'unlock':
        timeline.to(element, {
          scale: 1.1,
          rotation: 5,
          duration: animation.duration,
          ease: animation.ease,
        }).to(element, {
          scale: 1,
          rotation: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
        break;
    }

    return timeline;
  }

  /**
   * Clear animation caches (useful for theme switching)
   */
  clearCache(): void {
    this.themeCache.clear();
    this.backgroundCache.clear();
  }

  private buildAnimationConfig(themeId: string): AnimationConfig {
    // This maps theme IDs to their animation configurations
    // In a real implementation, this would pull from the theme definitions
    const configs: Record<string, AnimationConfig> = {
      snow: {
        entrance: 'fade-in',
        hover: 'scale-105',
        unlock: 'snowfall',
        confetti: 'snow',
      },
      warm: {
        entrance: 'slide-up',
        hover: 'bounce-gentle',
        unlock: 'warm-glow',
        confetti: 'stars',
      },
      candy: {
        entrance: 'bounce-in',
        hover: 'jiggle',
        unlock: 'candy-explosion',
        confetti: 'candy',
      },
      forest: {
        entrance: 'grow-from-seed',
        hover: 'leaf-rustle',
        unlock: 'forest-reveal',
        confetti: 'reindeer',
      },
      starlight: {
        entrance: 'twinkle-in',
        hover: 'star-shine',
        unlock: 'cosmic-burst',
        confetti: 'stars',
      },
    };

    return configs[themeId] || configs.snow;
  }

  private buildBackgroundEffect(themeId: string): BackgroundEffect {
    const effects: Record<string, BackgroundEffect> = {
      snow: {
        gradient: 'bg-gradient-to-br from-blue-300 via-cyan-300 to-indigo-400',
        particles: [{
          type: 'snow',
          count: 50,
          colors: ['#FFFFFF', '#E0F6FF', '#B8D4E3'],
          size: { min: 2, max: 6 },
          speed: { min: 1, max: 3 },
          lifetime: 8000,
        }],
        overlays: [{
          type: 'aurora',
          colors: ['rgba(0,255,255,0.4)', 'rgba(255,0,184,0.4)', 'rgba(110,0,255,0.35)'],
          animation: { duration: 10, ease: 'easeInOut', repeat: -1 },
        }],
      },
      warm: {
        gradient: 'bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-300',
        particles: [{
          type: 'stars',
          count: 30,
          colors: ['#FFD700', '#FFA500', '#FFFF00', '#FFF8DC'],
          size: { min: 1, max: 4 },
          speed: { min: 0.5, max: 2 },
          lifetime: 6000,
        }],
        overlays: [{
          type: 'horizon',
          colors: ['rgba(255,255,255,0)', 'rgba(255,0,179,0.35)', 'rgba(255,128,0,0.5)'],
          animation: { duration: 6, ease: 'easeInOut', repeat: -1 },
        }],
      },
      candy: {
        gradient: 'bg-gradient-to-br from-pink-400 via-red-400 to-yellow-400',
        particles: [{
          type: 'candy',
          count: 40,
          colors: ['#FF69B4', '#00FF7F', '#87CEEB', '#FF1493'],
          size: { min: 3, max: 8 },
          speed: { min: 1.5, max: 4 },
          lifetime: 5000,
        }],
        overlays: [{
          type: 'floating-elements',
          colors: ['rgba(255,99,233,0.9)', 'rgba(0,255,255,0.9)'],
          animation: { duration: 8, ease: 'easeInOut', repeat: -1 },
        }],
      },
      forest: {
        gradient: 'bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500',
        particles: [{
          type: 'leaves',
          count: 35,
          colors: ['#059669', '#10b981', '#34d399'],
          size: { min: 4, max: 10 },
          speed: { min: 0.8, max: 2.5 },
          lifetime: 7000,
        }],
        overlays: [{
          type: 'aurora',
          colors: ['rgba(5,150,105,0.3)', 'rgba(16,185,129,0.4)', 'rgba(52,211,153,0.35)'],
          animation: { duration: 12, ease: 'easeInOut', repeat: -1 },
        }],
      },
      starlight: {
        gradient: 'bg-gradient-to-br from-purple-300 via-pink-300 to-indigo-400',
        particles: [{
          type: 'stars',
          count: 45,
          colors: ['#7c3aed', '#8b5cf6', '#a78bfa'],
          size: { min: 1, max: 5 },
          speed: { min: 0.5, max: 1.5 },
          lifetime: 9000,
        }],
        overlays: [{
          type: 'shooting-stars',
          colors: ['rgba(0,255,255,1)', 'rgba(255,0,255,0.6)', 'transparent'],
          animation: { duration: 4, ease: 'easeOut', repeat: -1, delay: 2 },
        }],
      },
    };

    return effects[themeId] || effects.snow;
  }
}