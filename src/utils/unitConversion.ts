import { Units } from '../types';

export class UnitConverter {
  /**
   * Convert temperature between Celsius and Fahrenheit
   */
  static convertTemperature(celsius: number, targetUnit: Units): { value: number; unit: string } {
    if (targetUnit === 'imperial') {
      return {
        value: Math.round((celsius * 9/5) + 32),
        unit: '°F',
      };
    }
    return {
      value: Math.round(celsius),
      unit: '°C',
    };
  }

  /**
   * Convert speed from m/s to target unit
   */
  static convertSpeed(mps: number, targetUnit: Units): { value: number; unit: string } {
    if (targetUnit === 'imperial') {
      // Convert m/s to mph
      return {
        value: Math.round(mps * 2.237),
        unit: 'mph',
      };
    }
    // Convert m/s to km/h
    return {
      value: Math.round(mps * 3.6),
      unit: 'km/h',
    };
  }

  /**
   * Convert pressure from hPa to target unit
   */
  static convertPressure(hpa: number, targetUnit: Units): { value: number; unit: string } {
    if (targetUnit === 'imperial') {
      // Convert hPa to inHg
      return {
        value: Math.round((hpa * 0.02953) * 100) / 100,
        unit: 'inHg',
      };
    }
    return {
      value: Math.round(hpa),
      unit: 'hPa',
    };
  }

  /**
   * Convert distance from km to target unit
   */
  static convertDistance(km: number, targetUnit: Units): { value: number; unit: string } {
    if (targetUnit === 'imperial') {
      return {
        value: Math.round(km * 0.621371),
        unit: 'mi',
      };
    }
    return {
      value: Math.round(km),
      unit: 'km',
    };
  }

  /**
   * Convert precipitation from mm to target unit
   */
  static convertPrecipitation(mm: number, targetUnit: Units): { value: number; unit: string } {
    if (targetUnit === 'imperial') {
      return {
        value: Math.round((mm * 0.0393701) * 100) / 100,
        unit: 'in',
      };
    }
    return {
      value: Math.round(mm * 10) / 10,
      unit: 'mm',
    };
  }

  /**
   * Get unit labels for display
   */
  static getUnitLabels(units: Units): {
    temperature: string;
    speed: string;
    pressure: string;
    distance: string;
    precipitation: string;
  } {
    if (units === 'imperial') {
      return {
        temperature: '°F',
        speed: 'mph',
        pressure: 'inHg',
        distance: 'mi',
        precipitation: 'in',
      };
    }
    return {
      temperature: '°C',
      speed: 'km/h',
      pressure: 'hPa',
      distance: 'km',
      precipitation: 'mm',
    };
  }

  /**
   * Format temperature with proper unit
   */
  static formatTemperature(celsius: number, units: Units, precision: number = 0): string {
    const converted = this.convertTemperature(celsius, units);
    return `${converted.value.toFixed(precision)}${converted.unit}`;
  }

  /**
   * Format speed with proper unit
   */
  static formatSpeed(mps: number, units: Units, precision: number = 0): string {
    const converted = this.convertSpeed(mps, units);
    return `${converted.value.toFixed(precision)} ${converted.unit}`;
  }

  /**
   * Format pressure with proper unit
   */
  static formatPressure(hpa: number, units: Units, precision: number = 0): string {
    const converted = this.convertPressure(hpa, units);
    return `${converted.value.toFixed(precision)} ${converted.unit}`;
  }

  /**
   * Format precipitation with proper unit
   */
  static formatPrecipitation(mm: number, units: Units, precision: number = 1): string {
    const converted = this.convertPrecipitation(mm, units);
    return `${converted.value.toFixed(precision)} ${converted.unit}`;
  }

  /**
   * Convert all weather data to target units
   */
  static convertWeatherData(data: any, targetUnits: Units): any {
    // This would be used to convert entire weather data objects
    // Implementation depends on the specific data structure
    return {
      ...data,
      temperature: this.convertTemperature(data.temperature, targetUnits),
      windSpeed: this.convertSpeed(data.windSpeed, targetUnits),
      pressure: this.convertPressure(data.pressure, targetUnits),
      // Add more conversions as needed
    };
  }

  /**
   * Validate unit conversion inputs
   */
  static validateInput(value: number, type: 'temperature' | 'speed' | 'pressure' | 'distance' | 'precipitation'): boolean {
    if (typeof value !== 'number' || isNaN(value)) {
      return false;
    }

    switch (type) {
      case 'temperature':
        return value >= -273.15; // Absolute zero in Celsius
      case 'speed':
        return value >= 0;
      case 'pressure':
        return value > 0;
      case 'distance':
        return value >= 0;
      case 'precipitation':
        return value >= 0;
      default:
        return false;
    }
  }

  /**
   * Get conversion factor between units
   */
  static getConversionFactor(type: 'temperature' | 'speed' | 'pressure' | 'distance' | 'precipitation', fromUnit: Units, toUnit: Units): number {
    if (fromUnit === toUnit) return 1;

    switch (type) {
      case 'speed':
        if (fromUnit === 'metric' && toUnit === 'imperial') return 2.237; // m/s to mph
        if (fromUnit === 'imperial' && toUnit === 'metric') return 0.44704; // mph to m/s
        break;
      case 'pressure':
        if (fromUnit === 'metric' && toUnit === 'imperial') return 0.02953; // hPa to inHg
        if (fromUnit === 'imperial' && toUnit === 'metric') return 33.8639; // inHg to hPa
        break;
      case 'distance':
        if (fromUnit === 'metric' && toUnit === 'imperial') return 0.621371; // km to mi
        if (fromUnit === 'imperial' && toUnit === 'metric') return 1.60934; // mi to km
        break;
      case 'precipitation':
        if (fromUnit === 'metric' && toUnit === 'imperial') return 0.0393701; // mm to in
        if (fromUnit === 'imperial' && toUnit === 'metric') return 25.4; // in to mm
        break;
    }
    
    return 1;
  }
}