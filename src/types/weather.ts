export interface PrecipitationData {
  type: 'rain' | 'snow' | 'mixed' | 'none';
  intensity: number;
  probability: number;
  rate: number;
  total1h: number;
  total24h: number;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  precipitation: PrecipitationData;
  cloudCover: number;
  pressure: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  timestamp: string;
  weatherCode: number;
  visibility?: number;
}

export interface DailyForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  precipitation: PrecipitationData;
  humidity: number;
  windSpeed: number;
  windGust: number;
  weatherCode: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface WeeklyForecast {
  daily: DailyForecast[];
  location: string;
  timezone: string;
}

export interface MonthlyAverage {
  month: string;
  year: number;
  tempMin: number;
  tempMax: number;
  tempMean: number;
  precipitationTotal: number;
  precipitationDays: number;
  humidity: number;
  windSpeed: number;
}

export interface HistoricalData {
  monthly: MonthlyAverage[];
  location: string;
  startDate: string;
  endDate: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: PrecipitationData;
}

export interface TodayForecast {
  hourly: HourlyForecast[];
  location: string;
  timezone: string;
}

export interface WeatherData {
  current: CurrentWeather;
  weekly: WeeklyForecast;
  today: TodayForecast;
  historical: HistoricalData;
  lastUpdated: string;
}