// Re-export all types for easy importing
export * from './location';
export * from './weather';
export * from './app';
export * from './api';
export * from './export';
export * from './chart';

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Generic response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Generic error type
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}