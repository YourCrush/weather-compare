import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, throttle, memoize, LRUCache } from '../performance';

describe('performance utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllTimers();
  });

  describe('debounce', () => {
    it('delays function execution', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('cancels previous calls', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('executes immediately when immediate is true', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100, true);

      debouncedFn();
      expect(fn).toHaveBeenCalledTimes(1);

      debouncedFn();
      expect(fn).toHaveBeenCalledTimes(1); // Should not call again
    });

    it('passes arguments correctly', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('arg1', 'arg2');
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('throttle', () => {
    it('limits function calls', () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      throttledFn();

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('passes arguments correctly', () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn('arg1', 'arg2');
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('memoize', () => {
    it('caches function results', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoizedFn = memoize(fn);

      const result1 = memoizedFn(5);
      const result2 = memoizedFn(5);

      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('uses custom key function', () => {
      const fn = vi.fn((obj: { id: number; name: string }) => obj.name.toUpperCase());
      const memoizedFn = memoize(fn, (obj) => obj.id.toString());

      const obj1 = { id: 1, name: 'test' };
      const obj2 = { id: 1, name: 'different' }; // Same ID, different name

      const result1 = memoizedFn(obj1);
      const result2 = memoizedFn(obj2);

      expect(result1).toBe('TEST');
      expect(result2).toBe('TEST'); // Should return cached result
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('handles different arguments', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoizedFn = memoize(fn);

      memoizedFn(5);
      memoizedFn(10);
      memoizedFn(5); // Should use cache

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('LRUCache', () => {
    it('stores and retrieves values', () => {
      const cache = new LRUCache<string, number>(3);

      cache.set('a', 1);
      cache.set('b', 2);

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBeUndefined();
    });

    it('evicts least recently used items', () => {
      const cache = new LRUCache<string, number>(2);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3); // Should evict 'a'

      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
    });

    it('updates LRU order on access', () => {
      const cache = new LRUCache<string, number>(2);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.get('a'); // Access 'a' to make it recently used
      cache.set('c', 3); // Should evict 'b', not 'a'

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBe(3);
    });

    it('checks if key exists', () => {
      const cache = new LRUCache<string, number>(3);

      cache.set('a', 1);

      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(false);
    });

    it('deletes items', () => {
      const cache = new LRUCache<string, number>(3);

      cache.set('a', 1);
      expect(cache.has('a')).toBe(true);

      cache.delete('a');
      expect(cache.has('a')).toBe(false);
    });

    it('clears all items', () => {
      const cache = new LRUCache<string, number>(3);

      cache.set('a', 1);
      cache.set('b', 2);

      expect(cache.size()).toBe(2);

      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(false);
    });

    it('returns correct size', () => {
      const cache = new LRUCache<string, number>(3);

      expect(cache.size()).toBe(0);

      cache.set('a', 1);
      expect(cache.size()).toBe(1);

      cache.set('b', 2);
      expect(cache.size()).toBe(2);

      cache.delete('a');
      expect(cache.size()).toBe(1);
    });

    it('handles updates to existing keys', () => {
      const cache = new LRUCache<string, number>(2);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('a', 10); // Update existing key

      expect(cache.size()).toBe(2);
      expect(cache.get('a')).toBe(10);
      expect(cache.get('b')).toBe(2);
    });
  });
});