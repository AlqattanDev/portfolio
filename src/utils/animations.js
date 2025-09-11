/**
 * Unified Animation System
 * Provides consistent, performant animations across components
 */

// Central RAF scheduler for all animations
class AnimationScheduler {
  constructor() {
    this.tasks = new Set();
    this.isRunning = false;
  }

  add(task) {
    this.tasks.add(task);
    if (!this.isRunning) {
      this.start();
    }
  }

  remove(task) {
    this.tasks.delete(task);
    if (this.tasks.size === 0) {
      this.stop();
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick();
  }

  stop() {
    this.isRunning = false;
  }

  tick = () => {
    if (!this.isRunning) return;
    
    // Execute all animation tasks
    for (const task of this.tasks) {
      try {
        task();
      } catch (error) {
        console.error('Animation task failed:', error);
        this.tasks.delete(task);
      }
    }

    if (this.tasks.size > 0) {
      requestAnimationFrame(this.tick);
    } else {
      this.isRunning = false;
    }
  };
}

// Global animation scheduler instance
const scheduler = new AnimationScheduler();

/**
 * Utility functions for common animations
 */
export const animations = {
  // Smooth fade in/out
  fadeIn(element, duration = 300) {
    return new Promise((resolve) => {
      element.style.opacity = '0';
      element.style.transition = `opacity ${duration}ms ease-in-out`;
      
      // Force reflow
      element.offsetHeight;
      
      element.style.opacity = '1';
      setTimeout(resolve, duration);
    });
  },

  fadeOut(element, duration = 300) {
    return new Promise((resolve) => {
      element.style.transition = `opacity ${duration}ms ease-in-out`;
      element.style.opacity = '0';
      setTimeout(resolve, duration);
    });
  },

  // Smooth slide animations
  slideDown(element, duration = 300) {
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

  slideUp(element, duration = 300) {
    return new Promise((resolve) => {
      const startHeight = element.scrollHeight;
      element.style.height = startHeight + 'px';
      element.style.overflow = 'hidden';
      element.style.transition = `height ${duration}ms ease-in-out`;
      
      // Force reflow
      element.offsetHeight;
      
      element.style.height = '0px';
      setTimeout(resolve, duration);
    });
  },

  // Scale animation with spring easing
  scaleIn(element, duration = 250) {
    return new Promise((resolve) => {
      element.style.transform = 'scale(0)';
      element.style.transition = `transform ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
      
      // Force reflow
      element.offsetHeight;
      
      element.style.transform = 'scale(1)';
      setTimeout(resolve, duration);
    });
  },

  // Stagger animation for lists
  staggerIn(elements, delay = 100, duration = 300) {
    const promises = [];
    elements.forEach((element, index) => {
      const promise = new Promise((resolve) => {
        setTimeout(() => {
          this.fadeIn(element, duration).then(resolve);
        }, index * delay);
      });
      promises.push(promise);
    });
    return Promise.all(promises);
  }
};

/**
 * Performance utilities
 */
export const performance = {
  // Throttle function for scroll events
  throttle(func, limit = 16) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Debounce function for resize events
  debounce(func, wait = 250) {
    let timeout;
    return function(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // RAF-based animation loop
  animate(callback) {
    const task = () => {
      if (callback() !== false) {
        scheduler.add(task);
      }
    };
    scheduler.add(task);
    
    // Return cleanup function
    return () => scheduler.remove(task);
  },

  // Intersection Observer with performance optimizations
  observeIntersection(elements, callback, options = {}) {
    const defaultOptions = {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };

    const observer = new IntersectionObserver((entries) => {
      // Use RAF to batch DOM updates
      requestAnimationFrame(() => {
        entries.forEach(callback);
      });
    }, defaultOptions);

    elements.forEach(el => observer.observe(el));
    
    return () => {
      observer.disconnect();
    };
  }
};

/**
 * CSS Custom Properties Animation
 * Smoothly animate CSS custom properties
 */
export const cssVariables = {
  animate(element, property, from, to, duration = 300, easing = 'ease-in-out') {
    return new Promise((resolve) => {
      element.style.setProperty(property, from);
      element.style.transition = `${property} ${duration}ms ${easing}`;
      
      // Force reflow
      element.offsetHeight;
      
      element.style.setProperty(property, to);
      setTimeout(resolve, duration);
    });
  },

  // Animate multiple properties simultaneously
  animateMultiple(element, properties, duration = 300, easing = 'ease-in-out') {
    const promises = Object.entries(properties).map(([property, { from, to }]) => {
      return this.animate(element, property, from, to, duration, easing);
    });
    return Promise.all(promises);
  }
};

// Export the scheduler for advanced use cases
export { scheduler };