import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateShareableURL,
  parseSharedURL,
  generateShortShareCode,
  resolveShortShareCode,
  hasShareParameters,
  clearShareParameters,
  copyToClipboard,
} from '../shareUtils';
import { Location, UserSettings } from '../../types';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.location
const mockLocation = {
  origin: 'https://example.com',
  pathname: '/weather-app',
  search: '',
  href: 'https://example.com/weather-app',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock window.history
const mockHistory = {
  replaceState: vi.fn(),
};

Object.defineProperty(window, 'history', {
  value: mockHistory,
});

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn(),
};

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
});

// Mock document.execCommand
const mockExecCommand = vi.fn();
Object.defineProperty(document, 'execCommand', {
  value: mockExecCommand,
});

const mockLocation1: Location = {
  id: '1',
  name: 'New York',
  country: 'United States',
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
  region: 'New York',
};

const mockSettings: UserSettings = {
  units: 'metric',
  theme: 'light',
  favorites: [],
  defaultView: 'summary',
  chartSettings: {
    sharedYAxis: false,
    showGrid: true,
    showLegend: true,
    animationEnabled: true,
  },
  autoRefresh: true,
  refreshInterval: 15,
};

describe('shareUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.search = '';
    mockLocation.href = 'https://example.com/weather-app';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateShareableURL', () => {
    it('generates a shareable URL with encoded data', () => {
      const locations = [mockLocation1];
      const url = generateShareableURL(locations, mockSettings);

      expect(url).toContain('https://example.com/weather-app');
      expect(url).toContain('share=');
    });

    it('handles empty locations array', () => {
      const url = generateShareableURL([], mockSettings);

      expect(url).toContain('https://example.com/weather-app');
      expect(url).toContain('share=');
    });

    it('includes relevant settings in the URL', () => {
      const locations = [mockLocation1];
      const url = generateShareableURL(locations, mockSettings);

      // The URL should contain encoded data
      expect(url).toMatch(/share=[A-Za-z0-9_-]+/);
    });

    it('throws error on encoding failure', () => {
      // Mock btoa to throw an error
      const originalBtoa = window.btoa;
      window.btoa = vi.fn(() => {
        throw new Error('Encoding failed');
      });

      expect(() => generateShareableURL([mockLocation1], mockSettings)).toThrow('Failed to generate share link');

      window.btoa = originalBtoa;
    });
  });

  describe('parseSharedURL', () => {
    it('returns null when no share parameter exists', () => {
      mockLocation.search = '';
      const result = parseSharedURL();
      expect(result).toBeNull();
    });

    it('parses valid share data from URL', () => {
      const shareData = {
        locations: [mockLocation1],
        settings: { units: 'metric', theme: 'light' },
        timestamp: Date.now(),
      };
      
      const encoded = btoa(JSON.stringify(shareData));
      mockLocation.search = `?share=${encoded}`;

      const result = parseSharedURL();
      expect(result).not.toBeNull();
      expect(result?.locations).toHaveLength(1);
      expect(result?.locations[0].name).toBe('New York');
    });

    it('returns null for invalid share data', () => {
      mockLocation.search = '?share=invalid-data';
      const result = parseSharedURL();
      expect(result).toBeNull();
    });

    it('returns null for expired share data', () => {
      const oldTimestamp = Date.now() - (31 * 24 * 60 * 60 * 1000); // 31 days ago
      const shareData = {
        locations: [mockLocation1],
        settings: { units: 'metric' },
        timestamp: oldTimestamp,
      };
      
      const encoded = btoa(JSON.stringify(shareData));
      mockLocation.search = `?share=${encoded}`;

      const result = parseSharedURL();
      expect(result).toBeNull();
    });

    it('handles malformed URL parameters', () => {
      mockLocation.search = '?share=not-base64!@#$';
      const result = parseSharedURL();
      expect(result).toBeNull();
    });
  });

  describe('generateShortShareCode', () => {
    it('generates a short share code', async () => {
      const code = await generateShortShareCode([mockLocation1], mockSettings);
      
      expect(code).toMatch(/^[A-Z0-9]{8}$/);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('stores data in localStorage', async () => {
      const code = await generateShortShareCode([mockLocation1], mockSettings);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        `share-${code}`,
        expect.stringContaining('New York')
      );
    });

    it('generates different codes for different data', async () => {
      const code1 = await generateShortShareCode([mockLocation1], mockSettings);
      
      const location2 = { ...mockLocation1, id: '2', name: 'London' };
      const code2 = await generateShortShareCode([location2], mockSettings);
      
      expect(code1).not.toBe(code2);
    });
  });

  describe('resolveShortShareCode', () => {
    it('resolves valid share code', () => {
      const shareData = {
        locations: [mockLocation1],
        settings: { units: 'metric' },
        timestamp: Date.now(),
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(shareData));
      
      const result = resolveShortShareCode('TESTCODE');
      expect(result).not.toBeNull();
      expect(result?.locations).toHaveLength(1);
    });

    it('returns null for non-existent code', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const result = resolveShortShareCode('INVALID');
      expect(result).toBeNull();
    });

    it('returns null for invalid stored data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      
      const result = resolveShortShareCode('TESTCODE');
      expect(result).toBeNull();
    });

    it('handles case-insensitive codes', () => {
      const shareData = {
        locations: [mockLocation1],
        settings: { units: 'metric' },
        timestamp: Date.now(),
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(shareData));
      
      const result = resolveShortShareCode('testcode');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('share-TESTCODE');
    });
  });

  describe('hasShareParameters', () => {
    it('returns true when share parameter exists', () => {
      mockLocation.search = '?share=test';
      expect(hasShareParameters()).toBe(true);
    });

    it('returns true when code parameter exists', () => {
      mockLocation.search = '?code=TEST123';
      expect(hasShareParameters()).toBe(true);
    });

    it('returns false when no share parameters exist', () => {
      mockLocation.search = '?other=param';
      expect(hasShareParameters()).toBe(false);
    });

    it('returns false when search is empty', () => {
      mockLocation.search = '';
      expect(hasShareParameters()).toBe(false);
    });
  });

  describe('clearShareParameters', () => {
    it('removes share parameters from URL', () => {
      mockLocation.href = 'https://example.com/weather-app?share=test&other=param';
      
      clearShareParameters();
      
      expect(mockHistory.replaceState).toHaveBeenCalledWith(
        {},
        expect.any(String),
        expect.stringContaining('other=param')
      );
      expect(mockHistory.replaceState).toHaveBeenCalledWith(
        {},
        expect.any(String),
        expect.not.stringContaining('share=')
      );
    });

    it('removes code parameters from URL', () => {
      mockLocation.href = 'https://example.com/weather-app?code=TEST123&other=param';
      
      clearShareParameters();
      
      expect(mockHistory.replaceState).toHaveBeenCalledWith(
        {},
        expect.any(String),
        expect.not.stringContaining('code=')
      );
    });
  });

  describe('copyToClipboard', () => {
    it('uses navigator.clipboard when available', async () => {
      Object.defineProperty(window, 'isSecureContext', { value: true });
      mockClipboard.writeText.mockResolvedValue(undefined);
      
      await copyToClipboard('test text');
      
      expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
    });

    it('falls back to execCommand when clipboard API unavailable', async () => {
      const originalClipboard = navigator.clipboard;
      delete (navigator as any).clipboard;
      
      const mockTextArea = {
        value: '',
        style: {},
        focus: vi.fn(),
        select: vi.fn(),
      };
      
      const mockCreateElement = vi.fn(() => mockTextArea);
      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();
      
      Object.defineProperty(document, 'createElement', { value: mockCreateElement });
      Object.defineProperty(document.body, 'appendChild', { value: mockAppendChild });
      Object.defineProperty(document.body, 'removeChild', { value: mockRemoveChild });
      
      mockExecCommand.mockReturnValue(true);
      
      await copyToClipboard('test text');
      
      expect(mockCreateElement).toHaveBeenCalledWith('textarea');
      expect(mockTextArea.value).toBe('test text');
      expect(mockExecCommand).toHaveBeenCalledWith('copy');
      
      // Restore
      Object.defineProperty(navigator, 'clipboard', { value: originalClipboard });
    });

    it('throws error when clipboard operations fail', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard error'));
      
      await expect(copyToClipboard('test')).rejects.toThrow('Failed to copy to clipboard');
    });

    it('throws error when execCommand fails', async () => {
      const originalClipboard = navigator.clipboard;
      delete (navigator as any).clipboard;
      
      mockExecCommand.mockReturnValue(false);
      
      await expect(copyToClipboard('test')).rejects.toThrow('Failed to copy to clipboard');
      
      // Restore
      Object.defineProperty(navigator, 'clipboard', { value: originalClipboard });
    });
  });
});