/**
 * Comprehensive Error Handling System
 * Provides centralized error handling, reporting, and recovery mechanisms
 */

import type { 
  ErrorContext, 
  ErrorReport, 
  ErrorBoundaryState,
  ValidationResult 
} from '@/types/component.js';

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorReports: ErrorReport[] = [];
  private maxReports: number = 100;
  private reportingEndpoint?: string;

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Setup global error handlers for unhandled errors
   */
  private setupGlobalErrorHandlers(): void {
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        component: 'global',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        props: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          component: 'promise',
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          props: { type: 'unhandled-rejection' },
        }
      );
    });
  }

  /**
   * Main error handling method
   */
  handleError(
    error: Error, 
    context: ErrorContext, 
    severity: ErrorReport['severity'] = 'medium'
  ): void {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      context,
      severity,
    };

    this.addErrorReport(report);
    this.logError(report);

    // Send to external reporting service if configured
    if (this.reportingEndpoint && severity !== 'low') {
      this.sendErrorReport(report).catch((reportingError) => {
        console.warn('Failed to send error report:', reportingError);
      });
    }

    // Attempt recovery based on error type and severity
    this.attemptRecovery(error, context, severity);
  }

  /**
   * Handle async operations with error handling
   */
  async handleAsync<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    fallbackValue?: T
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(
        error instanceof Error ? error : new Error(String(error)),
        context,
        'medium'
      );
      return fallbackValue;
    }
  }

  /**
   * Handle sync operations with error handling
   */
  handleSync<T>(
    operation: () => T,
    context: ErrorContext,
    fallbackValue?: T
  ): T | undefined {
    try {
      return operation();
    } catch (error) {
      this.handleError(
        error instanceof Error ? error : new Error(String(error)),
        context,
        'medium'
      );
      return fallbackValue;
    }
  }

  /**
   * Validate data with error handling
   */
  validateWithErrorHandling<T>(
    data: unknown,
    validator: (data: unknown) => ValidationResult<T>,
    context: ErrorContext
  ): T | undefined {
    const result = validator(data);
    
    if (!result.success) {
      this.handleError(
        new Error(`Validation failed: ${result.error}`),
        {
          ...context,
          props: { ...context.props, validationData: data },
        },
        'low'
      );
      return undefined;
    }

    return result.data;
  }

  /**
   * Create an error boundary for React-like error handling
   */
  createErrorBoundary(
    component: string,
    fallbackRender?: () => string
  ): {
    wrap: <T>(operation: () => T) => T | undefined;
    getState: () => ErrorBoundaryState;
    reset: () => void;
  } {
    let state: ErrorBoundaryState = { hasError: false };

    return {
      wrap: <T>(operation: () => T): T | undefined => {
        if (state.hasError) {
          return undefined;
        }

        try {
          return operation();
        } catch (error) {
          state = {
            hasError: true,
            error: error instanceof Error ? error : new Error(String(error)),
            errorInfo: { component, timestamp: Date.now() },
          };

          this.handleError(
            state.error!,
            {
              component,
              timestamp: Date.now(),
              userAgent: navigator.userAgent,
            },
            'high'
          );

          return undefined;
        }
      },

      getState: () => state,

      reset: () => {
        state = { hasError: false };
      },
    };
  }

  /**
   * Add error report to internal storage
   */
  private addErrorReport(report: ErrorReport): void {
    this.errorReports.unshift(report);
    
    // Keep only the most recent reports
    if (this.errorReports.length > this.maxReports) {
      this.errorReports = this.errorReports.slice(0, this.maxReports);
    }
  }

  /**
   * Log error to console with appropriate styling
   */
  private logError(report: ErrorReport): void {
    const { message, stack, context, severity } = report;
    
    const styles = {
      low: 'color: #ffa726; background: #fff3e0; padding: 2px 4px;',
      medium: 'color: #ff7043; background: #ffebe3; padding: 2px 4px;',
      high: 'color: #f44336; background: #ffebee; padding: 2px 4px;',
      critical: 'color: #ffffff; background: #d32f2f; padding: 2px 4px; font-weight: bold;',
    };

    console.group(`%c[${severity.toUpperCase()}] ${context.component}`, styles[severity]);
    console.error('Message:', message);
    if (stack) console.error('Stack:', stack);
    console.log('Context:', context);
    console.log('Timestamp:', new Date(context.timestamp).toISOString());
    console.groupEnd();
  }

  /**
   * Send error report to external service
   */
  private async sendErrorReport(report: ErrorReport): Promise<void> {
    if (!this.reportingEndpoint) return;

    const response = await fetch(this.reportingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...report,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error reporting failed: ${response.status}`);
    }
  }

  /**
   * Attempt automatic recovery from errors
   */
  private attemptRecovery(
    error: Error,
    context: ErrorContext,
    severity: ErrorReport['severity']
  ): void {
    // Reload page for critical errors
    if (severity === 'critical') {
      console.warn('Critical error detected, attempting page reload in 5 seconds...');
      setTimeout(() => {
        window.location.reload();
      }, 5000);
      return;
    }

    // Component-specific recovery strategies
    switch (context.component) {
      case 'canvas':
      case 'animation':
        // Stop animations and reset canvas
        this.recoverCanvas();
        break;
        
      case 'api':
      case 'github':
        // Clear cache and retry with fallback data
        this.recoverApiCall(context);
        break;
        
      case 'media':
      case 'video':
        // Reset media elements
        this.recoverMedia();
        break;
        
      default:
        // Generic recovery: clear component state
        this.genericRecovery(context);
    }
  }

  /**
   * Recovery strategies for specific component types
   */
  private recoverCanvas(): void {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
  }

  private recoverApiCall(context: ErrorContext): void {
    // Clear any cached API data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('api') || name.includes('github')) {
            caches.delete(name);
          }
        });
      });
    }
  }

  private recoverMedia(): void {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      video.pause();
      video.currentTime = 0;
    });

    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  private genericRecovery(context: ErrorContext): void {
    // Remove error classes from elements
    const elements = document.querySelectorAll('.error, .loading, .failed');
    elements.forEach(el => {
      el.classList.remove('error', 'loading', 'failed');
    });
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsBySeverity: Record<ErrorReport['severity'], number>;
    errorsByComponent: Record<string, number>;
    recentErrors: ErrorReport[];
  } {
    const errorsBySeverity = this.errorReports.reduce((acc, report) => {
      acc[report.severity] = (acc[report.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorReport['severity'], number>);

    const errorsByComponent = this.errorReports.reduce((acc, report) => {
      acc[report.context.component] = (acc[report.context.component] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors: this.errorReports.length,
      errorsBySeverity,
      errorsByComponent,
      recentErrors: this.errorReports.slice(0, 10),
    };
  }

  /**
   * Configure error reporting endpoint
   */
  setReportingEndpoint(endpoint: string): void {
    this.reportingEndpoint = endpoint;
  }

  /**
   * Clear error reports
   */
  clearErrorReports(): void {
    this.errorReports = [];
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Export utility functions
export const handleError = (
  error: Error, 
  context: ErrorContext, 
  severity: ErrorReport['severity'] = 'medium'
) => {
  errorHandler.handleError(error, context, severity);
};

export const handleAsync = <T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  fallbackValue?: T
) => {
  return errorHandler.handleAsync(operation, context, fallbackValue);
};

export const handleSync = <T>(
  operation: () => T,
  context: ErrorContext,
  fallbackValue?: T
) => {
  return errorHandler.handleSync(operation, context, fallbackValue);
};

export const createErrorBoundary = (
  component: string,
  fallbackRender?: () => string
) => {
  return errorHandler.createErrorBoundary(component, fallbackRender);
};