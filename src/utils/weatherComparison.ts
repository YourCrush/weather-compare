import { CurrentWeather, Location } from '../types';

export interface WeatherDifference {
  type: 'temperature' | 'humidity' | 'wind' | 'pressure' | 'precipitation';
  value: number;
  unit: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface LocationComparison {
  location1: Location;
  location2: Location;
  weather1: CurrentWeather;
  weather2: CurrentWeather;
  differences: WeatherDifference[];
}

export class DifferenceCalculator {
  /**
   * Calculate differences between two weather conditions
   */
  static calculateDifferences(
    location1: Location,
    weather1: CurrentWeather,
    location2: Location,
    weather2: CurrentWeather
  ): LocationComparison {
    const differences: WeatherDifference[] = [];

    // Temperature difference
    const tempDiff = weather2.temperature - weather1.temperature;
    if (Math.abs(tempDiff) > 0.5) {
      differences.push({
        type: 'temperature',
        value: tempDiff,
        unit: '°C',
        description: this.getTemperatureDescription(tempDiff, location1.name, location2.name),
        severity: this.getTemperatureSeverity(Math.abs(tempDiff)),
      });
    }

    // Humidity difference
    const humidityDiff = weather2.humidity - weather1.humidity;
    if (Math.abs(humidityDiff) > 3) {
      differences.push({
        type: 'humidity',
        value: humidityDiff,
        unit: '%',
        description: this.getHumidityDescription(humidityDiff, location1.name, location2.name),
        severity: this.getHumiditySeverity(Math.abs(humidityDiff)),
      });
    }

    // Wind speed difference
    const windDiff = weather2.windSpeed - weather1.windSpeed;
    if (Math.abs(windDiff) > 1) {
      differences.push({
        type: 'wind',
        value: windDiff,
        unit: 'm/s',
        description: this.getWindDescription(windDiff, location1.name, location2.name),
        severity: this.getWindSeverity(Math.abs(windDiff)),
      });
    }

    // Pressure difference
    const pressureDiff = weather2.pressure - weather1.pressure;
    if (Math.abs(pressureDiff) > 2) {
      differences.push({
        type: 'pressure',
        value: pressureDiff,
        unit: 'hPa',
        description: this.getPressureDescription(pressureDiff, location1.name, location2.name),
        severity: this.getPressureSeverity(Math.abs(pressureDiff)),
      });
    }

    // Precipitation difference
    const precipDiff = weather2.precipitation.total24h - weather1.precipitation.total24h;
    if (Math.abs(precipDiff) > 0.5) {
      differences.push({
        type: 'precipitation',
        value: precipDiff,
        unit: 'mm',
        description: this.getPrecipitationDescription(precipDiff, location1.name, location2.name),
        severity: this.getPrecipitationSeverity(Math.abs(precipDiff)),
      });
    }

    return {
      location1,
      location2,
      weather1,
      weather2,
      differences,
    };
  }

  private static getTemperatureDescription(diff: number, loc1: string, loc2: string): string {
    const absDiff = Math.abs(diff);
    const warmerCooler = diff > 0 ? 'warmer' : 'cooler';
    
    if (absDiff < 2) {
      return `${loc2} is slightly ${warmerCooler} than ${loc1}`;
    } else if (absDiff < 5) {
      return `${loc2} is noticeably ${warmerCooler} than ${loc1}`;
    } else if (absDiff < 10) {
      return `${loc2} is significantly ${warmerCooler} than ${loc1}`;
    } else {
      return `${loc2} is much ${warmerCooler} than ${loc1}`;
    }
  }

  private static getHumidityDescription(diff: number, loc1: string, loc2: string): string {
    const absDiff = Math.abs(diff);
    const moreOrLess = diff > 0 ? 'more humid' : 'less humid';
    
    if (absDiff < 10) {
      return `${loc2} is slightly ${moreOrLess} than ${loc1}`;
    } else if (absDiff < 20) {
      return `${loc2} is noticeably ${moreOrLess} than ${loc1}`;
    } else {
      return `${loc2} is significantly ${moreOrLess} than ${loc1}`;
    }
  }

  private static getWindDescription(diff: number, loc1: string, loc2: string): string {
    const absDiff = Math.abs(diff);
    const windierCalmer = diff > 0 ? 'windier' : 'calmer';
    
    if (absDiff < 3) {
      return `${loc2} is slightly ${windierCalmer} than ${loc1}`;
    } else if (absDiff < 6) {
      return `${loc2} is noticeably ${windierCalmer} than ${loc1}`;
    } else {
      return `${loc2} is significantly ${windierCalmer} than ${loc1}`;
    }
  }

  private static getPressureDescription(diff: number, loc1: string, loc2: string): string {
    const higherLower = diff > 0 ? 'higher pressure' : 'lower pressure';
    return `${loc2} has ${higherLower} than ${loc1}`;
  }

  private static getPrecipitationDescription(diff: number, loc1: string, loc2: string): string {
    const wetterDrier = diff > 0 ? 'wetter' : 'drier';
    const absDiff = Math.abs(diff);
    
    if (absDiff < 2) {
      return `${loc2} is slightly ${wetterDrier} than ${loc1}`;
    } else if (absDiff < 5) {
      return `${loc2} is noticeably ${wetterDrier} than ${loc1}`;
    } else {
      return `${loc2} is significantly ${wetterDrier} than ${loc1}`;
    }
  }

  private static getTemperatureSeverity(diff: number): 'low' | 'medium' | 'high' {
    if (diff < 3) return 'low';
    if (diff < 8) return 'medium';
    return 'high';
  }

  private static getHumiditySeverity(diff: number): 'low' | 'medium' | 'high' {
    if (diff < 15) return 'low';
    if (diff < 30) return 'medium';
    return 'high';
  }

  private static getWindSeverity(diff: number): 'low' | 'medium' | 'high' {
    if (diff < 3) return 'low';
    if (diff < 7) return 'medium';
    return 'high';
  }

  private static getPressureSeverity(diff: number): 'low' | 'medium' | 'high' {
    if (diff < 5) return 'low';
    if (diff < 15) return 'medium';
    return 'high';
  }

  private static getPrecipitationSeverity(diff: number): 'low' | 'medium' | 'high' {
    if (diff < 2) return 'low';
    if (diff < 10) return 'medium';
    return 'high';
  }

  /**
   * Get weather condition description based on weather code
   */
  static getWeatherDescription(weatherCode: number): string {
    const weatherCodes: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail',
    };

    return weatherCodes[weatherCode] || 'Unknown conditions';
  }

  /**
   * Get comfort level based on temperature and humidity
   */
  static getComfortLevel(temperature: number, humidity: number): {
    level: 'comfortable' | 'mild' | 'uncomfortable';
    description: string;
  } {
    // Heat index calculation (simplified)
    const heatIndex = temperature + (0.5 * (humidity / 100) * (temperature - 14.5));
    
    if (temperature < 10 || temperature > 30) {
      return {
        level: 'uncomfortable',
        description: temperature < 10 ? 'Too cold' : 'Too hot',
      };
    }
    
    if (humidity > 70 || humidity < 30) {
      return {
        level: 'mild',
        description: humidity > 70 ? 'High humidity' : 'Low humidity',
      };
    }
    
    if (heatIndex > 27) {
      return {
        level: 'mild',
        description: 'Feels warm',
      };
    }
    
    return {
      level: 'comfortable',
      description: 'Pleasant conditions',
    };
  }
}