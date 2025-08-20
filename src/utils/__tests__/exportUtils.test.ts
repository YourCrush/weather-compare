import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToCSV, exportForecastToCSV, exportChartDataToCSV } from '../exportUtils';
import { Location, WeatherData } from '../../types';

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn(() => Promise.resolve({
    toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
  })),
}));

// Mock DOM methods
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
});

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
});

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
});

Object.defineProperty(URL, 'createObjectURL', {
  value: mockCreateObjectURL,
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL,
});

const mockLocation: Location = {
  id: '1',
  name: 'New York',
  country: 'United States',
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
  region: 'New York',
};

const mockWeatherData: WeatherData = {
  current: {
    temperature: 20,
    feelsLike: 18,
    humidity: 65,
    windSpeed: 5,
    windGust: 8,
    precipitation: {
      type: 'none',
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
          type: 'none',
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
    location: 'New York',
    timezone: 'America/New_York',
  },
  historical: {
    monthly: [],
    location: 'New York',
    startDate: '2022-01-01',
    endDate: '2023-12-01',
  },
  lastUpdated: '2023-12-01T12:00:00Z',
};

describe('exportUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock link element
    const mockLink = {
      download: '',
      href: '',
      click: mockClick,
    };
    
    mockCreateElement.mockReturnValue(mockLink);
    mockCreateObjectURL.mockReturnValue('blob:mock-url');
  });

  describe('exportToCSV', () => {
    it('exports current weather data to CSV', async () => {
      const locations = [mockLocation];
      const weatherDataMap = new Map([['1', mockWeatherData]]);

      await exportToCSV(locations, weatherDataMap);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('throws error when no locations provided', async () => {
      const locations: Location[] = [];
      const weatherDataMap = new Map();

      await expect(exportToCSV(locations, weatherDataMap)).rejects.toThrow('No locations to export');
    });

    it('handles missing weather data gracefully', async () => {
      const locations = [mockLocation];
      const weatherDataMap = new Map(); // Empty map

      await exportToCSV(locations, weatherDataMap);

      expect(mockCreateElement).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('escapes CSV fields properly', async () => {
      const locationWithQuotes: Location = {
        ...mockLocation,
        name: 'New "York" City',
      };
      
      const locations = [locationWithQuotes];
      const weatherDataMap = new Map([['1', mockWeatherData]]);

      await exportToCSV(locations, weatherDataMap);

      // Verify that the CSV generation doesn't throw errors with special characters
      expect(mockCreateElement).toHaveBeenCalled();
    });
  });

  describe('exportForecastToCSV', () => {
    it('exports forecast data to CSV', async () => {
      const locations = [mockLocation];
      const weatherDataMap = new Map([['1', mockWeatherData]]);

      await exportForecastToCSV(locations, weatherDataMap);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('throws error when no locations provided', async () => {
      const locations: Location[] = [];
      const weatherDataMap = new Map();

      await expect(exportForecastToCSV(locations, weatherDataMap)).rejects.toThrow('No locations to export');
    });

    it('handles empty forecast data', async () => {
      const weatherDataWithoutForecast = {
        ...mockWeatherData,
        weekly: {
          daily: [],
          location: 'New York',
          timezone: 'America/New_York',
        },
      };
      
      const locations = [mockLocation];
      const weatherDataMap = new Map([['1', weatherDataWithoutForecast]]);

      await exportForecastToCSV(locations, weatherDataMap);

      expect(mockCreateElement).toHaveBeenCalled();
    });
  });

  describe('exportChartDataToCSV', () => {
    it('exports chart data to CSV', async () => {
      const chartData = [
        { date: '2023-12-01', temperature: 20, humidity: 65 },
        { date: '2023-12-02', temperature: 22, humidity: 70 },
      ];

      await exportChartDataToCSV(chartData, 'test-chart');

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('throws error when no chart data provided', async () => {
      await expect(exportChartDataToCSV([], 'test')).rejects.toThrow('No chart data to export');
      await expect(exportChartDataToCSV(null as any, 'test')).rejects.toThrow('No chart data to export');
    });

    it('handles mixed data structures', async () => {
      const chartData = [
        { date: '2023-12-01', temperature: 20 },
        { date: '2023-12-02', temperature: 22, humidity: 70 },
        { date: '2023-12-03', pressure: 1013 },
      ];

      await exportChartDataToCSV(chartData, 'mixed-data');

      expect(mockCreateElement).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('uses default filename when not provided', async () => {
      const chartData = [{ test: 'data' }];

      await exportChartDataToCSV(chartData);

      const mockLink = mockCreateElement.mock.results[0].value;
      expect(mockLink.download).toContain('chart-data');
    });
  });

  describe('error handling', () => {
    it('handles DOM manipulation errors', async () => {
      mockCreateElement.mockImplementation(() => {
        throw new Error('DOM error');
      });

      const locations = [mockLocation];
      const weatherDataMap = new Map([['1', mockWeatherData]]);

      await expect(exportToCSV(locations, weatherDataMap)).rejects.toThrow('Failed to export CSV');
    });

    it('handles blob creation errors', async () => {
      mockCreateObjectURL.mockImplementation(() => {
        throw new Error('Blob error');
      });

      const locations = [mockLocation];
      const weatherDataMap = new Map([['1', mockWeatherData]]);

      await expect(exportToCSV(locations, weatherDataMap)).rejects.toThrow('Failed to export CSV');
    });
  });
});