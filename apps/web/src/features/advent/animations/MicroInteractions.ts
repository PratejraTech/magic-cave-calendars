import { gsap } from 'gsap';
import { ThemeAnimationSystem } from './ThemeAnimationSystem';
import { AnimationPerformanceMonitor } from './AnimationPerformanceMonitor';

/**
 * Micro-interactions utility for theme-aware hover effects and transitions
 */

export interface MicroInteractionConfig {
  type: 'hover' | 'tap' | 'focus' | 'enter' | 'exit';
  themeId: string;
  element: Element | null;
  options?: {
    scale?: number;
    rotation?: number;
    duration?: number;
    ease?: string;
    delay?: number;
  };
}

interface MicroAnimationConfig {
  themeId: string;
  [key: string]: unknown;
}

interface MicroAnimationOptions {
  scale?: number;
  rotation?: number;
  duration?: number;
  ease?: string;
  delay?: number;
  [key: string]: unknown;
}

export class MicroInteractions {
  private static instance: MicroInteractions;
  private animationSystem = ThemeAnimationSystem.getInstance();
  private performanceMonitor = AnimationPerformanceMonitor.getInstance();
  private activeAnimations = new Map<string, gsap.core.Timeline>();

  private constructor() {}

  static getInstance(): MicroInteractions {
    if (!MicroInteractions.instance) {
      MicroInteractions.instance = new MicroInteractions();
    }
    return MicroInteractions.instance;
  }

  /**
   * Apply a theme-aware hover effect
   */
  hover(config: Omit<MicroInteractionConfig, 'type'>): void {
    this.applyInteraction({ ...config, type: 'hover' });
  }

  /**
   * Apply a theme-aware tap/click effect
   */
  tap(config: Omit<MicroInteractionConfig, 'type'>): void {
    this.applyInteraction({ ...config, type: 'tap' });
  }

  /**
   * Apply a theme-aware focus effect
   */
  focus(config: Omit<MicroInteractionConfig, 'type'>): void {
    this.applyInteraction({ ...config, type: 'focus' });
  }

  /**
   * Apply entrance animation
   */
  enter(config: Omit<MicroInteractionConfig, 'type'>): void {
    this.applyInteraction({ ...config, type: 'enter' });
  }

  /**
   * Apply exit animation
   */
  exit(config: Omit<MicroInteractionConfig, 'type'>): void {
    this.applyInteraction({ ...config, type: 'exit' });
  }

