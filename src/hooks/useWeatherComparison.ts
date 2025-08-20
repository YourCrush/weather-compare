import { useMemo } from 'react';
import { useAppContext, useWeatherData, useSettings } from '../context';
import { Location, WeatherData, CurrentWeather } from '../types';

interface WeatherComparison {
  location: Location;
  data: WeatherData | undefined;
  isLoading: boolean;
}

interface ComparisonInsight {
  type: 'temperature' | 'humidity' | 'wind' | 'precipitation';
  message: string;
  difference: number;
  unit: string;
}

export const useWeatherComparison = () => {
  const { state } = useAppContext();
  const { isLocationDataLoading, getLocationWeatherData } = useWeatherData();
  const { formatTemperature, formatSpeed } = useSettings();

  // Get weather data for all locations
  const comparisons = useMemo((): WeatherComparison[] => {
    return state.locations.map(location => ({
      location,
      data: getLocationWeatherData(location.id),
      isLoading: isLocationDataLoading(location.id),
    }));
  }, [state.locations, getLocationWeatherData, isLocationDataLoading]);

  // Get locations with complete data
  const locationsWithData = useMemo(() => {
    return comparisons.filter(comp => comp.data && comp.data.current);
  }, [comparisons]);

  // Generate comparison insights
  const insights = useMemo((): ComparisonInsight[] => {
    if (locationsWithData.length < 2) {
      return [];
    }

    const insights: ComparisonInsight[] = [];
    const baseLocation = locationsWithData[0];
    const baseWeather = baseLocation.data!.current;

    for (let i = 1; i < locationsWithData.length; i++) {
      const compareLocation = locationsWithData[i];
      const compareWeather = compareLocation.data!.current;

      // Temperature comparison
      const tempDiff = compareWeather.temperature - baseWeather.temperature;
      const baseTempFormatted = formatTemperature(baseWeather.temperature);
      const compareTempFormatted = formatTemperature(compareWeather.temperature);
      
      if (Math.abs(tempDiff) > 1) {
        const warmerCooler = tempDiff > 0 ? 'warmer' : 'cooler';
        insights.push({
          type: 'temperature',
          message: `${compareLocation.location.name} is ${Math.abs(Math.round(tempDiff))}° ${warmerCooler} than ${baseLocation.location.name}`,
          difference: tempDiff,
          unit: baseTempFormatted.unit,
        });
      }

      // Humidity comparison
      const humidityDiff = compareWeather.humidity - baseWeather.humidity;
      if (Math.abs(humidityDiff) > 5) {
        const moreOrLess = humidityDiff > 0 ? 'more humid' : 'less humid';
        insights.push({
          type: 'humidity',
          message: `${compareLocation.location.name} is ${Math.abs(Math.round(humidityDiff))}% ${moreOrLess} than ${baseLocation.location.name}`,
          difference: humidityDiff,
          unit: '%',
        });
      }

      // Wind comparison
      const windDiff = compareWeather.windSpeed - baseWeather.windSpeed;
      const baseWindFormatted = formatSpeed(baseWeather.windSpeed);
      
      if (Math.abs(windDiff) > 2) {
        const windierCalmer = windDiff > 0 ? 'windier' : 'calmer';
        const windDiffFormatted = formatSpeed(Math.abs(windDiff));
        insights.push({
          type: 'wind',
          message: `${compareLocation.location.name} is ${windDiffFormatted.value} ${windDiffFormatted.unit} ${windierCalmer} than ${baseLocation.location.name}`,
          difference: windDiff,
          unit: baseWindFormatted.unit,
        });
      }

      // Precipitation comparison
      const basePrecip = baseWeather.precipitation.total24h;
      const comparePrecip = compareWeather.precipitation.total24h;
      const precipDiff = comparePrecip - basePrecip;
      
      if (Math.abs(precipDiff) > 1) {
        const wetter = precipDiff > 0 ? 'wetter' : 'drier';
        insights.push({
          type: 'precipitation',
          message: `${compareLocation.location.name} is ${Math.abs(Math.round(precipDiff))}mm ${wetter} than ${baseLocation.location.name}`,
          difference: precipDiff,
          unit: 'mm',
        });
      }
    }

    return insights;
  }, [locationsWithData, formatTemperature, formatSpeed]);

  // Get extreme values across all locations
  const extremes = useMemo(() => {
    if (locationsWithData.length === 0) {
      return null;
    }

    const temperatures = locationsWithData.map(comp => comp.data!.current.temperature);
    const humidities = locationsWithData.map(comp => comp.data!.current.humidity);
    const windSpeeds = locationsWithData.map(comp => comp.data!.current.windSpeed);

    const hottest = locationsWithData[temperatures.indexOf(Math.max(...temperatures))];
    const coldest = locationsWithData[temperatures.indexOf(Math.min(...temperatures))];
    const mostHumid = locationsWithData[humidities.indexOf(Math.max(...humidities))];
    const leastHumid = locationsWithData[humidities.indexOf(Math.min(...humidities))];
    const windiest = locationsWithData[windSpeeds.indexOf(Math.max(...windSpeeds))];
    const calmest = locationsWithData[windSpeeds.indexOf(Math.min(...windSpeeds))];

    return {
      hottest: {
        location: hottest.location,
        temperature: formatTemperature(hottest.data!.current.temperature),
      },
      coldest: {
        location: coldest.location,
        temperature: formatTemperature(coldest.data!.current.temperature),
      },
      mostHumid: {
        location: mostHumid.location,
        humidity: mostHumid.data!.current.humidity,
      },
      leastHumid: {
        location: leastHumid.location,
        humidity: leastHumid.data!.current.humidity,
      },
      windiest: {
        location: windiest.location,
        windSpeed: formatSpeed(windiest.data!.current.windSpeed),
      },
      calmest: {
        location: calmest.location,
        windSpeed: formatSpeed(calmest.data!.current.windSpeed),
      },
    };
  }, [locationsWithData, formatTemperature, formatSpeed]);

  // Check if any location is loading
  const isLoading = useMemo(() => {
    return comparisons.some(comp => comp.isLoading);
  }, [comparisons]);

  // Check if we have enough data for comparisons
  const hasEnoughData = locationsWithData.length >= 2;

  return {
    comparisons,
    locationsWithData,
    insights,
    extremes,
    isLoading,
    hasEnoughData,
  };
};