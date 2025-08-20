import { ErrorInfo } from 'react';

export interface ErrorReport {
  error: Error;
  errorInfo?: ErrorInfo;
  context?: Record<string, any>;
  timestamp: number;
  userAgent: string;
  url: string;
}

export type ErrorType = 'network' | 'data' | 'user' | 'system' | 'validation';

export interface ProcessedError {
  type: ErrorType;
  message: string;
  details?: string;
  recoverable: boolean;
  userMessage: string;
}

export class ErrorHandlerService {
  private static instance: ErrorHandlerService;
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 50;

  static getInstance(): ErrorHandlerService {
    if (!ErrorHandlerService.instance) {
      ErrorHandlerService.instance = new ErrorHandlerService();
    }
    return ErrorHandlerService.instance;
  }

  /**
   * Process and categorize an error
   */
  processError(error: Error, context?: Record<string, any>): ProcessedError {
    const errorType = this.categorizeError(error);
    const userMessage = this.getUserFriendlyMessage(error, errorType);
    
    return {
      type: errorType,
      message: error.message,
      details: error.stack,
      recoverable: this.isRecoverable(error, errorType),
      userMessage,
    };
  }

  /**
   * Report an error for logging/monitoring
   */
  reportError(error: Error, errorInfo?: ErrorInfo, context?: Record<string, any>): void {
    const report: ErrorReport = {
      error,
      errorInfo,
      context,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Add to queue
    this.errorQueue.push(report);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error reported:', report);
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(report);
    }
  }

  /**
   * Categorize error by type
   */
  private categorizeError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Network errors
    if (
      name.includes('network') ||
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection')
    ) {
      return 'network';
    }

    // Validation errors
    if (
      name.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required') ||
      message.includes('format')
    ) {
      return 'validation';
    }

    // Data errors
    if (
      message.includes('parse') ||
      message.includes('json') ||
      message.includes('data') ||
      name.includes('syntax')
    ) {
      return 'data';
    }

    // User errors (permissions, authentication, etc.)
    if (
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('permission')
    ) {
      return 'user';
    }

    // Default to system error
    return 'system';
  }

  /**
   * Generate user-friendly error messages
   */
  private getUserFriendlyMessage(error: Error, type: ErrorType): string {
    switch (type) {
      case 'network':
        return 'Unable to connect to the weather service. Please check your internet connection and try again.';
      
      case 'data':
        return 'There was a problem processing the weather data. Please try refreshing the page.';
      
      case 'validation':
        return 'Please check your input and try again.';
      
      case 'user':
        return 'You don\'t have permission to perform this action.';
      
      case 'system':
      default:
        return 'Something went wrong. Please try again or refresh the page.';
    }
  }

  /**
   * Determine if an error is recoverable
   */
  private isRecoverable(error: Error, type: ErrorType): boolean {
    switch (type) {
      case 'network':
        return true; // Can retry network requests
      
      case 'validation':
        return true; // User can fix input
      
      case 'data':
        return true; // Can retry data operations
      
      case 'user':
        return false; // Permission issues usually can't be auto-resolved
      
      case 'system':
      default:
        return false; // System errors usually need manual intervention
    }
  }

  /**
   * Send error report to monitoring service
   */
  private async sendToMonitoring(report: ErrorReport): Promise<void> {
    try {
      // In a real application, this would send to a service like Sentry, LogRocket, etc.
      // For now, we'll just store it locally
      const reports = JSON.parse(localStorage.getItem('error-reports') || '[]');
      reports.push({
        ...report,
        error: {
          name: report.error.name,
          message: report.error.message,
          stack: report.error.stack,
        },
      });
      
      // Keep only last 100 reports
      if (reports.length > 100) {
        reports.splice(0, reports.length - 100);
      }
      
      localStorage.setItem('error-reports', JSON.stringify(reports));
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }

  /**
   * Get recent error reports (for debugging)
   */
  getRecentErrors(): ErrorReport[] {
    return [...this.errorQueue];
  }

  /**
   * Clear error queue
   */
  clearErrors(): void {
    this.errorQueue = [];
  }
}

// Export singleton instance
export const errorHandler = ErrorHandlerService.getInstance();