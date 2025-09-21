/**
 * Device Detection and Mobile Utilities
 * Centralized device capability detection and mobile optimization
 */

import type { NetworkInformation, BatteryManager, MemoryInfo } from '@/types';

/**
 * Device detection utilities
 */
export const device = {
  /**
   * Comprehensive mobile device detection
   */
  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  /**
   * Specific device type detection
   */
  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  isAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  },

  isTablet(): boolean {
    return /iPad|Android(?!.*Mobile)/.test(navigator.userAgent);
  },

  /**
   * Touch capability detection
   */
  hasTouch(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Screen and display information
   */
  getScreenInfo() {
    return {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      pixelRatio: window.devicePixelRatio || 1,
      orientation: screen.orientation?.angle || 0,
    };
  },

  /**
   * Viewport dimensions
   */
  getViewportInfo() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    };
  },

  /**
   * Network information (if available)
   */
  getNetworkInfo(): NetworkInformation | null {
    const nav = navigator as Navigator & {
      connection?: NetworkInformation;
      mozConnection?: NetworkInformation;
    };
    return nav.connection || nav.mozConnection || null;
  },

  /**
   * Check if device has slow connection
   */
  isSlowConnection(): boolean {
    const connection = this.getNetworkInfo();
    if (!connection) return false;

    return (
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g' ||
      connection.saveData === true
    );
  },
};

/**
 * Battery API utilities
 */
export const battery = {
  /**
   * Get battery information
   */
  async getBatteryInfo(): Promise<BatteryManager | null> {
    try {
      if ('getBattery' in navigator) {
        return await navigator.getBattery();
      }
    } catch (error) {
      // Fail silently
    }
    return null;
  },

  /**
   * Check if device is in low power mode
   */
  async isLowPower(): Promise<boolean> {
    const batteryInfo = await this.getBatteryInfo();
    return batteryInfo
      ? batteryInfo.level < 0.2 && !batteryInfo.charging
      : false;
  },

  /**
   * Set up battery level monitoring
   */
  async setupBatteryMonitoring(callbacks: {
    onLevelChange?: (level: number) => void;
    onChargingChange?: (charging: boolean) => void;
    onLowBattery?: () => void;
  }): Promise<(() => void) | null> {
    const batteryInfo = await this.getBatteryInfo();
    if (!batteryInfo) return null;

    const handleLevelChange = () => {
      const level = batteryInfo.level;
      callbacks.onLevelChange?.(level);

      if (level < 0.15 && !batteryInfo.charging) {
        callbacks.onLowBattery?.();
      }
    };

    const handleChargingChange = () => {
      callbacks.onChargingChange?.(batteryInfo.charging);
    };

    batteryInfo.addEventListener('levelchange', handleLevelChange);
    batteryInfo.addEventListener('chargingchange', handleChargingChange);

    // Return cleanup function
    return () => {
      batteryInfo.removeEventListener('levelchange', handleLevelChange);
      batteryInfo.removeEventListener('chargingchange', handleChargingChange);
    };
  },
};

/**
 * Performance and capability detection
 */
export const capabilities = {
  /**
   * Check for reduced motion preference
   */
  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Check for high contrast preference
   */
  prefersHighContrast(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  /**
   * Check for dark mode preference
   */
  prefersDarkMode(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  /**
   * Check device memory (if available)
   */
  getDeviceMemory(): number {
    return navigator.deviceMemory || 4; // Default to 4GB
  },

  /**
   * Check hardware concurrency
   */
  getCPUCores(): number {
    return navigator.hardwareConcurrency || 2; // Default to 2 cores
  },

  /**
   * Estimate device performance tier
   */
  getPerformanceTier(): 'low' | 'medium' | 'high' {
    const memory = this.getDeviceMemory();
    const cores = this.getCPUCores();
    const isMobile = device.isMobile();

    // Much less aggressive performance detection - prioritize user experience
    if (memory <= 1 || cores <= 1) {
      return 'low';
    } else if (memory <= 2 || cores <= 2 || isMobile) {
      return 'medium';
    } else {
      return 'high';
    }
  },

  /**
   * Check if WebGL is available
   */
  hasWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      );
    } catch {
      return false;
    }
  },

  /**
   * Check if Web Workers are available
   */
  hasWebWorkers(): boolean {
    return typeof Worker !== 'undefined';
  },

  /**
   * Check if service workers are available
   */
  hasServiceWorkers(): boolean {
    return 'serviceWorker' in navigator;
  },
};

