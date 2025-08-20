import { RetryConfig } from '../types/errors';

/**
 * Retry utility with exponential backoff and jitter
 */
export class RetryUtil {
  private static readonly DEFAULT_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
  };

  /**
   * Execute a function with retry logic
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    let lastError: Error;

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // Don't retry on the last attempt
        if (attempt === finalConfig.maxRetries) {
          break;
        }

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          throw lastError;
        }

        // Calculate delay with exponential backoff and jitter
        const delay = this.calculateDelay(attempt, finalConfig);
        
        console.warn(`Operation failed (attempt ${attempt + 1}/${finalConfig.maxRetries + 1}), retrying in ${delay}ms:`, lastError.message);
        
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Determine if an error is retryable
   */
  private static isRetryableError(error: any): boolean {
    // Network errors are retryable
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true;
    }

    // HTTP 5xx errors are retryable
    if (error.status >= 500 && error.status < 600) {
      return true;
    }

    // Rate limiting (429) is retryable
    if (error.status === 429) {
      return true;
    }

    // Timeout errors are retryable
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return true;
    }

    // Don't retry client errors (4xx except 429)
    if (error.status >= 400 && error.status < 500 && error.status !== 429) {
      return false;
    }

    // Default to retryable for unknown errors
    return true;
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private static calculateDelay(attempt: number, config: RetryConfig): number {
    const exponentialDelay = config.baseDelay * Math.pow(config.backoffFactor, attempt);
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    const delay = Math.min(exponentialDelay + jitter, config.maxDelay);
    
    return Math.floor(delay);
  }

  /**
   * Sleep for specified milliseconds
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a retry wrapper for a function
   */
  static createRetryWrapper<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    config: Partial<RetryConfig> = {}
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      return this.withRetry(() => fn(...args), config);
    };
  }

  /**
   * Batch retry operations with concurrency control
   */
  static async batchWithRetry<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    options: {
      concurrency?: number;
      retryConfig?: Partial<RetryConfig>;
      failFast?: boolean;
    } = {}
  ): Promise<Array<{ item: T; result?: R; error?: Error }>> {
    const { concurrency = 3, retryConfig = {}, failFast = false } = options;
    const results: Array<{ item: T; result?: R; error?: Error }> = [];
    
    // Process items in batches
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      
      const batchPromises = batch.map(async (item) => {
        try {
          const result = await this.withRetry(() => operation(item), retryConfig);
          return { item, result };
        } catch (error) {
          const errorObj = error instanceof Error ? error : new Error('Unknown error');
          
          if (failFast) {
            throw errorObj;
          }
          
          return { item, error: errorObj };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Circuit breaker pattern implementation
   */
  static createCircuitBreaker<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options: {
      failureThreshold?: number;
      resetTimeout?: number;
      monitoringPeriod?: number;
    } = {}
  ): (...args: T) => Promise<R> {
    const {
      failureThreshold = 5,
      resetTimeout = 60000, // 1 minute
      monitoringPeriod = 10000, // 10 seconds
    } = options;

    let state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
    let failureCount = 0;
    let lastFailureTime = 0;
    let successCount = 0;

    return async (...args: T): Promise<R> => {
      const now = Date.now();

      // Reset failure count after monitoring period
      if (now - lastFailureTime > monitoringPeriod) {
        failureCount = 0;
        successCount = 0;
      }

      // Check circuit breaker state
      if (state === 'OPEN') {
        if (now - lastFailureTime < resetTimeout) {
          throw new Error('Circuit breaker is OPEN');
        }
        state = 'HALF_OPEN';
      }

      try {
        const result = await fn(...args);
        
        // Success - reset or close circuit
        if (state === 'HALF_OPEN') {
          successCount++;
          if (successCount >= 2) {
            state = 'CLOSED';
            failureCount = 0;
          }
        } else {
          failureCount = 0;
        }

        return result;
      } catch (error) {
        failureCount++;
        lastFailureTime = now;

        // Open circuit if threshold exceeded
        if (failureCount >= failureThreshold) {
          state = 'OPEN';
        }

        throw error;
      }
    };
  }
}