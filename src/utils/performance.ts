/**
 * Performance Utilities
 * Centralized performance optimization helpers
 */

import type { MemoryInfo, BatteryManager } from '@/types';

// RAF-based animation scheduler for centralized animation management
class AnimationScheduler {
  private tasks = new Set<() => boolean | void>();
  private isRunning = false;
  private animationId: number | null = null;

  public add(task: () => boolean | void): () => void {
    this.tasks.add(task);
    if (!this.isRunning) {
      this.start();
    }

    // Return cleanup function
    return () => this.remove(task);
  }

  public remove(task: () => boolean | void): void {
    this.tasks.delete(task);
    if (this.tasks.size === 0) {
      this.stop();
    }
  }

  private start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick();
  }

  private stop(): void {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return;

    // Execute all animation tasks
    for (const task of this.tasks) {
      try {
        const shouldContinue = task();
        if (shouldContinue === false) {
          this.tasks.delete(task);
        }
      } catch (error) {
        this.tasks.delete(task);
      }
    }

    if (this.tasks.size > 0) {
      this.animationId = requestAnimationFrame(this.tick);
    } else {
      this.isRunning = false;
      this.animationId = null;
    }
  };

  public destroy(): void {
    this.tasks.clear();
    this.stop();
  }

  public getActiveTaskCount(): number {
    return this.tasks.size;
  }
}

// Global animation scheduler instance
export const animationScheduler = new AnimationScheduler();

/**
 * Throttle function for performance-critical event handlers
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number = 16
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Debounce function for resize events and user input
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number = 250
): (...args: Parameters<T>) => void {
  let timeout: number | NodeJS.Timeout;
  return function (this: unknown, ...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * RAF-based animation loop with automatic cleanup
 */
export function animate(callback: () => boolean | void): () => void {
  return animationScheduler.add(callback);
}

/**
 * Intersection Observer with performance optimizations
 */
export function observeIntersection(
  elements: Element[],
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): () => void {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  const observer = new IntersectionObserver((entries) => {
    // Use RAF to batch DOM updates
    requestAnimationFrame(() => {
      entries.forEach(callback);
    });
  }, defaultOptions);

  elements.forEach((el) => observer.observe(el));

  return () => {
    observer.disconnect();
  };
}

/**
 * Performance measurement utilities
 */
export const performance = {
  /**
   * Measure function execution time
   */
  measure<T>(name: string, fn: () => T): T {
    const result = fn();
    return result;
  },

  /**
   * Measure async function execution time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const result = await fn();
    return result;
  },

  /**
   * Memory usage monitoring
   */
  getMemoryInfo(): MemoryInfo | null {
    if (
      'memory' in performance &&
      (performance as Performance & { memory: MemoryInfo }).memory
    ) {
      return (performance as Performance & { memory: MemoryInfo }).memory;
    }
    return null;
  },

  /**
   * Check if device is low-power mode
   */
  async isLowPowerMode(): Promise<boolean> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (
          navigator as Navigator & { getBattery: () => Promise<BatteryManager> }
        ).getBattery();
        return battery.level < 0.2 && !battery.charging;
      }
    } catch {
      // Battery API not available
    }
    return false;
  },

  /**
   * Check for reduced motion preference
   */
  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Check if device appears to be mobile
   */
  isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  /**
   * Get device pixel ratio for high-DPI displays
   */
  getDevicePixelRatio(): number {
    return window.devicePixelRatio || 1;
  },
};

/**
 * Resource loading utilities
 */
export const resourceLoader = {
  /**
   * Preload an image with promise-based API
   */
  preloadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  },

  /**
   * Preload multiple images
   */
  preloadImages(sources: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(sources.map((src) => this.preloadImage(src)));
  },

  /**
   * Load script dynamically
   */
  loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = () => resolve();
      script.onerror = reject;
      script.src = src;
      document.head.appendChild(script);
    });
  },

  /**
   * Load CSS dynamically
   */
  loadCSS(href: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.onload = () => resolve();
      link.onerror = reject;
      link.href = href;
      document.head.appendChild(link);
    });
  },
};

/**
 * Cache utilities for performance
 */
export class SimpleCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private maxAge: number;

  constructor(maxAge: number = 5 * 60 * 1000) {
    // 5 minutes default
    this.maxAge = maxAge;
  }

  public set(key: string, value: T): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  public get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  public has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

/**
 * Cleanup utilities for memory management
 */
export class CleanupManager {
  private cleanupTasks = new Set<() => void>();

  public add(cleanup: () => void): void {
    this.cleanupTasks.add(cleanup);
  }

  public remove(cleanup: () => void): void {
    this.cleanupTasks.delete(cleanup);
  }

  public cleanup(): void {
    this.cleanupTasks.forEach((task) => {
      try {
        task();
      } catch (error) {
        // Fail silently
      }
    });
    this.cleanupTasks.clear();
  }

  public size(): number {
    return this.cleanupTasks.size;
  }
}

// Global cleanup manager for page-level cleanup
export const globalCleanupManager = new CleanupManager();

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    globalCleanupManager.cleanup();
    animationScheduler.destroy();
  });
}
