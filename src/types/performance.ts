/**
 * Performance monitoring type definitions
 */

export interface PerformanceMetrics {
  renderTime?: number;
  loadTime?: number;
  interactionTime?: number;
  memoryUsage?: number;
}

export interface WebVitalsMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'back-forward-cache';
}
