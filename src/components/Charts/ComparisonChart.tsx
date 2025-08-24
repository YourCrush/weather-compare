import React from 'react';
import { formatTemperature, formatSpeed, formatPressure } from '../../utils/units';

interface ChartData {
  name: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
}

interface ComparisonChartProps {
  data: ChartData[];
  units: 'metric' | 'imperial';
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ data, units }) => {
  // Normalize data for visualization (0-100 scale for each metric)
  const normalizeData = (data: ChartData[]) => {
    const tempValues = data.map(d => d.temperature);
    const humidityValues = data.map(d => d.humidity);
    const windValues = data.map(d => d.windSpeed);
    const pressureValues = data.map(d => d.pressure);

    const tempMin = Math.min(...tempValues);
    const tempMax = Math.max(...tempValues);
    const windMin = Math.min(...windValues);
    const windMax = Math.max(...windValues);
    const pressureMin = Math.min(...pressureValues);
    const pressureMax = Math.max(...pressureValues);

    return data.map(item => ({
      ...item,
      tempNormalized: tempMax === tempMin ? 50 : ((item.temperature - tempMin) / (tempMax - tempMin)) * 100,
      humidityNormalized: item.humidity, // Already 0-100
      windNormalized: windMax === windMin ? 50 : ((item.windSpeed - windMin) / (windMax - windMin)) * 100,
      pressureNormalized: pressureMax === pressureMin ? 50 : ((item.pressure - pressureMin) / (pressureMax - pressureMin)) * 100,
    }));
  };

  const normalizedData = normalizeData(data);

  return (
    <div className="space-y-6">
      {/* Chart Legend */}
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Temperature</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Humidity</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Wind Speed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Pressure</span>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className="space-y-4">
        {normalizedData.map((item, index) => (
          <div key={item.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.name}</h4>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatTemperature(item.temperature, units)}
              </div>
            </div>
            
            {/* Stacked Bar */}
            <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              {/* Temperature Bar */}
              <div 
                className="absolute left-0 top-0 h-full bg-red-500 opacity-80 transition-all duration-500 ease-out"
                style={{ width: `${item.tempNormalized}%` }}
                title={`Temperature: ${formatTemperature(item.temperature, units)}`}
              />
              
              {/* Humidity Bar */}
              <div 
                className="absolute left-0 top-1 h-6 bg-blue-500 opacity-70 transition-all duration-500 ease-out"
                style={{ width: `${item.humidityNormalized}%` }}
                title={`Humidity: ${item.humidity}%`}
              />
              
              {/* Wind Speed Bar */}
              <div 
                className="absolute left-0 top-2 h-4 bg-yellow-500 opacity-80 transition-all duration-500 ease-out"
                style={{ width: `${item.windNormalized}%` }}
                title={`Wind: ${formatSpeed(item.windSpeed, units)}`}
              />
              
              {/* Pressure Bar */}
              <div 
                className="absolute left-0 top-3 h-2 bg-purple-500 opacity-90 transition-all duration-500 ease-out"
                style={{ width: `${item.pressureNormalized}%` }}
                title={`Pressure: ${formatPressure(item.pressure, units)}`}
              />
            </div>

            {/* Data Values */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded"></div>
                <span>{formatTemperature(item.temperature, units)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded"></div>
                <span>{item.humidity}%</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded"></div>
                <span>{formatSpeed(item.windSpeed, units)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded"></div>
                <span>{formatPressure(item.pressure, units)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xl">📊</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">Chart Insights</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Each bar represents a location with overlapping metrics. Longer bars indicate higher values relative to other locations.
          Hover over the colored sections to see exact values.
        </p>
      </div>
    </div>
  );
};