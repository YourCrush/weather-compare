import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeEach(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
  console.log = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Mock fetch
global.fetch = vi.fn();

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(),
    readText: vi.fn(),
  },
  writable: true,
});

// Mock navigator.share
Object.defineProperty(navigator, 'share', {
  value: vi.fn(),
  writable: true,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    reload: vi.fn(),
    assign: vi.fn(),
    replace: vi.fn(),
  },
  writable: true,
});

// Mock window.history
Object.defineProperty(window, 'history', {
  value: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
    length: 1,
    state: null,
  },
  writable: true,
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntries: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
    clearResourceTimings: vi.fn(),
    setResourceTimingBufferSize: vi.fn(),
    toJSON: vi.fn(),
  },
  writable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn(id => clearTimeout(id));

// Mock requestIdleCallback
global.requestIdleCallback = vi.fn(cb => setTimeout(cb, 1));
global.cancelIdleCallback = vi.fn(id => clearTimeout(id));

// Mock Image constructor
global.Image = class {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  
  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 100);
  }
} as any;

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock document.execCommand
document.execCommand = vi.fn(() => true);

// Mock document.createElement for specific elements
const originalCreateElement = document.createElement;
document.createElement = vi.fn().mockImplementation((tagName: string) => {
  const element = originalCreateElement.call(document, tagName);
  
  if (tagName === 'a') {
    element.click = vi.fn();
  }
  
  if (tagName === 'canvas') {
    element.getContext = vi.fn(() => ({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Array(4) })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => ({ data: new Array(4) })),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      transform: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
    }));
    
    element.toDataURL = vi.fn(() => 'data:image/png;base64,mock-image-data');
  }
  
  return element;
});

// Global test utilities
global.testUtils = {
  // Helper to create mock weather data
  createMockWeatherData: () => ({
    current: {
      temperature: 20,
      feelsLike: 18,
      humidity: 65,
      windSpeed: 5,
      windGust: 8,
      precipitation: {
        type: 'none' as const,
        intensity: 0,
        probability: 0,
        rate: 0,
        total1h: 0,
        total24h: 0,
      },
      cloudCover: 25,
      pressure: 1013,
      uvIndex: 3,
      sunrise: '07:00',
      sunset: '17:00',
      timestamp: '2023-12-01T12:00:00Z',
      weatherCode: 1,
    },
    weekly: {
      daily: [
        {
          date: '2023-12-01',
          tempMin: 15,
          tempMax: 25,
          weatherCode: 1,
          precipitation: {
            type: 'none' as const,
            intensity: 0,
            probability: 0,
            rate: 0,
            total1h: 0,
            total24h: 0,
          },
          windSpeed: 5,
          windGust: 8,
        },
      ],
      location: 'Test Location',
      timezone: 'UTC',
    },
    historical: {
      monthly: [],
      location: 'Test Location',
      startDate: '2022-01-01',
      endDate: '2023-12-01',
    },
    lastUpdated: '2023-12-01T12:00:00Z',
  }),

  // Helper to create mock location
  createMockLocation: () => ({
    id: '1',
    name: 'Test Location',
    country: 'Test Country',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'UTC',
    region: 'Test Region',
  }),

  // Helper to wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to trigger resize events
  triggerResize: (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: height, writable: true });
    window.dispatchEvent(new Event('resize'));
  },
};

// Type declarations for global test utilities
declare global {
  var testUtils: {
    createMockWeatherData: () => any;
    createMockLocation: () => any;
    waitFor: (ms: number) => Promise<void>;
    triggerResize: (width: number, height: number) => void;
  };
}