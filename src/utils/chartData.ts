import { WeatherData, Location, TemperatureChartData, PrecipitationChartData, WindChartData, HistoricalChartData } from '../types';

export class ChartDataTransformer {
  /**
   * Transform weather data into temperature chart format
   */
  static transformTemperatureData(
    locationsWithData: Array<{ location: Location; data: WeatherData }>
  ): TemperatureChartData[] {
    if (locationsWithData.length === 0) return [];

    // Get the maximum number of forecast days across all locations
    const maxDays = Math.max(
      ...locationsWithData.map(({ data }) => data.weekly.daily.length)
    );

    const chartData: TemperatureChartData[] = [];

    for (let i = 0; i < maxDays; i++) {
      const dataPoint: TemperatureChartData = { date: '' };

      locationsWithData.forEach(({ location, data }) => {
        const dailyData = data.weekly.daily[i];
        if (dailyData) {
          if (!dataPoint.date) {
            dataPoint.date = dailyData.date;
          }
          // Use average of min and max for the line chart
          dataPoint[location.name] = (dailyData.tempMin + dailyData.tempMax) / 2;
        }
      });

      if (dataPoint.date) {
        chartData.push(dataPoint);
      }
    }

    return chartData;
  }

  /**
   * Transform weather data into precipitation chart format
   */
  static transformPrecipitationData(
    locationsWithData: Array<{ location: Location; data: WeatherData }>
  ): PrecipitationChartData[] {
    if (locationsWithData.length === 0) return [];

    const maxDays = Math.max(
      ...locationsWithData.map(({ data }) => data.weekly.daily.length)
    );

    const chartData: PrecipitationChartData[] = [];

    for (let i = 0; i < maxDays; i++) {
      const dataPoint: PrecipitationChartData = { date: '' };

      locationsWithData.forEach(({ location, data }) => {
        const dailyData = data.weekly.daily[i];
        if (dailyData) {
          if (!dataPoint.date) {
            dataPoint.date = dailyData.date;
          }
          dataPoint[location.name] = dailyData.precipitation.total24h || 0;
        }
      });

      if (dataPoint.date) {
        chartData.push(dataPoint);
      }
    }

    return chartData;
  }

  /**
   * Transform weather data into wind chart format
   */
  static transformWindData(
    locationsWithData: Array<{ location: Location; data: WeatherData }>
  ): WindChartData[] {
    if (locationsWithData.length === 0) return [];

    const maxDays = Math.max(
      ...locationsWithData.map(({ data }) => data.weekly.daily.length)
    );

    const chartData: WindChartData[] = [];

    for (let i = 0; i < maxDays; i++) {
      const dataPoint: WindChartData = { date: '' };

      locationsWithData.forEach(({ location, data }) => {
        const dailyData = data.weekly.daily[i];
        if (dailyData) {
          if (!dataPoint.date) {
            dataPoint.date = dailyData.date;
          }
          dataPoint[location.name] = dailyData.windSpeed;
        }
      });

      if (dataPoint.date) {
        chartData.push(dataPoint);
      }
    }

    return chartData;
  }

  /**
   * Transform historical data into chart format
   */
  static transformHistoricalData(
    locationsWithData: Array<{ location: Location; data: WeatherData }>
  ): HistoricalChartData[] {
    if (locationsWithData.length === 0) return [];

    // Find all unique months across all locations
    const allMonths = new Set<string>();
    locationsWithData.forEach(({ data }) => {
      data.historical.monthly.forEach(month => {
        allMonths.add(month.month);
      });
    });

    // Sort months chronologically
    const sortedMonths = Array.from(allMonths).sort();

    const chartData: HistoricalChartData[] = [];

    sortedMonths.forEach(month => {
      const dataPoint: HistoricalChartData = { month };

      locationsWithData.forEach(({ location, data }) => {
        const monthlyData = data.historical.monthly.find(m => m.month === month);
        if (monthlyData) {
          dataPoint[location.name] = monthlyData.tempMean;
        }
      });

      chartData.push(dataPoint);
    });

    return chartData;
  }

  /**
   * Get current temperature data for comparison
   */
  static getCurrentTemperatureData(
    locationsWithData: Array<{ location: Location; data: WeatherData }>
  ): Array<{ location: string; temperature: number; feelsLike: number }> {
    return locationsWithData.map(({ location, data }) => ({
      location: location.name,
      temperature: data.current.temperature,
      feelsLike: data.current.feelsLike,
    }));
  }

  /**
   * Get current conditions summary for all locations
   */
  static getCurrentConditionsSummary(
    locationsWithData: Array<{ location: Location; data: WeatherData }>
  ): Array<{
    location: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    pressure: number;
  }> {
    return locationsWithData.map(({ location, data }) => ({
      location: location.name,
      temperature: data.current.temperature,
      humidity: data.current.humidity,
      windSpeed: data.current.windSpeed,
      precipitation: data.current.precipitation.total24h,
      pressure: data.current.pressure,
    }));
  }

  /**
   * Calculate data ranges for chart scaling
   */
  static calculateDataRanges(
    locationsWithData: Array<{ location: Location; data: WeatherData }>
  ): {
    temperature: { min: number; max: number };
    precipitation: { min: number; max: number };
    wind: { min: number; max: number };
    pressure: { min: number; max: number };
  } {
    if (locationsWithData.length === 0) {
      return {
        temperature: { min: 0, max: 30 },
        precipitation: { min: 0, max: 10 },
        wind: { min: 0, max: 10 },
        pressure: { min: 1000, max: 1020 },
      };
    }

    const temperatures: number[] = [];
    const precipitations: number[] = [];
    const winds: number[] = [];
    const pressures: number[] = [];

    locationsWithData.forEach(({ data }) => {
      // Current conditions
      temperatures.push(data.current.temperature, data.current.feelsLike);
      precipitations.push(data.current.precipitation.total24h);
      winds.push(data.current.windSpeed, data.current.windGust);
      pressures.push(data.current.pressure);

      // Weekly forecast
      data.weekly.daily.forEach(day => {
        temperatures.push(day.tempMin, day.tempMax);
        precipitations.push(day.precipitation.total24h || 0);
        winds.push(day.windSpeed, day.windGust);
      });

      // Historical data
      data.historical.monthly.forEach(month => {
        temperatures.push(month.tempMin, month.tempMax, month.tempMean);
        precipitations.push(month.precipitationTotal);
        winds.push(month.windSpeed);
      });
    });

    return {
      temperature: {
        min: Math.min(...temperatures) - 2,
        max: Math.max(...temperatures) + 2,
      },
      precipitation: {
        min: 0,
        max: Math.max(...precipitations, 10) * 1.1,
      },
      wind: {
        min: 0,
        max: Math.max(...winds, 5) * 1.1,
      },
      pressure: {
        min: Math.min(...pressures) - 5,
        max: Math.max(...pressures) + 5,
      },
    };
  }

  /**
   * Filter data by date range
   */
  static filterByDateRange<T extends { date?: string; month?: string }>(
    data: T[],
    startDate: Date,
    endDate: Date
  ): T[] {
    return data.filter(item => {
      const itemDate = new Date(item.date || item.month || '');
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  /**
   * Resample data to reduce chart complexity
   */
  static resampleData<T extends { date?: string; month?: string }>(
    data: T[],
    maxPoints: number = 50
  ): T[] {
    if (data.length <= maxPoints) {
      return data;
    }

    const step = Math.ceil(data.length / maxPoints);
    const resampled: T[] = [];

    for (let i = 0; i < data.length; i += step) {
      resampled.push(data[i]);
    }

    return resampled;
  }
}