/**
 * Component Enhancements
 * Unified system for all component interaction enhancements
 */

interface ComponentEnhancementOptions {
  enableScrollAnimations?: boolean;
  enableThemeReactivity?: boolean;
  enableInteractionEffects?: boolean;
  staggerDelay?: number;
}

export class ComponentEnhancementManager {
  private options: ComponentEnhancementOptions;
  private observers: IntersectionObserver[] = [];
  private cleanupFunctions: (() => void)[] = [];

  constructor(options: ComponentEnhancementOptions = {}) {
    this.options = {
      enableScrollAnimations: true,
      enableThemeReactivity: true,
      enableInteractionEffects: true,
      staggerDelay: 0.1,
      ...options
    };
  }

  /**
   * Initialize all component enhancements
   */
  public initialize(): void {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }
  }

  private initializeComponents(): void {
    if (this.options.enableScrollAnimations) {
      this.initializeScrollAnimations();
    }

    if (this.options.enableThemeReactivity) {
      this.initializeThemeReactivity();
    }

    if (this.options.enableInteractionEffects) {
      this.initializeInteractionEffects();
    }
  }

  /**
   * Initialize smooth scroll-in animations for all components
   */
  private initializeScrollAnimations(): void {
    const animatableElements = document.querySelectorAll('.entry, .skill-item, .project-card, .education-card, .contact-card');
    
    if (!animatableElements.length) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '-5% 0px -5% 0px'
    };

    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Stagger animations for child elements
          const childElements = entry.target.querySelectorAll('.tech-tag, .achievement-item, .skill-bar');
          childElements.forEach((child, index) => {
            (child as HTMLElement).style.transitionDelay = `${0.3 + index * this.options.staggerDelay!}s`;
          });
        }
      });
    }, observerOptions);

    // Initialize elements with smooth entrance animations
    animatableElements.forEach((element, index) => {
      // Set initial state
      const el = element as HTMLElement;
      el.style.transitionDelay = `${index * this.options.staggerDelay!}s`;
      
      scrollObserver.observe(element);
    });

    this.observers.push(scrollObserver);
  }

  /**
   * Initialize theme-reactive behaviors across all components
   */
  private initializeThemeReactivity(): void {
    const updateComponentThemes = () => {
      const animationSystem = (window as any).asciiAnimationSystem;
      
      if (!animationSystem) return;

      const currentEffectName = animationSystem.getCurrentEffectName();
      const theme = currentEffectName.toUpperCase().replace(/\s+/g, '_');
      
      // Update all themed elements
      const themedElements = document.querySelectorAll('[data-theme], .skills-container, .project-card, .education-card, .contact-card');
      themedElements.forEach(element => {
        element.setAttribute('data-theme', theme);
      });

      // Apply theme-specific interaction colors
      this.applyThemeColors(theme);
    };

    // Listen for theme changes
    document.addEventListener('theme:changed', updateComponentThemes);
    this.cleanupFunctions.push(() => {
      document.removeEventListener('theme:changed', updateComponentThemes);
    });

    // Initialize
    updateComponentThemes();
  }

  private applyThemeColors(theme: string): void {
    const themeColors = {
      'MATRIX': '#00ff41',
      'TRADING': '#ffff00', 
      'BLOCKCHAIN': '#64ffda',
      'ENCRYPTION': '#ff6b6b',
      'LEDGER': '#9c27b0',
      'SWIFT': '#2196f3',
      'RISK': '#ff5722',
      'COMPLIANCE': '#4caf50',
      'SETTLEMENT': '#ff9800',
      'GRUVBOX': '#d65d0e',
      'GRUVBOX_VISUAL': '#b16286',
      'GRUVBOX_SYNTAX': '#98971a'
    };

    const themeColor = themeColors[theme as keyof typeof themeColors] || '#00ff41';
    
    // Update CSS custom properties for dynamic theming
    document.documentElement.style.setProperty('--theme-accent', themeColor);
    document.documentElement.style.setProperty('--theme-accent-alpha', `${themeColor}33`);
  }

  /**
   * Initialize subtle interaction effects
   */
  private initializeInteractionEffects(): void {
    // Smooth focus transitions
    this.initializeFocusEffects();
    
    // Hover state management
    this.initializeHoverEffects();
    
    // Keyboard navigation enhancements
    this.initializeKeyboardNavigation();
  }

  private initializeFocusEffects(): void {
    const focusableElements = document.querySelectorAll(
      '.entry, .skill-item, .project-card, .education-card, .contact-card, .tech-tag, .achievement-item'
    );

    focusableElements.forEach(element => {
      // Add tabindex for keyboard navigation
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
      }

      // Enhanced focus indicators
      element.addEventListener('focus', (e) => {
        const target = e.target as HTMLElement;
        target.style.outline = '2px solid var(--theme-accent, #00ff41)';
        target.style.outlineOffset = '2px';
        target.style.transition = 'outline 0.2s ease';
      });

      element.addEventListener('blur', (e) => {
        const target = e.target as HTMLElement;
        target.style.outline = '';
      });
    });
  }

  private initializeHoverEffects(): void {
    // Prevent hover effects on touch devices
    if ('ontouchstart' in window) return;

    const hoverableElements = document.querySelectorAll('.entry, .skill-item, .project-card, .education-card, .contact-card');
    
    hoverableElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        // Add subtle particle effect hint by adjusting z-index
        (element as HTMLElement).style.zIndex = '2';
        (element as HTMLElement).style.position = 'relative';
      });

      element.addEventListener('mouseleave', () => {
        (element as HTMLElement).style.zIndex = '';
      });
    });
  }

  private initializeKeyboardNavigation(): void {
    document.addEventListener('keydown', (e) => {
      // Enhanced keyboard navigation for components
      if (e.key === 'Enter' || e.key === ' ') {
        const activeElement = document.activeElement;
        
        if (activeElement?.classList.contains('project-card')) {
          // Trigger project actions on Enter/Space
          const primaryAction = activeElement.querySelector('.action-btn.primary') as HTMLButtonElement;
          if (primaryAction) {
            e.preventDefault();
            primaryAction.click();
          }
        }
      }
    });
  }

  /**
   * Cleanup all observers and event listeners
   */
  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
  }
}

// Global instance
let componentEnhancementManager: ComponentEnhancementManager | null = null;

/**
 * Initialize component enhancements with default options
 */
export function initializeComponentEnhancements(options?: ComponentEnhancementOptions): ComponentEnhancementManager {
  if (componentEnhancementManager) {
    componentEnhancementManager.destroy();
  }

  componentEnhancementManager = new ComponentEnhancementManager(options);
  componentEnhancementManager.initialize();
  
  return componentEnhancementManager;
}

/**
 * Get the global component enhancement manager instance
 */
export function getComponentEnhancementManager(): ComponentEnhancementManager | null {
  return componentEnhancementManager;
}

// Auto-initialize on import
initializeComponentEnhancements();