import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSettings } from '../../context';
import { TemperatureChartData } from '../../types';

interface TemperatureChartProps {
  data: TemperatureChartData[];
  locations: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  height?: number;
}

const CHART_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
];

export const TemperatureChart: React.FC<TemperatureChartProps> = ({
  data,
  locations,
  showGrid = true,
  showLegend = true,
  height = 400,
}) => {
  const { settings, formatTemperature } = useSettings();

  const formatTooltipValue = (value: number) => {
    const formatted = formatTemperature(value);
    return [`${formatted.value}${formatted.unit}`, ''];
  };

  const formatYAxisTick = (value: number) => {
    const formatted = formatTemperature(value);
    return `${formatted.value}°`;
  };

  const formatXAxisTick = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {new Date(label).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-400">{entry.dataKey}:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatTooltipValue(entry.value)[0]}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-gray-200 dark:stroke-gray-700"
            />
          )}
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxisTick}
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={formatYAxisTick}
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '14px',
              }}
            />
          )}
          
          {locations.map((location, index) => (
            <Line
              key={location}
              type="monotone"
              dataKey={location}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};