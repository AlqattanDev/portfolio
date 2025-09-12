/**
 * Space Effects Performance Optimizer
 * Dynamically adjusts space theme effects based on device capabilities
 */

interface DeviceCapabilities {
  isMobile: boolean;
  isLowPower: boolean;
  hasReducedMotion: boolean;
  memoryLimit: number;
  gpuTier: 'low' | 'medium' | 'high';
}

interface PerformanceConfig {
  starCount: number;
  animationFPS: number;
  effectIntensity: 'subtle' | 'normal' | 'intense';
  flashlightSize: 'small' | 'medium' | 'large';
  enableParallax: boolean;
  enableMouseEffects: boolean;
  enableNebula: boolean;
}

export class SpaceEffectsOptimizer {
  private capabilities: DeviceCapabilities;
  private config: PerformanceConfig;
  private isInitialized: boolean = false;

  constructor() {
    this.capabilities = this.detectCapabilities();
    this.config = this.generateOptimalConfig();
  }

  private detectCapabilities(): DeviceCapabilities {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    let isLowPower = false;
    let memoryLimit = 4096; // Default 4GB assumption
    
    // Detect low power mode and memory constraints
    try {
      if ('getBattery' in navigator) {
        navigator.getBattery().then((battery: any) => {
          isLowPower = battery.level < 0.2 && !battery.charging;
        });
      }
      
      if ('memory' in (performance as any)) {
        const memoryInfo = (performance as any).memory;
        memoryLimit = memoryInfo.jsHeapSizeLimit / 1024 / 1024; // Convert to MB
      }
    } catch (error) {
      console.warn('Unable to detect battery/memory info:', error);
    }

    // Simple GPU tier detection based on device characteristics
    let gpuTier: 'low' | 'medium' | 'high' = 'medium';
    if (isMobile || memoryLimit < 2048) {
      gpuTier = 'low';
    } else if (memoryLimit > 8192) {
      gpuTier = 'high';
    }

    return {
      isMobile,
      isLowPower,
      hasReducedMotion,
      memoryLimit,
      gpuTier
    };
  }

  private generateOptimalConfig(): PerformanceConfig {
    const { isMobile, isLowPower, hasReducedMotion, gpuTier } = this.capabilities;

    // Base configuration
    let config: PerformanceConfig = {
      starCount: 200,
      animationFPS: 60,
      effectIntensity: 'normal',
      flashlightSize: 'medium',
      enableParallax: true,
      enableMouseEffects: true,
      enableNebula: true
    };

    // Adjust for reduced motion
    if (hasReducedMotion) {
      config.animationFPS = 0; // Disable animations
      config.effectIntensity = 'subtle';
      config.enableParallax = false;
      config.enableMouseEffects = false;
    }

    // Adjust for mobile devices
    if (isMobile) {
      config.starCount = Math.floor(config.starCount * 0.5); // 50% fewer stars
      config.animationFPS = 30; // Lower frame rate
      config.effectIntensity = 'subtle';
      config.flashlightSize = 'small';
      config.enableMouseEffects = false; // No mouse on mobile
      config.enableNebula = false; // Disable complex effects
    }

    // Adjust for low power mode
    if (isLowPower) {
      config.starCount = Math.floor(config.starCount * 0.3); // 30% of normal
      config.animationFPS = Math.min(config.animationFPS, 15);
      config.effectIntensity = 'subtle';
      config.enableParallax = false;
      config.enableNebula = false;
    }

    // Adjust for GPU capabilities
    switch (gpuTier) {
      case 'low':
        config.starCount = Math.min(config.starCount, 50);
        config.effectIntensity = 'subtle';
        config.enableNebula = false;
        break;
      case 'high':
        config.starCount = Math.min(config.starCount * 1.5, 300);
        config.effectIntensity = 'intense';
        config.flashlightSize = 'large';
        break;
    }

    return config;
  }

  public init(): void {
    if (this.isInitialized) return;

    this.applyOptimizations();
    this.setupDynamicAdjustments();
    this.isInitialized = true;

    console.log('Space Effects Optimizer initialized:', {
      capabilities: this.capabilities,
      config: this.config
    });
  }