  /**
   * Create a bouncy hover effect for interactive elements
   */
  bouncyHover(element: Element | null): () => void {
    if (!element || this.performanceMonitor.shouldReduceMotion()) {
      return () => {}; // No-op for reduced motion
    }

    const hoverIn = () => {
      gsap.to(element, {
        scale: 1.05,
        y: -2,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const hoverOut = () => {
      gsap.to(element, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    element.addEventListener('mouseenter', hoverIn);
    element.addEventListener('mouseleave', hoverOut);

    // Return cleanup function
    return () => {
      element.removeEventListener('mouseenter', hoverIn);
      element.removeEventListener('mouseleave', hoverOut);
    };
  }

  /**
   * Create a sparkle effect on hover
   */
  sparkleOnHover(element: Element | null): () => void {
    if (!element || this.performanceMonitor.shouldReduceMotion()) {
      return () => {};
    }

    let sparkleInterval: number | null = null;

    const startSparkle = () => {
      if (sparkleInterval) return;

      sparkleInterval = window.setInterval(() => {
        // Create a small sparkle element
        const sparkle = document.createElement('div');
        sparkle.textContent = '✨';
        sparkle.style.position = 'absolute';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.fontSize = '12px';
        sparkle.style.zIndex = '10';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';

        element.appendChild(sparkle);

        gsap.fromTo(sparkle,
          { opacity: 0, scale: 0 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
            onComplete: () => {
              gsap.to(sparkle, {
                opacity: 0,
                scale: 0,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => sparkle.remove(),
              });
            }
          }
        );
      }, 200);
    };

    const stopSparkle = () => {
      if (sparkleInterval) {
        clearInterval(sparkleInterval);
        sparkleInterval = null;
      }
    };

    element.addEventListener('mouseenter', startSparkle);
    element.addEventListener('mouseleave', stopSparkle);

    return () => {
      element.removeEventListener('mouseenter', startSparkle);
      element.removeEventListener('mouseleave', stopSparkle);
      stopSparkle();
    };
  }

  /**
   * Create a gentle pulse animation
   */
  pulse(element: Element | null, config?: { duration?: number; scale?: number }): () => void {
    if (!element || this.performanceMonitor.shouldReduceMotion()) {
      return () => {};
    }

    const duration = config?.duration || 2;
    const scale = config?.scale || 1.02;

    const animationId = `pulse-${element.id || Math.random()}`;

    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(element, {
      scale,
      duration: duration / 2,
      ease: 'power1.inOut',
    });

    this.activeAnimations.set(animationId, tl);

    return () => {
      const anim = this.activeAnimations.get(animationId);
      if (anim) {
        anim.kill();
        this.activeAnimations.delete(animationId);
      }
    };
  }

  /**
   * Create a wiggle animation for playful interactions
   */
  wiggle(element: Element | null): void {
    if (!element || this.performanceMonitor.shouldReduceMotion()) return;

    gsap.to(element, {
      rotation: 5,
      duration: 0.1,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        gsap.to(element, { rotation: 0, duration: 0.2, ease: 'power2.out' });
      }
    });
  }

  /**
   * Create a magical glow effect
   */
  magicalGlow(element: Element | null): () => void {
    if (!element || this.performanceMonitor.shouldReduceMotion()) {
      return () => {};
    }

    const glowColor = 'rgba(255,215,0,0.6)'; // Default golden glow
    const animationId = `glow-${element.id || Math.random()}`;

    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(element, {
      boxShadow: `0 0 20px ${glowColor}`,
      duration: 1.5,
      ease: 'power1.inOut',
    });

    this.activeAnimations.set(animationId, tl);

    return () => {
      const anim = this.activeAnimations.get(animationId);
      if (anim) {
        anim.kill();
        gsap.to(element, { boxShadow: 'none', duration: 0.3 });
        this.activeAnimations.delete(animationId);
      }
    };
  }

  /**
   * Apply staggered entrance animation to multiple elements
   */
  staggeredEntrance(elements: (Element | null)[], staggerDelay = 0.1): void {
    if (this.performanceMonitor.shouldReduceMotion()) return;

    elements.forEach((element, index) => {
      if (!element) return;

      gsap.fromTo(element,
        {
          opacity: 0,
          y: 20,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: index * staggerDelay,
          ease: 'power2.out',
        }
      );
    });
  }

  /**
   * Clear all active animations
   */
  clearAllAnimations(): void {
    this.activeAnimations.forEach((anim) => anim.kill());
    this.activeAnimations.clear();
  }

  private applyInteraction(config: MicroInteractionConfig): void {
    const { type, themeId, element, options = {} } = config;

    if (!element || this.performanceMonitor.shouldReduceMotion()) return;

    const animationConfig = this.animationSystem.getAnimationConfig(themeId);
    const performanceConfig = this.performanceMonitor.optimizeAnimation({
      id: `micro-${type}-${Math.random()}`,
      priority: 'low',
      lazyLoad: false,
      maxFrameTime: 16.67,
    });

    if (!this.performanceMonitor.shouldRunAnimation(performanceConfig)) return;

    switch (type) {
      case 'hover':
        this.applyHoverEffect(element, animationConfig as unknown as MicroAnimationConfig, options);
        break;
      case 'tap':
        this.applyTapEffect(element, animationConfig as unknown as MicroAnimationConfig, options);
        break;
      case 'focus':
        this.applyFocusEffect(element, animationConfig as unknown as MicroAnimationConfig, options);
        break;
      case 'enter':
        this.applyEnterEffect(element, animationConfig as unknown as MicroAnimationConfig, options);
        break;
      case 'exit':
        this.applyExitEffect(element, animationConfig as unknown as MicroAnimationConfig, options);
        break;
    }
  }

  private applyHoverEffect(element: Element, _config: MicroAnimationConfig, options: MicroAnimationOptions): void {
    const hoverIn = () => {
      gsap.to(element, {
        scale: options.scale || 1.05,
        duration: options.duration || 0.3,
        ease: options.ease || 'power2.out',
        delay: options.delay || 0,
      });
    };

    const hoverOut = () => {
      gsap.to(element, {
        scale: 1,
        duration: options.duration || 0.3,
        ease: options.ease || 'power2.out',
      });
    };

    element.addEventListener('mouseenter', hoverIn);
    element.addEventListener('mouseleave', hoverOut);

    // Store cleanup function
    (element as any)._microCleanup = () => {
      element.removeEventListener('mouseenter', hoverIn);
      element.removeEventListener('mouseleave', hoverOut);
    };
  }

  private applyTapEffect(element: Element, _config: MicroAnimationConfig, options: MicroAnimationOptions): void {
    const tapHandler = () => {
      gsap.to(element, {
        scale: options.scale || 0.95,
        duration: options.duration || 0.1,
        ease: options.ease || 'power2.inOut',
        yoyo: true,
        repeat: 1,
      });
    };

    element.addEventListener('click', tapHandler);

    (element as any)._microCleanup = () => {
      element.removeEventListener('click', tapHandler);
    };
  }

  private applyFocusEffect(element: Element, _config: MicroAnimationConfig, options: MicroAnimationOptions): void {
    const focusIn = () => {
      gsap.to(element, {
        scale: options.scale || 1.02,
        duration: options.duration || 0.2,
        ease: options.ease || 'power2.out',
      });
    };

    const focusOut = () => {
      gsap.to(element, {
        scale: 1,
        duration: options.duration || 0.2,
        ease: options.ease || 'power2.out',
      });
    };

    element.addEventListener('focus', focusIn);
    element.addEventListener('blur', focusOut);

    (element as any)._microCleanup = () => {
      element.removeEventListener('focus', focusIn);
      element.removeEventListener('blur', focusOut);
    };
  }

  private applyEnterEffect(element: Element, _config: MicroAnimationConfig, options: MicroAnimationOptions): void {
    gsap.fromTo(element,
      {
        opacity: 0,
        scale: 0.8,
        y: 20,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: options.duration || 0.6,
        ease: options.ease || 'power2.out',
        delay: options.delay || 0,
      }
    );
  }

  private applyExitEffect(element: Element, _config: MicroAnimationConfig, options: MicroAnimationOptions): void {
    gsap.to(element, {
      opacity: 0,
      scale: 0.8,
      y: -20,
      duration: options.duration || 0.4,
      ease: options.ease || 'power2.in',
      delay: options.delay || 0,
    });
  }
}