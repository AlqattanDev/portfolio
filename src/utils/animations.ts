/**
 * ASCII Canvas Animation System (Refactored)
 * Main entry point for ASCII animations with centralized systems
 */

// Re-export the new refactored system
export { ASCIIAnimationSystem } from '@/animation/ASCIIAnimationSystem';

// Re-export individual systems for advanced usage
export { VimSystem } from '@/systems/VimSystem';
export { ParticleSystem } from '@/animation/ParticleSystem';
export { EffectSystem } from '@/animation/EffectSystem';
export {
  AnimationScheduler,
  globalScheduler,
} from '@/animation/AnimationScheduler';

// Re-export utilities
export {
  animationScheduler,
  throttle,
  debounce,
  animate,
  observeIntersection,
  performance,
  resourceLoader,
  SimpleCache,
  CleanupManager,
  globalCleanupManager,
} from '@/utils/performance';

export {
  device,
  battery,
  capabilities,
  mobileOptimizations,
  responsive,
  deviceUtils,
} from '@/utils/device';

export { dom } from '@/utils/dom';

/**
 * CSS Custom Properties Animation
 * Smoothly animate CSS custom properties
 */
export const cssVariables = {
  animate(
    element: HTMLElement,
    property: string,
    from: string,
    to: string,
    duration: number = 300,
    easing: string = 'ease-in-out'
  ): Promise<void> {
    return new Promise((resolve) => {
      element.style.setProperty(property, from);
      element.style.transition = `${property} ${duration}ms ${easing}`;

      // Force reflow
      element.offsetHeight;

      element.style.setProperty(property, to);
      setTimeout(() => resolve(), duration);
    });
  },

  // Animate multiple properties simultaneously
  animateMultiple(
    element: HTMLElement,
    properties: Record<string, { from: string; to: string }>,
    duration: number = 300,
    easing: string = 'ease-in-out'
  ): Promise<void[]> {
    const promises = Object.entries(properties).map(
      ([property, { from, to }]) => {
        return this.animate(element, property, from, to, duration, easing);
      }
    );
    return Promise.all(promises);
  },
};

/**
 * Utility functions for common animations
 */
export const animations = {
  // Smooth fade in/out
  fadeIn(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      element.style.opacity = '0';
      element.style.transition = `opacity ${duration}ms ease-in-out`;

      // Force reflow
      element.offsetHeight;

      element.style.opacity = '1';
      setTimeout(() => resolve(), duration);
    });
  },

  fadeOut(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      element.style.transition = `opacity ${duration}ms ease-in-out`;
      element.style.opacity = '0';
      setTimeout(() => resolve(), duration);
    });
  },

  // Smooth slide animations
  slideDown(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      const startHeight = element.scrollHeight;
      element.style.height = '0px';
      element.style.overflow = 'hidden';
      element.style.transition = `height ${duration}ms ease-in-out`;

      // Force reflow
      element.offsetHeight;

      element.style.height = startHeight + 'px';
      setTimeout(() => {
        element.style.height = 'auto';
        element.style.overflow = '';
        resolve();
      }, duration);
    });
  },

  slideUp(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      const startHeight = element.scrollHeight;
      element.style.height = startHeight + 'px';
      element.style.overflow = 'hidden';
      element.style.transition = `height ${duration}ms ease-in-out`;

      // Force reflow
      element.offsetHeight;

      element.style.height = '0px';
      setTimeout(() => resolve(), duration);
    });
  },

  // Scale animation with spring easing
  scaleIn(element: HTMLElement, duration: number = 250): Promise<void> {
    return new Promise((resolve) => {
      element.style.transform = 'scale(0)';
      element.style.transition = `transform ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;

      // Force reflow
      element.offsetHeight;

      element.style.transform = 'scale(1)';
      setTimeout(() => resolve(), duration);
    });
  },

  // Stagger animation for lists
  staggerIn(
    elements: HTMLElement[],
    delay: number = 100,
    duration: number = 300
  ): Promise<void[]> {
    const promises = elements.map((element, index) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          this.fadeIn(element, duration).then(() => resolve());
        }, index * delay);
      });
    });
    return Promise.all(promises);
  },
};

// Legacy compatibility - export the animation scheduler as 'scheduler'
export { globalScheduler as scheduler };
