import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CityWeatherCard } from '../CityWeatherCard';
import { Location, WeatherData } from '../../../types';

// Mock the settings hook
const mockSettings = {
  formatTemperature: vi.fn((celsius: number) => ({ value: Math.round(celsius), unit: '°C' })),
  formatSpeed: vi.fn((mps: number) => ({ value: Math.round(mps * 3.6), unit: 'km/h' })),
  formatPressure: vi.fn((hpa: number) => ({ value: Math.round(hpa), unit: 'hPa' })),
};

vi.mock('../../../context', () => ({
  useSettings: () => mockSettings,
}));

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
        precipitation: {
          type: 'none',
          intensity: 0,
          probability: 10,
          rate: 0,
          total1h: 0,
          total24h: 0,
        },
        humidity: 60,
        windSpeed: 4,
        windGust: 7,
        weatherCode: 1,
        uvIndexMax: 4,
        sunrise: '07:00',
        sunset: '17:00',
      },
    ],
    location: 'New York',
    timezone: 'America/New_York',
  },
  historical: {
    monthly: [
      {
        month: '2023-11-01',
        year: 2023,
        tempMin: 10,
        tempMax: 20,
        tempMean: 15,
        precipitationTotal: 50,
        precipitationDays: 8,
        humidity: 70,
        windSpeed: 6,
      },
    ],
    location: 'New York',
    startDate: '2022-12-01',
    endDate: '2023-12-01',
  },
  lastUpdated: '2023-12-01T12:00:00Z',
};

describe('CityWeatherCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    render(
      <CityWeatherCard
        location={mockLocation}
        weatherData={mockWeatherData}
        isLoading={true}
      />
    );

    expect(screen.getByTestId('loading-skeleton') || document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders location information', () => {
    render(
      <CityWeatherCard
        location={mockLocation}
        weatherData={mockWeatherData}
      />
    );

    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('New York, United States')).toBeInTheDocument();
  });

  it('displays current temperature', () => {
    render(
      <CityWeatherCard
        location={mockLocation}
        weatherData={mockWeatherData}
      />
    );

    expect(screen.getByText('20°C')).toBeInTheDocument();
    expect(mockSettings.formatTemperature).toHaveBeenCalledWith(20);
  });

  it('shows weather condition description', () => {
    render(
      <CityWeatherCard
        location={mockLocation}
        weatherData={mockWeatherData}
      />
    );

    expect(screen.getByText('Mainly clear')).toBeInTheDocument();
  });

  it('displays comfort level indicator', () => {
    render(
      <CityWeatherCard
        location={mockLocation}
        weatherData={mockWeatherData}
      />
    );

    // Should show comfort description (calculated by DifferenceCalculator.getComfortLevel)
    expect(screen.getByText(/Pleasant conditions|High humidity|Low humidity|Too cold|Too hot|Feels warm/)).toBeInTheDocument();
  });

  it('renders current conditions section', () => {
    render(
      <CityWeatherCard
        location={mockLocation}
        weatherData={mockWeatherData}
      />
    );

    expect(screen.getByText('Current Conditions')).toBeInTheDocument();
  });

  it('renders weekly forecast section', () => {
    render(
      <CityWeatherCard
        location={mockLocation}
        weatherData={mockWeatherData}
      />
    );

    expect(screen.getByText('7-Day Forecast')).toBeInTheDocument();
  });

  it('renders historical overview section', () => {
    render(
      <CityWeatherCard
        location={mockLocation}
        weatherData={mockWeatherData}
      />
    );

    expect(screen.getByText('Historical Overview')).toBeInTheDocument();
  });

  it('shows timestamp in header', () => {
    render(
      <CityWeatherCard
        location={mockLocation}
        weatherData={mockWeatherData}
      />
    );

    // Should show formatted time from timestamp
    expect(screen.getByText(/\d{1,2}:\d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CityWeatherCard
        location={mockLocation}
        weatherData={mockWeatherData}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles location without region', () => {
    const locationWithoutRegion = {
      ...mockLocation,
      region: undefined,
    };

    render(
      <CityWeatherCard
        location={locationWithoutRegion}
        weatherData={mockWeatherData}
      />
    );

    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.queryByText('New York, United States')).not.toBeInTheDocument();
  });
});