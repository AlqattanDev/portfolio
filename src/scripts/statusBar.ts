/**
 * Status Bar Script
 * Handles navigation, view switching, and scroll behavior for the status bar
 */

import { dom } from '@/utils/dom';
import { throttle } from '@/utils/performance';

/**
 * Status Bar Navigation Handler
 * Handles smooth scrolling to sections via status bar links
 */
export function initStatusBarNavigation(): void {
  const statusBar = dom.select.one('.status-bar');
  if (!statusBar) return;
  
  // Use event delegation for better performance
  const navigationCleanup = dom.events.delegate(
    statusBar,
    'click',
    '.status-item',
    (event, target) => {
      event.preventDefault();
      
      const statusItem = target as HTMLAnchorElement;
      const targetId = statusItem.getAttribute('href')?.substring(1);
      const targetElement = targetId ? dom.select.byId(targetId) : null;
      
      if (targetElement) {
        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
          dom.scroll.to(targetElement);
        });
      }
    }
  );
  
  // Store cleanup function for potential future use
  (window as any).__statusBarNavCleanup = navigationCleanup;
}

/**
 * View Switcher Handler
 * Toggles between digital and print view modes
 */
export function initViewSwitcher(): void {
  const switcher = dom.select.one('.view-switcher');
  const body = document.body;
  
  if (!switcher) return;
  
  const switcherCleanup = dom.events.on(switcher, 'click', () => {
    if (body.classList.contains('digital-view')) {
      body.classList.remove('digital-view');
      body.classList.add('print-view');
    } else {
      body.classList.remove('print-view');
      body.classList.add('digital-view');
    }
  });
  
  // Store cleanup function for potential future use
  (window as any).__viewSwitcherCleanup = switcherCleanup;
}

/**
 * Scroll to Top Handler
 * Manages the scroll-to-top button visibility and behavior
 */
export function initScrollToTop(): void {
  const scrollToTopBtn = dom.select.byId<HTMLButtonElement>('scrollToTopBtn');
  
  if (!scrollToTopBtn) return;
  
  const showAfter = parseInt(scrollToTopBtn.dataset['showAfter'] || '300', 10);
  
  function toggleScrollToTop(): void {
    try {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      dom.css.toggle(scrollToTopBtn, 'visible', scrollTop > showAfter);
    } catch (error) {
      console.error('Failed to toggle scroll to top button:', error);
    }
  }
  
  const scrollToTop = (): void => {
    try {
      dom.scroll.toTop();
    } catch (error) {
      // Fallback for browsers that don't support smooth scrolling
      console.warn('Smooth scrolling not supported, using fallback:', error);
      window.scrollTo(0, 0);
    }
  };
  
  // Event listeners
  const clickCleanup = dom.events.on(scrollToTopBtn, 'click', scrollToTop);
  
  // Add keyboard support
  const keydownCleanup = dom.events.on(scrollToTopBtn, 'keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToTop();
    }
  });
  
  // Use throttled scroll listener for better performance
  const throttledToggleScrollToTop = throttle(toggleScrollToTop, 100);
  const scrollCleanup = dom.events.on(window as any, 'scroll', throttledToggleScrollToTop, { passive: true });
  
  // Initial check
  toggleScrollToTop();
  
  // Store cleanup functions for potential future use
  (window as any).__scrollToTopCleanup = () => {
    clickCleanup();
    keydownCleanup();
    scrollCleanup();
  };
}

/**
 * Progress Ring Animation
 * Updates the progress ring based on scroll position
 */
export function initProgressRing(): void {
  const progressRing = dom.select.one('.progress-ring');
  const progressPercentage = dom.select.one('.progress-percentage');
  
  if (!progressRing || !progressPercentage) return;
  
  // Calculate the circumference of the progress ring
  const radius = 25; // Based on the SVG circle radius
  const circumference = 2 * Math.PI * radius;
  
  // Set initial dash array
  dom.style.set(progressRing as HTMLElement, {
    'stroke-dasharray': circumference.toString(),
    'stroke-dashoffset': circumference.toString()
  });
  
  function updateProgress(): void {
    try {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = Math.min(100, Math.max(0, (scrollTop / documentHeight) * 100));
      
      // Update the ring
      const offset = circumference - (scrollPercent / 100) * circumference;
      dom.style.setProperty(progressRing as HTMLElement, 'stroke-dashoffset', offset.toString());
      
      // Update the percentage text
      if (progressPercentage) {
        progressPercentage.textContent = `${Math.round(scrollPercent)}%`;
      }
      
      // Update the aria-valuenow for accessibility
      const container = dom.select.one('.status-progress-container');
      if (container) {
        container.setAttribute('aria-valuenow', Math.round(scrollPercent).toString());
      }
    } catch (error) {
      console.error('Failed to update progress ring:', error);
    }
  }
  
  // Use throttled scroll listener for better performance
  const throttledUpdateProgress = throttle(updateProgress, 16); // ~60fps
  const scrollCleanup = dom.events.on(window as any, 'scroll', throttledUpdateProgress, { passive: true });
  
  // Initial update
  updateProgress();
  
  // Store cleanup function for potential future use
  (window as any).__progressRingCleanup = scrollCleanup;
}

/**
 * Initialize all status bar functionality
 */
export function initStatusBar(): void {
  // Initialize all status bar components
  initStatusBarNavigation();
  initViewSwitcher();
  initScrollToTop();
  initProgressRing();
}

/**
 * Cleanup all status bar event listeners
 * Useful for hot reloading and component unmounting
 */
export function cleanupStatusBar(): void {
  const cleanupFunctions = [
    '__statusBarNavCleanup',
    '__viewSwitcherCleanup',
    '__scrollToTopCleanup',
    '__progressRingCleanup'
  ];
  
  cleanupFunctions.forEach(funcName => {
    const cleanup = (window as any)[funcName];
    if (typeof cleanup === 'function') {
      cleanup();
      delete (window as any)[funcName];
    }
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStatusBar);
} else {
  initStatusBar();
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupStatusBar);