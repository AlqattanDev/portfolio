/**
 * Media and external integration type definitions
 */

export interface MediaConfig {
  lazy?: boolean;
  placeholder?: string;
  fallback?: string;
}

export interface ApiConfig {
  timeout?: number;
  retries?: number;
  fallbackData?: unknown;
}
