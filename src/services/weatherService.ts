import { WeatherData, Location } from '../types';

export class WeatherService {
  private baseUrl = 'https://api.open-meteo.com/v1';

  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
    // For now, return mock data to get the app working
    return {
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
        timestamp: new Date().toISOString(),
        weatherCode: 1,
      },
      weekly: {
        daily: [],
        location: 'Mock Location',
        timezone: 'UTC',
      },
      historical: {
        monthly: [],
        location: 'Mock Location',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  async searchLocations(query: string): Promise<Location[]> {
    // Mock search results
    return [
      {
        id: Date.now().toString(),
        name: query,
        country: 'Unknown',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
      },
    ];
  }
}

export const weatherService = new WeatherService();