/**
 * Performance optimization utilities
 */

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle function to limit how often a function can be called
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Memoization utility for expensive calculations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * LRU Cache implementation for memory-efficient caching
 */
export class LRUCache<K, V> {
  private maxSize: number;
  private cache: Map<K, V>;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Performance monitoring utilities
 */
export const performance = {
  /**
   * Measure execution time of a function
   */
  measure: async <T>(name: string, fn: () => Promise<T> | T): Promise<T> => {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      console.log(`Performance: ${name} took ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.log(`Performance: ${name} failed after ${duration}ms`);
      throw error;
    }
  },

  /**
   * Mark performance timing
   */
  mark: (name: string): void => {
    if (window.performance && window.performance.mark) {
      window.performance.mark(name);
    }
  },

  /**
   * Measure between two marks
   */
  measureBetween: (name: string, startMark: string, endMark: string): void => {
    if (window.performance && window.performance.measure) {
      window.performance.measure(name, startMark, endMark);
    }
  },

  /**
   * Get performance entries
   */
  getEntries: (type?: string): PerformanceEntry[] => {
    if (window.performance && window.performance.getEntriesByType) {
      return type 
        ? window.performance.getEntriesByType(type)
        : window.performance.getEntries();
    }
    return [];
  },
};

/**
 * Image optimization utilities
 */
export const imageOptimization = {
  /**
   * Lazy load images with Intersection Observer
   */
  lazyLoad: (selector: string = 'img[data-src]'): void => {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without Intersection Observer
      const images = document.querySelectorAll(selector);
      images.forEach((img: any) => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
      });
      return;
    }

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    const images = document.querySelectorAll(selector);
    images.forEach(img => imageObserver.observe(img));
  },

  /**
   * Preload critical images
   */
  preload: (urls: string[]): Promise<void[]> => {
    return Promise.all(
      urls.map(url => 
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        })
      )
    );
  },
};

/**
 * Bundle optimization utilities
 */
export const bundleOptimization = {
  /**
   * Dynamic import with error handling
   */
  dynamicImport: async <T>(importFn: () => Promise<T>): Promise<T> => {
    try {
      return await importFn();
    } catch (error) {
      console.error('Dynamic import failed:', error);
      throw new Error('Failed to load module');
    }
  },

  /**
   * Preload module for faster subsequent imports
   */
  preloadModule: (moduleUrl: string): void => {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = moduleUrl;
    document.head.appendChild(link);
  },
};

/**
 * Memory optimization utilities
 */
export const memoryOptimization = {
  /**
   * Cleanup function to remove event listeners and observers
   */
  cleanup: (cleanupFunctions: (() => void)[]): void => {
    cleanupFunctions.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Cleanup function failed:', error);
      }
    });
  },

  /**
   * Weak reference utility for avoiding memory leaks
   */
  createWeakRef: <T extends object>(obj: T): WeakRef<T> | T => {
    if (typeof WeakRef !== 'undefined') {
      return new WeakRef(obj);
    }
    // Fallback for browsers without WeakRef support
    return obj;
  },

  /**
   * Check memory usage (if available)
   */
  getMemoryInfo: (): any => {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  },
};