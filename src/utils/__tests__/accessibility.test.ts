import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateId,
  isFocusable,
  getFocusableElements,
  trapFocus,
  announceToScreenReader,
  keyboardNavigation,
  aria,
  focusManagement,
} from '../accessibility';

// Mock DOM methods
const mockFocus = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

describe('accessibility utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('generateId', () => {
    it('generates unique IDs with prefix', () => {
      const id1 = generateId('test');
      const id2 = generateId('test');
      
      expect(id1).toMatch(/^test-[a-z0-9]+$/);
      expect(id2).toMatch(/^test-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('uses default prefix when none provided', () => {
      const id = generateId();
      expect(id).toMatch(/^element-[a-z0-9]+$/);
    });
  });

  describe('isFocusable', () => {
    it('returns true for focusable elements', () => {
      const button = document.createElement('button');
      const input = document.createElement('input');
      const link = document.createElement('a');
      link.href = '#';

      expect(isFocusable(button)).toBe(true);
      expect(isFocusable(input)).toBe(true);
      expect(isFocusable(link)).toBe(true);
    });

    it('returns false for non-focusable elements', () => {
      const div = document.createElement('div');
      const span = document.createElement('span');
      const disabledButton = document.createElement('button');
      disabledButton.disabled = true;

      expect(isFocusable(div)).toBe(false);
      expect(isFocusable(span)).toBe(false);
      expect(isFocusable(disabledButton)).toBe(false);
    });

    it('returns true for elements with tabindex', () => {
      const div = document.createElement('div');
      div.tabIndex = 0;

      expect(isFocusable(div)).toBe(true);
    });
  });

  describe('getFocusableElements', () => {
    it('returns all focusable elements in container', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Button 1</button>
        <input type="text" />
        <div>Not focusable</div>
        <button>Button 2</button>
        <button disabled>Disabled</button>
        <a href="#">Link</a>
      `;

      const focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(4); // 2 buttons + input + link
    });

    it('returns empty array when no focusable elements', () => {
      const container = document.createElement('div');
      container.innerHTML = '<div>Not focusable</div><span>Also not focusable</span>';

      const focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(0);
    });
  });

  describe('trapFocus', () => {
    it('sets up focus trap and returns cleanup function', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>First</button>
        <button>Second</button>
        <button>Last</button>
      `;
      document.body.appendChild(container);

      // Mock focus method
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        button.focus = mockFocus;
      });

      container.addEventListener = mockAddEventListener;
      container.removeEventListener = mockRemoveEventListener;

      const cleanup = trapFocus(container);

      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockFocus).toHaveBeenCalled(); // Auto-focus first element

      cleanup();
      expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('announceToScreenReader', () => {
    it('creates announcement element with correct attributes', () => {
      announceToScreenReader('Test message', 'assertive');

      const announcement = document.querySelector('[aria-live="assertive"]');
      expect(announcement).toBeInTheDocument();
      expect(announcement).toHaveAttribute('aria-atomic', 'true');
      expect(announcement).toHaveClass('sr-only');
      expect(announcement).toHaveTextContent('Test message');
    });

    it('uses polite as default priority', () => {
      announceToScreenReader('Test message');

      const announcement = document.querySelector('[aria-live="polite"]');
      expect(announcement).toBeInTheDocument();
    });
  });

  describe('keyboardNavigation', () => {
    describe('handleArrowKeys', () => {
      it('navigates down with ArrowDown', () => {
        const items = [
          document.createElement('button'),
          document.createElement('button'),
          document.createElement('button'),
        ];
        items.forEach(item => { item.focus = mockFocus; });

        const onIndexChange = vi.fn();
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        event.preventDefault = vi.fn();

        keyboardNavigation.handleArrowKeys(event, items, 0, onIndexChange);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(onIndexChange).toHaveBeenCalledWith(1);
        expect(mockFocus).toHaveBeenCalled();
      });

      it('wraps to first item when at end', () => {
        const items = [document.createElement('button'), document.createElement('button')];
        items.forEach(item => { item.focus = mockFocus; });

        const onIndexChange = vi.fn();
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        event.preventDefault = vi.fn();

        keyboardNavigation.handleArrowKeys(event, items, 1, onIndexChange);

        expect(onIndexChange).toHaveBeenCalledWith(0);
      });

      it('navigates to first item with Home key', () => {
        const items = [document.createElement('button'), document.createElement('button')];
        items.forEach(item => { item.focus = mockFocus; });

        const onIndexChange = vi.fn();
        const event = new KeyboardEvent('keydown', { key: 'Home' });
        event.preventDefault = vi.fn();

        keyboardNavigation.handleArrowKeys(event, items, 1, onIndexChange);

        expect(onIndexChange).toHaveBeenCalledWith(0);
      });
    });

    describe('handleEscape', () => {
      it('calls onEscape when Escape key is pressed', () => {
        const onEscape = vi.fn();
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        event.preventDefault = vi.fn();

        keyboardNavigation.handleEscape(event, onEscape);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(onEscape).toHaveBeenCalled();
      });

      it('does not call onEscape for other keys', () => {
        const onEscape = vi.fn();
        const event = new KeyboardEvent('keydown', { key: 'Enter' });

        keyboardNavigation.handleEscape(event, onEscape);

        expect(onEscape).not.toHaveBeenCalled();
      });
    });

    describe('handleActivation', () => {
      it('calls onActivate for Enter key', () => {
        const onActivate = vi.fn();
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        event.preventDefault = vi.fn();

        keyboardNavigation.handleActivation(event, onActivate);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(onActivate).toHaveBeenCalled();
      });

      it('calls onActivate for Space key', () => {
        const onActivate = vi.fn();
        const event = new KeyboardEvent('keydown', { key: ' ' });
        event.preventDefault = vi.fn();

        keyboardNavigation.handleActivation(event, onActivate);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(onActivate).toHaveBeenCalled();
      });
    });
  });

  describe('aria helpers', () => {
    describe('expandable', () => {
      it('returns correct attributes for expanded state', () => {
        const attrs = aria.expandable(true, 'content-id');
        expect(attrs).toEqual({
          'aria-expanded': true,
          'aria-controls': 'content-id',
        });
      });

      it('returns correct attributes for collapsed state', () => {
        const attrs = aria.expandable(false);
        expect(attrs).toEqual({
          'aria-expanded': false,
        });
      });
    });

    describe('validation', () => {
      it('returns correct attributes for error state', () => {
        const attrs = aria.validation(true, 'error-id');
        expect(attrs).toEqual({
          'aria-invalid': true,
          'aria-describedby': 'error-id',
        });
      });

      it('returns correct attributes for valid state', () => {
        const attrs = aria.validation(false);
        expect(attrs).toEqual({
          'aria-invalid': false,
        });
      });
    });

    describe('loading', () => {
      it('returns correct attributes for loading state', () => {
        const attrs = aria.loading(true);
        expect(attrs).toEqual({
          'aria-busy': true,
          'aria-live': 'polite',
        });
      });

      it('returns correct attributes for non-loading state', () => {
        const attrs = aria.loading(false);
        expect(attrs).toEqual({
          'aria-busy': false,
        });
      });
    });

    describe('required', () => {
      it('returns correct attributes for required field', () => {
        const attrs = aria.required(true);
        expect(attrs).toEqual({
          'aria-required': true,
        });
      });

      it('returns correct attributes for optional field', () => {
        const attrs = aria.required(false);
        expect(attrs).toEqual({
          'aria-required': false,
        });
      });
    });
  });

  describe('focusManagement', () => {
    describe('saveFocus', () => {
      it('saves and restores focus', () => {
        const button = document.createElement('button');
        button.focus = mockFocus;
        document.body.appendChild(button);
        
        // Mock activeElement
        Object.defineProperty(document, 'activeElement', {
          value: button,
          writable: true,
        });

        const restoreFocus = focusManagement.saveFocus();
        restoreFocus();

        expect(mockFocus).toHaveBeenCalled();
      });
    });

    describe('focusFirstError', () => {
      it('focuses first element with aria-invalid="true"', () => {
        const container = document.createElement('div');
        const input1 = document.createElement('input');
        const input2 = document.createElement('input');
        
        input1.setAttribute('aria-invalid', 'false');
        input2.setAttribute('aria-invalid', 'true');
        input2.focus = mockFocus;
        
        container.appendChild(input1);
        container.appendChild(input2);

        const result = focusManagement.focusFirstError(container);

        expect(result).toBe(true);
        expect(mockFocus).toHaveBeenCalled();
      });

      it('returns false when no errors found', () => {
        const container = document.createElement('div');
        container.innerHTML = '<input><input>';

        const result = focusManagement.focusFirstError(container);

        expect(result).toBe(false);
      });
    });

    describe('focusById', () => {
      it('focuses element by ID', () => {
        const button = document.createElement('button');
        button.id = 'test-button';
        button.focus = mockFocus;
        document.body.appendChild(button);

        const result = focusManagement.focusById('test-button');

        expect(result).toBe(true);
        expect(mockFocus).toHaveBeenCalled();
      });

      it('uses fallback selector when ID not found', () => {
        const button = document.createElement('button');
        button.className = 'fallback-button';
        button.focus = mockFocus;
        document.body.appendChild(button);

        const result = focusManagement.focusById('non-existent', '.fallback-button');

        expect(result).toBe(true);
        expect(mockFocus).toHaveBeenCalled();
      });

      it('returns false when neither ID nor fallback found', () => {
        const result = focusManagement.focusById('non-existent', '.also-non-existent');

        expect(result).toBe(false);
      });
    });
  });
});