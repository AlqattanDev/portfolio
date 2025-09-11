/**
 * Error handling and reporting type definitions
 */

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export interface ErrorContext {
  component: string;
  props?: Record<string, unknown>;
  timestamp: number;
  userAgent?: string;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
