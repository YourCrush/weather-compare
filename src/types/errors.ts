export class WeatherApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'WeatherApiError';
  }
}

export class LocationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'LocationError';
  }
}

export class CacheError extends Error {
  constructor(message: string, public operation?: string) {
    super(message);
    this.name = 'CacheError';
  }
}

export class ExportError extends Error {
  constructor(message: string, public format?: string) {
    super(message);
    this.name = 'ExportError';
  }
}

export type ErrorType = 
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'LOCATION_ERROR'
  | 'CACHE_ERROR'
  | 'EXPORT_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: Date;
  stack?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}