import { Units } from '../types';

export interface TemperatureValue {
  celsius: number;
  fahrenheit: number;
}

export interface SpeedValue {
  kmh: number;
  mph: number;
}

export interface PressureValue {
  hpa: number;
  inHg: number;
}

// Temperature conversions
export const convertTemperature = (celsius: number): TemperatureValue => ({
  celsius,
  fahrenheit: (celsius * 9/5) + 32,
});

export const formatTemperature = (celsius: number, units: Units): string => {
  const temp = convertTemperature(celsius);
  return units === 'metric' 
    ? `${Math.round(temp.celsius)}°C`
    : `${Math.round(temp.fahrenheit)}°F`;
};

// Speed conversions (wind speed)
export const convertSpeed = (kmh: number): SpeedValue => ({
  kmh,
  mph: kmh * 0.621371,
});

export const formatSpeed = (kmh: number, units: Units): string => {
  const speed = convertSpeed(kmh);
  return units === 'metric'
    ? `${Math.round(speed.kmh)} km/h`
    : `${Math.round(speed.mph)} mph`;
};

// Pressure conversions
export const convertPressure = (hpa: number): PressureValue => ({
  hpa,
  inHg: hpa * 0.02953,
});

export const formatPressure = (hpa: number, units: Units): string => {
  const pressure = convertPressure(hpa);
  return units === 'metric'
    ? `${Math.round(pressure.hpa)} hPa`
    : `${pressure.inHg.toFixed(2)} inHg`;
};

// Unit labels
export const getUnitLabels = (units: Units) => ({
  temperature: units === 'metric' ? '°C' : '°F',
  speed: units === 'metric' ? 'km/h' : 'mph',
  pressure: units === 'metric' ? 'hPa' : 'inHg',
});

// Unit system names
export const getUnitSystemName = (units: Units): string => {
  return units === 'metric' ? 'Metric' : 'Imperial';
};