/**
 * Mobile-specific optimizations
 */
export const mobileOptimizations = {
  /**
   * Setup mobile-optimized scroll behavior
   */
  setupMobileScroll(): void {
    if (!device.isMobile()) return;

    // Add momentum scrolling for iOS
    document.body.style.webkitOverflowScrolling = 'touch';

    // Prevent zoom on double tap
    document.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    });
  },

  /**
   * Optimize animations for mobile
   */
  getMobileAnimationConfig(): {
    frameRate: number;
    complexity: 'low' | 'medium' | 'high';
    enableEffects: boolean;
  } {
    // Always enable effects regardless of reduced motion preference
    // User wants animations to work in all scenarios

    // Always return highest quality settings regardless of device
    return {
      frameRate: 60,
      complexity: 'high',
      enableEffects: true,
    };
  },

  /**
   * Setup memory monitoring for mobile
   */
  setupMemoryMonitoring(onMemoryPressure: () => void): () => void {
    let memoryCheckInterval: number | undefined;

    if (
      device.isMobile() &&
      (performance as Performance & { memory: MemoryInfo }).memory
    ) {
      memoryCheckInterval = window.setInterval(() => {
        const memoryInfo = (performance as Performance & { memory: MemoryInfo })
          .memory;
        if (memoryInfo.usedJSHeapSize > memoryInfo.jsHeapSizeLimit * 0.8) {
          onMemoryPressure();
        }
      }, 10000); // Check every 10 seconds
    }

    // Return cleanup function
    return () => {
      if (memoryCheckInterval) {
        clearInterval(memoryCheckInterval);
      }
    };
  },

  /**
   * Disable complex features on low-end devices
   */
  shouldDisableComplexFeatures(): boolean {
    return (
      capabilities.getPerformanceTier() === 'low' ||
      capabilities.prefersReducedMotion() ||
      device.isSlowConnection()
    );
  },
};

/**
 * Responsive utilities
 */
export const responsive = {
  /**
   * Get current breakpoint based on viewport width
   */
  getCurrentBreakpoint(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' {
    const width = window.innerWidth;

    if (width < 576) return 'xs';
    if (width < 768) return 'sm';
    if (width < 992) return 'md';
    if (width < 1200) return 'lg';
    if (width < 1400) return 'xl';
    return 'xxl';
  },

  /**
   * Check if current viewport matches breakpoint
   */
  matches(breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'): boolean {
    return this.getCurrentBreakpoint() === breakpoint;
  },

  /**
   * Check if current viewport is at least the specified breakpoint
   */
  isAtLeast(breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'): boolean {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentIndex = breakpoints.indexOf(this.getCurrentBreakpoint());
    const targetIndex = breakpoints.indexOf(breakpoint);
    return currentIndex >= targetIndex;
  },

  /**
   * Setup responsive breakpoint monitoring
   */
  setupBreakpointMonitoring(
    callback: (breakpoint: string) => void
  ): () => void {
    let currentBreakpoint = this.getCurrentBreakpoint();

    const handleResize = () => {
      const newBreakpoint = this.getCurrentBreakpoint();
      if (newBreakpoint !== currentBreakpoint) {
        currentBreakpoint = newBreakpoint;
        callback(newBreakpoint);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  },
};

// Export all utilities as a single object for convenience
export const deviceUtils = {
  device,
  battery,
  capabilities,
  mobileOptimizations,
  responsive,
};
