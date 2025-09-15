/**
 * ASCII Animation System (Refactored)
 * Main animation system that coordinates all components
 */

import type { VimMode } from '@/types';
import { VimSystem, type VimSystemCallbacks } from '@/systems/VimSystem';
import { ParticleSystem } from '@/animation/ParticleSystem';
import { EffectSystem } from '@/animation/EffectSystem';
import { AnimationScheduler } from '@/animation/AnimationScheduler';
import { performance as perfUtils, globalCleanupManager } from '@/utils/performance';
import { device, mobileOptimizations } from '@/utils/device';
import { dom } from '@/utils/dom';
import { COLOR_SCHEMES, EFFECT_NAMES } from '@/utils/constants';

export class ASCIIAnimationSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private time: number = 0;
  private mousePos: { x: number; y: number } = { x: 0, y: 0 };
  
  // System components
  private particleSystem: ParticleSystem;
  private effectSystem: EffectSystem;
  private vimSystem: VimSystem;
  private animationScheduler: AnimationScheduler;
  
  // State
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  
  // Cleanup functions
  private cleanupFunctions: (() => void)[] = [];

  constructor(canvasId: string) {
    // Initialize canvas
    const canvas = dom.select.byId<HTMLCanvasElement>(canvasId);
    if (!canvas) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }

    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to get 2D context from canvas');
    }
    this.ctx = ctx;

    // Initialize systems
    this.animationScheduler = new AnimationScheduler();
    this.particleSystem = new ParticleSystem(canvas, ctx);
    this.effectSystem = new EffectSystem();
    
    // Setup vim system with callbacks
    const vimCallbacks: VimSystemCallbacks = {
      onModeChange: (mode) => this.handleModeChange(mode),
      onSchemeChange: (direction) => this.handleSchemeChange(direction),
      onScroll: (direction, amount) => this.handleScroll(direction, amount),
      onGoToTop: () => this.handleGoToTop(),
      onGoToBottom: () => this.handleGoToBottom(),
    };
    this.vimSystem = new VimSystem(vimCallbacks);

    this.init();
  }

  private init(): void {
    // Restore previously selected color scheme if available
    this.restoreColorScheme();
    
    // Setup canvas and particles
    this.resize();
    this.createParticles();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Apply mobile optimizations if needed
    this.applyMobileOptimizations();
    
    // Update initial state
    this.updateColorScheme();
    
    // Start animation
    this.start();
  }

  private restoreColorScheme(): void {
    try {
      const savedIndexRaw = localStorage.getItem('schemeIndex');
      const savedIndex = savedIndexRaw != null ? parseInt(savedIndexRaw, 10) : NaN;
      if (!Number.isNaN(savedIndex) && savedIndex >= 0 && savedIndex < Object.values(COLOR_SCHEMES).length) {
        this.effectSystem.setCurrentEffect(savedIndex);
      }
    } catch {
      // localStorage may be unavailable
    }
  }

  private setupEventListeners(): void {
    // Window resize with debouncing
    const resizeCleanup = dom.events.onDebounced(
      window as any,
      'resize',
      () => this.resize(),
      250
    );
    this.cleanupFunctions.push(resizeCleanup);

    // Mouse movement with throttling
    const mouseMoveCleanup = dom.events.onThrottled(
      this.canvas,
      'mousemove',
      (e) => this.updateMouse(e),
      16 // 60fps
    );
    this.cleanupFunctions.push(mouseMoveCleanup);

    // Visibility change handling
    const visibilityCleanup = dom.events.on(
      document as any,
      'visibilitychange',
      () => this.handleVisibilityChange()
    );
    this.cleanupFunctions.push(visibilityCleanup);

    // Setup mobile-specific optimizations
    if (device.isMobile()) {
      this.setupMobileOptimizations();
    }

    // Register cleanup
    globalCleanupManager.add(() => this.destroy());
  }

  private applyMobileOptimizations(): void {
    // Always run at highest quality regardless of device
    const config = mobileOptimizations.getMobileAnimationConfig();
    
    // Always enable animations with best quality settings
    console.log(`Animation config: complexity=${config.complexity}, frameRate=${config.frameRate}, forceEnabled=true, quality=maximum`);
    
    // No quality adjustments - always run at full quality
  }

  private setupMobileOptimizations(): void {
    // Memory monitoring
    const memoryCleanup = mobileOptimizations.setupMemoryMonitoring(() => {
      console.warn('High memory usage detected, pausing animations');
      this.pause();
    });
    this.cleanupFunctions.push(memoryCleanup);

    // Battery monitoring
    (async () => {
      try {
        const batteryCleanup = await device.battery.setupBatteryMonitoring({
          onLowBattery: () => {
            console.warn('Low battery detected, pausing animations');
            this.pause();
          },
          onChargingChange: (charging) => {
            if (charging && this.isPaused) {
              console.log('Device charging, resuming animations');
              this.resume();
            }
          }
        });
        if (batteryCleanup) {
          this.cleanupFunctions.push(batteryCleanup);
        }
      } catch (error) {
        console.warn('Battery monitoring not available:', error);
      }
    })();
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.particleSystem.resize();
  }

  private createParticles(): void {
    this.particleSystem.createParticles();
  }

  private updateMouse(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos.x = e.clientX - rect.left;
    this.mousePos.y = e.clientY - rect.top;
    this.effectSystem.setMousePosition(this.mousePos.x, this.mousePos.y);
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.pause();
    } else {
      // Resume after a short delay to avoid rapid switching
      setTimeout(() => {
        if (!document.hidden && !this.isPaused) {
          this.resume();
        }
      }, 500);
    }
  }

  // Vim system callbacks
  private handleModeChange(mode: VimMode['mode']): void {
    this.effectSystem.setCurrentMode(mode);
    this.effectSystem.updateVimModeDisplay();
  }

  private handleSchemeChange(direction: 'next' | 'prev'): void {
    // Add visual flash effect during theme change
    document.body.classList.add('theme-changing');
    setTimeout(() => {
      document.body.classList.remove('theme-changing');
    }, 600);

    const currentEffect = this.effectSystem.getCurrentEffect();
    const maxEffects = EFFECT_NAMES.length;
    
    let newEffect: number;
    if (direction === 'next') {
      newEffect = (currentEffect + 1) % maxEffects;
    } else {
      newEffect = (currentEffect - 1 + maxEffects) % maxEffects;
    }
    
    this.effectSystem.setCurrentEffect(newEffect);
    this.particleSystem.resetParticles();
    this.updateColorScheme();
  }

  private handleScroll(direction: 'up' | 'down', amount: number): void {
    const scrollAmount = direction === 'up' ? -amount : amount;
    window.scrollBy(0, scrollAmount);
  }

  private handleGoToTop(): void {
    dom.scroll.toTop();
  }

  private handleGoToBottom(): void {
    dom.scroll.toBottom();
  }

  private animate = (): void => {
    if (this.isPaused || !this.isRunning) return;

    this.time++;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and render particles with effects
    const particles = this.particleSystem.getParticles();
    particles.forEach(particle => {
      this.effectSystem.applyEffectToParticle(particle, this.time);
    });

    this.particleSystem.renderParticles(this.time);
  };

  private updateColorScheme(): void {
    // Handle theme synchronization
    const currentEffect = this.effectSystem.getCurrentEffect();
    const currentScheme = Object.values(COLOR_SCHEMES)[currentEffect];
    
    if (currentScheme) {
      // Persist scheme selection
      try {
        localStorage.setItem('schemeIndex', String(currentEffect));
        
        // Update theme attribute
        const html = document.documentElement;
        const theme = this.getThemeForScheme(currentScheme);
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Broadcast theme change event
        dom.events.trigger(document, 'theme:changed', {
          theme,
          scheme: currentScheme,
          index: currentEffect
        });
      } catch {
        // localStorage not available
      }
    }

    // Update status display
    this.effectSystem.updateVimModeDisplay();
  }

  private getThemeForScheme(scheme: string): 'dark' | 'light' {
    const lightSchemes = new Set([COLOR_SCHEMES.GRUVBOX_SYNTAX]);
    return lightSchemes.has(scheme) ? 'light' : 'dark';
  }

  // Public API
  public getCurrentMode(): VimMode['mode'] {
    return this.vimSystem.getCurrentMode();
  }

  public getCurrentEffect(): number {
    return this.effectSystem.getCurrentEffect();
  }

  public getCurrentEffectName(): string {
    return this.effectSystem.getCurrentEffectName();
  }

  public nextScheme(): void {
    this.handleSchemeChange('next');
  }

  public prevScheme(): void {
    this.handleSchemeChange('prev');
  }

  public pause(): void {
    this.isPaused = true;
    this.animationScheduler.pause();
  }

  public resume(): void {
    if (!this.isRunning) return;
    this.isPaused = false;
    this.animationScheduler.resume();
    this.animationScheduler.add(this.animate);
  }

  public destroy(): void {
    this.isRunning = false;
    this.isPaused = true;
    
    // Cleanup all event listeners
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
    
    // Destroy systems
    this.animationScheduler.destroy();
    this.particleSystem.destroy();
    this.effectSystem.destroy();
    this.vimSystem.destroy();
  }

  public getStats() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentTime: this.time,
      currentMode: this.getCurrentMode(),
      currentEffect: this.getCurrentEffectName(),
      ...this.particleSystem.getStats(),
      activeAnimationTasks: this.animationScheduler.getActiveTaskCount()
    };
  }

  // Start the animation system
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.isPaused = false;
    this.animationScheduler.add(this.animate);
  }
}