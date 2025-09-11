/**
 * Performance Monitoring System
 * Provides comprehensive performance tracking and optimization
 */

import type { 
  PerformanceMetrics, 
  WebVitalsMetric, 
  InteractionEvent 
} from '@/types/component.js';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private webVitals: WebVitalsMetric[] = [];
  private interactions: InteractionEvent[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private isInitialized = false;

  private constructor() {
    this.initialize();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize performance monitoring
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Setup performance observers
      this.setupPerformanceObservers();
      
      // Initialize Web Vitals monitoring
      await this.initializeWebVitals();
      
      // Setup interaction tracking
      this.setupInteractionTracking();
      
      // Start memory monitoring
      this.startMemoryMonitoring();
      
      this.isInitialized = true;
      console.log('🚀 Performance monitoring initialized');
    } catch (error) {
      console.warn('Failed to initialize performance monitoring:', error);
    }
  }

  /**
   * Setup performance observers for various metrics
   */
  private setupPerformanceObservers(): void {
    // Navigation timing
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.recordNavigationTiming(entry as PerformanceNavigationTiming);
          }
        });
      });

      try {
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navObserver);
      } catch (error) {
        console.warn('Navigation observer not supported:', error);
      }

      // Resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordResourceTiming(entry as PerformanceResourceTiming);
        });
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (error) {
        console.warn('Resource observer not supported:', error);
      }

      // Long task detection
      if ('PerformanceLongTaskTiming' in window) {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.recordLongTask(entry as PerformanceLongTaskTiming);
          });
        });

        try {
          longTaskObserver.observe({ entryTypes: ['longtask'] });
          this.observers.set('longtask', longTaskObserver);
        } catch (error) {
          console.warn('Long task observer not supported:', error);
        }
      }
    }
  }

  /**
   * Initialize Web Vitals monitoring
   */
  private async initializeWebVitals(): Promise<void> {
    try {
      // Dynamically import web-vitals if available
      const webVitals = await import('web-vitals').catch(() => null);
      
      if (webVitals) {
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = webVitals;
        
        const handleMetric = (metric: WebVitalsMetric) => {
          this.webVitals.push(metric);
          this.sendWebVital(metric);
        };

        getCLS(handleMetric);
        getFID(handleMetric);
        getFCP(handleMetric);
        getLCP(handleMetric);
        getTTFB(handleMetric);
      } else {
        // Fallback manual Web Vitals calculation
        this.setupFallbackWebVitals();
      }
    } catch (error) {
      console.warn('Web Vitals initialization failed:', error);
      this.setupFallbackWebVitals();
    }
  }

  /**
   * Fallback Web Vitals implementation
   */
  private setupFallbackWebVitals(): void {
    // Basic FCP calculation
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      
      if (fcpEntry) {
        const metric: WebVitalsMetric = {
          name: 'FCP',
          value: fcpEntry.startTime,
          delta: fcpEntry.startTime,
          id: this.generateId(),
          navigationType: 'navigate',
        };
        
        this.webVitals.push(metric);
        this.sendWebVital(metric);
      }
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
      this.observers.set('paint', observer);
    } catch (error) {
      console.warn('Paint observer not supported:', error);
    }
  }

  /**
   * Setup interaction tracking
   */
  private setupInteractionTracking(): void {
    const trackInteraction = (type: string) => (event: Event) => {
      const target = event.target as HTMLElement;
      const element = target.tagName.toLowerCase() + 
        (target.className ? '.' + target.className.split(' ')[0] : '') +
        (target.id ? '#' + target.id : '');

      const interaction: InteractionEvent = {
        type: 'interaction',
        detail: {
          element,
          action: type as any,
          position: 'clientX' in event && 'clientY' in event ? {
            x: (event as MouseEvent).clientX,
            y: (event as MouseEvent).clientY,
          } : undefined,
          metadata: {
            timestamp: Date.now(),
            url: window.location.href,
          },
        },
        timestamp: Date.now(),
      };

      this.interactions.push(interaction);
      
      // Keep only recent interactions (last 100)
      if (this.interactions.length > 100) {
        this.interactions = this.interactions.slice(-100);
      }
    };

    document.addEventListener('click', trackInteraction('click'), { passive: true });
    document.addEventListener('scroll', trackInteraction('scroll'), { passive: true });
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        
        this.recordMetric('memory', {
          memoryUsage: memory.usedJSHeapSize / memory.totalJSHeapSize * 100,
        });
      };

      // Check memory every 30 seconds
      setInterval(checkMemory, 30000);
      checkMemory(); // Initial check
    }
  }

  /**
   * Record navigation timing metrics
   */
  private recordNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics: PerformanceMetrics = {
      loadTime: entry.loadEventEnd - entry.navigationStart,
      renderTime: entry.domContentLoadedEventEnd - entry.navigationStart,
      interactionTime: entry.domInteractive - entry.navigationStart,
    };

    this.recordMetric('navigation', metrics);
  }

  /**
   * Record resource timing metrics
   */
  private recordResourceTiming(entry: PerformanceResourceTiming): void {
    // Track slow resources
    const duration = entry.responseEnd - entry.requestStart;
    
    if (duration > 1000) { // Resources taking more than 1 second
      console.warn(`Slow resource detected: ${entry.name} took ${duration.toFixed(2)}ms`);
    }

    // Track by resource type
    const resourceType = this.getResourceType(entry.name);
    const existingMetrics = this.metrics.get(`resource-${resourceType}`) || {};
    
    this.recordMetric(`resource-${resourceType}`, {
      ...existingMetrics,
      loadTime: (existingMetrics.loadTime || 0) + duration,
    });
  }

  /**
   * Record long task timing
   */
  private recordLongTask(entry: PerformanceLongTaskTiming): void {
    console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
    
    const metrics = this.metrics.get('longtasks') || { renderTime: 0 };
    this.recordMetric('longtasks', {
      ...metrics,
      renderTime: (metrics.renderTime || 0) + entry.duration,
    });
  }

  /**
   * Record custom performance metric
   */
  recordMetric(name: string, metrics: Partial<PerformanceMetrics>): void {
    const existing = this.metrics.get(name) || {};
    this.metrics.set(name, { ...existing, ...metrics });
  }

  /**
   * Measure component render performance
   */
  measureComponent<T>(
    componentName: string,
    operation: () => T
  ): T {
    const startTime = performance.now();
    
    try {
      const result = operation();
      const endTime = performance.now();
      
      this.recordMetric(`component-${componentName}`, {
        renderTime: endTime - startTime,
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      this.recordMetric(`component-${componentName}`, {
        renderTime: endTime - startTime,
      });
      
      throw error;
    }
  }

  /**
   * Measure async operation performance
   */
  async measureAsync<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const endTime = performance.now();
      
      this.recordMetric(`async-${operationName}`, {
        loadTime: endTime - startTime,
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      this.recordMetric(`async-${operationName}`, {
        loadTime: endTime - startTime,
      });
      
      throw error;
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    metrics: Record<string, PerformanceMetrics>;
    webVitals: WebVitalsMetric[];
    interactions: InteractionEvent[];
    summary: {
      averageLoadTime: number;
      averageRenderTime: number;
      totalInteractions: number;
      slowResources: number;
      longTasks: number;
    };
  } {
    const metricsObj = Object.fromEntries(this.metrics.entries());
    
    // Calculate summary statistics
    const loadTimes = Object.values(metricsObj)
      .map(m => m.loadTime)
      .filter((time): time is number => typeof time === 'number');
      
    const renderTimes = Object.values(metricsObj)
      .map(m => m.renderTime)
      .filter((time): time is number => typeof time === 'number');

    const summary = {
      averageLoadTime: loadTimes.length > 0 
        ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length 
        : 0,
      averageRenderTime: renderTimes.length > 0
        ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
        : 0,
      totalInteractions: this.interactions.length,
      slowResources: Object.keys(metricsObj).filter(key => 
        key.startsWith('resource-') && (metricsObj[key]?.loadTime || 0) > 1000
      ).length,
      longTasks: metricsObj['longtasks']?.renderTime ? 
        Math.floor((metricsObj['longtasks'].renderTime || 0) / 50) : 0,
    };

    return {
      metrics: metricsObj,
      webVitals: this.webVitals,
      interactions: this.interactions,
      summary,
    };
  }

  /**
   * Send Web Vital metric to analytics
   */
  private sendWebVital(metric: WebVitalsMetric): void {
    // Log to console in development
    console.log(`📊 ${metric.name}:`, `${metric.value.toFixed(2)}ms`);
    
    // Send to analytics service (implement as needed)
    if (window.gtag) {
      window.gtag('event', metric.name, {
        custom_parameter_1: metric.value,
        custom_parameter_2: metric.id,
      });
    }
    
    if (window.plausible) {
      window.plausible('Web Vital', {
        props: {
          metric: metric.name,
          value: metric.value,
        },
      });
    }
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.includes('.css')) return 'css';
    if (url.includes('.js')) return 'js';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(mp4|webm|ogg)$/)) return 'video';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Cleanup performance monitoring
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
    this.webVitals.length = 0;
    this.interactions.length = 0;
    this.isInitialized = false;
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Export utility functions
export const measureComponent = <T>(name: string, operation: () => T) => {
  return performanceMonitor.measureComponent(name, operation);
};

export const measureAsync = <T>(name: string, operation: () => Promise<T>) => {
  return performanceMonitor.measureAsync(name, operation);
};

export const recordMetric = (name: string, metrics: Partial<PerformanceMetrics>) => {
  performanceMonitor.recordMetric(name, metrics);
};

export const getPerformanceStats = () => {
  return performanceMonitor.getStats();
};