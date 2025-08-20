/**
 * Retry mechanism with exponential backoff
 */
export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: any) => boolean;
}

export class RetryError extends Error {
  constructor(
    message: string,
    public attempts: number,
    public lastError: Error
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry if we've reached max attempts or if shouldRetry returns false
      if (attempt === maxAttempts || !shouldRetry(lastError)) {
        throw new RetryError(
          `Failed after ${attempt} attempts: ${lastError.message}`,
          attempt,
          lastError
        );
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );
      
      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;
      
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }
  
  throw lastError!;
}

/**
 * Default retry options for different scenarios
 */
export const retryPresets = {
  network: {
    maxAttempts: 3,
    baseDelay: 1000,
    shouldRetry: (error: any) => {
      // Retry on network errors, timeouts, and 5xx status codes
      return (
        error.name === 'NetworkError' ||
        error.code === 'NETWORK_ERROR' ||
        error.message?.includes('timeout') ||
        (error.status >= 500 && error.status < 600)
      );
    },
  },
  
  api: {
    maxAttempts: 2,
    baseDelay: 500,
    shouldRetry: (error: any) => {
      // Don't retry on client errors (4xx), only server errors (5xx)
      return error.status >= 500 && error.status < 600;
    },
  },
  
  critical: {
    maxAttempts: 5,
    baseDelay: 2000,
    maxDelay: 30000,
    shouldRetry: () => true,
  },
} as const;