  private applyOptimizations(): void {
    // Update CSS custom properties for dynamic theming
    document.documentElement.style.setProperty('--star-count', this.config.starCount.toString());
    document.documentElement.style.setProperty('--animation-fps', this.config.animationFPS.toString());

    // Apply intensity class to body
    document.body.classList.remove('space-subtle', 'space-normal', 'space-intense');
    document.body.classList.add(`space-${this.config.effectIntensity}`);

    // Update space background component if it exists
    const spaceBackground = document.querySelector('.space-background') as HTMLElement;
    if (spaceBackground) {
      spaceBackground.setAttribute('data-star-count', this.config.starCount.toString());
      spaceBackground.classList.remove('subtle', 'normal', 'intense');
      spaceBackground.classList.add(this.config.effectIntensity);
    }

    // Update mouse flashlight component if it exists
    const mouseFlashlight = document.querySelector('.mouse-flashlight') as HTMLElement;
    if (mouseFlashlight && this.config.enableMouseEffects) {
      mouseFlashlight.classList.remove('small', 'medium', 'large');
      mouseFlashlight.classList.add(this.config.flashlightSize);
      mouseFlashlight.classList.remove('subtle', 'normal', 'intense');
      mouseFlashlight.classList.add(this.config.effectIntensity);
    } else if (mouseFlashlight) {
      mouseFlashlight.style.display = 'none';
    }
  }

  private setupDynamicAdjustments(): void {
    // Monitor battery level changes
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery: any) => {
        const handleBatteryChange = () => {
          const wasLowPower = this.capabilities.isLowPower;
          this.capabilities.isLowPower = battery.level < 0.2 && !battery.charging;
          
          if (wasLowPower !== this.capabilities.isLowPower) {
            this.config = this.generateOptimalConfig();
            this.applyOptimizations();
          }
        };

        battery.addEventListener('levelchange', handleBatteryChange);
        battery.addEventListener('chargingchange', handleBatteryChange);
      });
    }

    // Monitor memory usage
    if ('memory' in (performance as any)) {
      const checkMemory = () => {
        const memoryInfo = (performance as any).memory;
        const usedMemoryRatio = memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;
        
        if (usedMemoryRatio > 0.8) {
          // High memory usage - reduce effects
          this.config.starCount = Math.floor(this.config.starCount * 0.7);
          this.config.effectIntensity = 'subtle';
          this.applyOptimizations();
          console.warn('High memory usage detected, reducing space effects');
        }
      };

      // Check every 30 seconds
      setInterval(checkMemory, 30000);
    }

    // Listen for visibility changes to pause/resume
    document.addEventListener('visibilitychange', () => {
      const spaceEffects = document.querySelectorAll('.space-background, .mouse-flashlight');
      spaceEffects.forEach(element => {
        const effect = (element as any).spaceEffect || (element as any).flashlightEffect;
        if (effect) {
          if (document.hidden) {
            effect.pause();
          } else {
            effect.resume();
          }
        }
      });
    });

    // Monitor frame rate and adjust if needed
    let frameCount = 0;
    let lastTime = performance.now();
    
    const monitorFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        
        if (fps < this.config.animationFPS * 0.7) {
          // Significantly lower FPS than target - reduce complexity
          if (this.config.starCount > 50) {
            this.config.starCount = Math.floor(this.config.starCount * 0.8);
            this.applyOptimizations();
            console.warn(`Low FPS detected (${fps}), reducing star count to ${this.config.starCount}`);
          }
        }
      }
      
      requestAnimationFrame(monitorFPS);
    };
    
    requestAnimationFrame(monitorFPS);
  }

  public getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...updates };
    this.applyOptimizations();
  }

  public forceHighPerformance(): void {
    this.config = {
      starCount: 300,
      animationFPS: 60,
      effectIntensity: 'intense',
      flashlightSize: 'large',
      enableParallax: true,
      enableMouseEffects: true,
      enableNebula: true
    };
    this.applyOptimizations();
  }

  public forceLowPerformance(): void {
    this.config = {
      starCount: 30,
      animationFPS: 15,
      effectIntensity: 'subtle',
      flashlightSize: 'small',
      enableParallax: false,
      enableMouseEffects: false,
      enableNebula: false
    };
    this.applyOptimizations();
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const optimizer = new SpaceEffectsOptimizer();
  optimizer.init();
  
  // Make it available globally for debugging
  (window as any).spaceOptimizer = optimizer;
});

// Export for manual use
export default SpaceEffectsOptimizer;