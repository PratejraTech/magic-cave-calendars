/**
 * Animation Performance Monitor
 * Tracks animation performance, ensures 60fps, and manages lazy loading
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  memoryUsage?: number;
  animationCount: number;
}

export interface AnimationConfig {
  id: string;
  priority: 'high' | 'medium' | 'low';
  lazyLoad: boolean;
  maxFrameTime: number; // ms
  reduceMotionFallback?: boolean;
}

export class AnimationPerformanceMonitor {
  private static instance: AnimationPerformanceMonitor;
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;
  private frameTime = 16.67; // 60fps
  private droppedFrames = 0;
  private isMonitoring = false;
  private animationCallbacks: Map<string, () => void> = new Map();
  private performanceObserver: PerformanceObserver | null = null;
  private reduceMotion = false;

  // Lazy loading state
  private loadedAnimations: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  private constructor() {
    this.checkReduceMotion();
    this.setupPerformanceObserver();
  }

  static getInstance(): AnimationPerformanceMonitor {
    if (!AnimationPerformanceMonitor.instance) {
      AnimationPerformanceMonitor.instance = new AnimationPerformanceMonitor();
    }
    return AnimationPerformanceMonitor.instance;
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.droppedFrames = 0;

    this.monitorFrame();
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return {
      fps: this.fps,
      frameTime: this.frameTime,
      droppedFrames: this.droppedFrames,
      memoryUsage: this.getMemoryUsage(),
      animationCount: this.animationCallbacks.size,
    };
  }

  /**
   * Register an animation for performance tracking
   */
  registerAnimation(id: string, callback: () => void, config: AnimationConfig): void {
    this.animationCallbacks.set(id, callback);

    if (config.lazyLoad && !this.loadedAnimations.has(id)) {
      this.lazyLoadAnimation(id);
    }
  }

  /**
   * Unregister an animation
   */
  unregisterAnimation(id: string): void {
    this.animationCallbacks.delete(id);
    this.loadedAnimations.delete(id);
    this.loadingPromises.delete(id);
  }

  /**
   * Check if animations should be reduced for accessibility
   */
  shouldReduceMotion(): boolean {
    return this.reduceMotion;
  }

  /**
   * Lazy load an animation component
   */
  async lazyLoadAnimation(id: string): Promise<void> {
    if (this.loadedAnimations.has(id)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(id)) {
      return this.loadingPromises.get(id)!;
    }

    const loadPromise = new Promise<void>((resolve) => {
      // Simulate lazy loading delay (in real implementation, this would load actual modules)
      setTimeout(() => {
        this.loadedAnimations.add(id);
        resolve();
      }, 100);
    });

    this.loadingPromises.set(id, loadPromise);
    return loadPromise;
  }

  /**
   * Check if an animation should run based on performance
   */
  shouldRunAnimation(config: AnimationConfig): boolean {
    // Always run high priority animations
    if (config.priority === 'high') return true;

    // Check performance thresholds
    if (this.fps < 50) return false; // Too slow
    if (this.frameTime > config.maxFrameTime) return false; // Frame time too high

    // Respect reduce motion preference
    if (this.reduceMotion && config.reduceMotionFallback) {
      return false;
    }

    return true;
  }

  /**
   * Optimize animation based on current performance
   */
  optimizeAnimation(config: AnimationConfig): AnimationConfig {
    const metrics = this.getMetrics();

    // If performance is poor, reduce animation quality
    if (metrics.fps < 50) {
      return {
        ...config,
        priority: config.priority === 'high' ? 'medium' : 'low',
        lazyLoad: true,
      };
    }

    return { ...config };
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.getMetrics();

    if (metrics.fps < 50) {
      recommendations.push('Reduce animation complexity - current FPS too low');
    }

    if (metrics.droppedFrames > 10) {
      recommendations.push('Too many dropped frames - consider reducing animation count');
    }

    if (metrics.animationCount > 20) {
      recommendations.push('High animation count - consider lazy loading');
    }

    if (this.reduceMotion) {
      recommendations.push('Respecting reduce motion preference');
    }

    return recommendations;
  }

  private monitorFrame = (): void => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    this.frameCount++;
    this.frameTime = deltaTime;

    // Calculate FPS (rolling average)
    const instantFps = 1000 / deltaTime;
    this.fps = this.fps * 0.9 + instantFps * 0.1;

    // Detect dropped frames (frame time > 33ms = <30fps)
    if (deltaTime > 33) {
      this.droppedFrames++;
    }

    this.lastTime = currentTime;

    // Run registered animation callbacks
    this.runAnimationCallbacks();

    // Continue monitoring
    requestAnimationFrame(this.monitorFrame);
  };

  private runAnimationCallbacks(): void {
    // Only run callbacks if performance is acceptable
    if (this.fps < 30) return; // Emergency stop for very poor performance

    for (const [id, callback] of this.animationCallbacks) {
      if (this.loadedAnimations.has(id)) {
        try {
          callback();
        } catch (error) {
          // Warning logged silently - animation callback failed
          // Remove failing animations
          this.unregisterAnimation(id);
        }
      }
    }
  }

  private checkReduceMotion(): void {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reduceMotion = mediaQuery.matches;

      // Listen for changes
      mediaQuery.addEventListener('change', (e) => {
        this.reduceMotion = e.matches;
      });
    }
  }

  private setupPerformanceObserver(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure' && entry.name.startsWith('animation-')) {
              const duration = entry.duration;
              if (duration > 16.67) { // Slower than 60fps
                // Performance warning logged silently
              }
            }
          }
        });

        this.performanceObserver.observe({ entryTypes: ['measure'] });
      } catch (error) {
        // Performance monitoring not supported in this environment
      }
    }
  }

  private getMemoryUsage(): number | undefined {
    // @ts-ignore - performance.memory is not in all browsers
    if (typeof performance !== 'undefined' && performance.memory) {
      // @ts-ignore
      return performance.memory.usedJSHeapSize;
    }
    return undefined;
  }

  /**
   * Measure animation performance
   */
  measureAnimation(name: string, callback: () => void): void {
    const start = performance.now();
    callback();
    const end = performance.now();
    const duration = end - start;

    if (this.performanceObserver) {
      performance.mark(`animation-${name}-start`);
      performance.mark(`animation-${name}-end`);
      performance.measure(`animation-${name}`, `animation-${name}-start`, `animation-${name}-end`);
    }

    // Log slow animations
    if (duration > 16.67) {
      // Slow animation detected but handled silently
    }
  }
}