import React, { useCallback, useRef, useMemo, useEffect, useState } from 'react';
import { debounce, throttle, memoize } from '../utils/performance';

/**
 * Hook for debounced callbacks
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T => {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay, ...deps]
  );

  return debouncedCallback as T;
};

/**
 * Hook for throttled callbacks
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
  deps: React.DependencyList = []
): T => {
  const throttledCallback = useMemo(
    () => throttle(callback, limit),
    [callback, limit, ...deps]
  );

  return throttledCallback as T;
};

/**
 * Hook for memoized expensive calculations
 */
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  getKey?: (...args: Parameters<T>) => string
): T => {
  const memoizedCallback = useMemo(
    () => memoize(callback, getKey),
    [callback, getKey]
  );

  return memoizedCallback;
};

/**
 * Hook for performance monitoring
 */
export const usePerformanceMonitor = (name: string) => {
  const startTimeRef = useRef<number>();

  const start = useCallback(() => {
    startTimeRef.current = performance.now();
    if (window.performance?.mark) {
      window.performance.mark(`${name}-start`);
    }
  }, [name]);

  const end = useCallback(() => {
    if (startTimeRef.current) {
      const duration = performance.now() - startTimeRef.current;
      console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
      
      if (window.performance?.mark && window.performance?.measure) {
        window.performance.mark(`${name}-end`);
        window.performance.measure(name, `${name}-start`, `${name}-end`);
      }
    }
  }, [name]);

  const measure = useCallback(async <T>(fn: () => Promise<T> | T): Promise<T> => {
    start();
    try {
      const result = await fn();
      end();
      return result;
    } catch (error) {
      end();
      throw error;
    }
  }, [start, end]);

  return { start, end, measure };
};

/**
 * Hook for lazy loading with Intersection Observer
 */
export const useLazyLoad = (
  threshold: number = 0.1,
  rootMargin: string = '50px'
) => {
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver>();
  const isVisibleRef = useRef(false);

  const observe = useCallback((callback: () => void) => {
    if (!elementRef.current) return;

    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !isVisibleRef.current) {
              isVisibleRef.current = true;
              callback();
              observerRef.current?.unobserve(entry.target);
            }
          });
        },
        { threshold, rootMargin }
      );

      observerRef.current.observe(elementRef.current);
    } else {
      // Fallback for browsers without Intersection Observer
      callback();
    }
  }, [threshold, rootMargin]);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { elementRef, observe, disconnect, isVisible: isVisibleRef.current };
};

/**
 * Hook for virtual scrolling optimization
 */
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const scrollTop = useRef(0);
  const containerRef = useRef<HTMLElement>(null);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop.current / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop.current + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [items.length, itemHeight, containerHeight, overscan, scrollTop.current]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    scrollTop.current = event.currentTarget.scrollTop;
  }, []);

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange,
  };
};

/**
 * Hook for optimized re-renders
 */
export const useOptimizedRender = <T>(
  value: T,
  isEqual?: (prev: T, next: T) => boolean
): T => {
  const ref = useRef<T>(value);

  const areEqual = isEqual || ((prev: T, next: T) => {
    return JSON.stringify(prev) === JSON.stringify(next);
  });

  if (!areEqual(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
};

/**
 * Hook for batch updates
 */
export const useBatchUpdates = <T>(
  initialValue: T,
  batchDelay: number = 16 // ~60fps
) => {
  const [state, setState] = React.useState(initialValue);
  const pendingUpdatesRef = useRef<((prev: T) => T)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchUpdate = useCallback((updater: (prev: T) => T) => {
    pendingUpdatesRef.current.push(updater);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prevState => {
        return pendingUpdatesRef.current.reduce(
          (acc, updater) => updater(acc),
          prevState
        );
      });
      pendingUpdatesRef.current = [];
    }, batchDelay);
  }, [batchDelay]);

  const flushUpdates = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (pendingUpdatesRef.current.length > 0) {
      setState(prevState => {
        return pendingUpdatesRef.current.reduce(
          (acc, updater) => updater(acc),
          prevState
        );
      });
      pendingUpdatesRef.current = [];
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchUpdate, flushUpdates] as const;
};