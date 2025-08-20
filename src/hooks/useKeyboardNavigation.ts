import { useEffect, useCallback, useRef } from 'react';
import { keyboardNavigation } from '../utils/accessibility';

interface UseKeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  onTab?: (event: KeyboardEvent) => void;
  enabled?: boolean;
}

export const useKeyboardNavigation = (options: UseKeyboardNavigationOptions = {}) => {
  const {
    onEscape,
    onEnter,
    onSpace,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onHome,
    onEnd,
    onTab,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      case ' ':
        if (onSpace) {
          event.preventDefault();
          onSpace();
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown();
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight();
        }
        break;
      case 'Home':
        if (onHome) {
          event.preventDefault();
          onHome();
        }
        break;
      case 'End':
        if (onEnd) {
          event.preventDefault();
          onEnd();
        }
        break;
      case 'Tab':
        if (onTab) {
          onTab(event);
        }
        break;
    }
  }, [enabled, onEscape, onEnter, onSpace, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onHome, onEnd, onTab]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  return { handleKeyDown };
};

interface UseListNavigationOptions {
  items: HTMLElement[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  loop?: boolean;
  orientation?: 'horizontal' | 'vertical';
  enabled?: boolean;
}

export const useListNavigation = (options: UseListNavigationOptions) => {
  const {
    items,
    currentIndex,
    onIndexChange,
    loop = true,
    orientation = 'vertical',
    enabled = true,
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || items.length === 0) return;

    const isVertical = orientation === 'vertical';
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

    let newIndex = currentIndex;

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        if (currentIndex < items.length - 1) {
          newIndex = currentIndex + 1;
        } else if (loop) {
          newIndex = 0;
        }
        break;
      case prevKey:
        event.preventDefault();
        if (currentIndex > 0) {
          newIndex = currentIndex - 1;
        } else if (loop) {
          newIndex = items.length - 1;
        }
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      onIndexChange(newIndex);
      items[newIndex]?.focus();
    }
  }, [items, currentIndex, onIndexChange, loop, orientation, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  return { handleKeyDown };
};

interface UseFocusTrapOptions {
  enabled?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
}

export const useFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  options: UseFocusTrapOptions = {}
) => {
  const { enabled = true, autoFocus = true, restoreFocus = true } = options;
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    
    // Save currently focused element
    if (restoreFocus) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
    }

    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Auto focus first element
    if (autoFocus && firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      
      // Restore focus
      if (restoreFocus && previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [enabled, autoFocus, restoreFocus, containerRef]);
};