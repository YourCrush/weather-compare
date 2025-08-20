import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PrecipitationChartData } from '../../types';

interface PrecipitationChartProps {
  data: PrecipitationChartData[];
  locations: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  height?: number;
}

const CHART_COLORS = [
  '#3B82F6', // Blue
  '#06B6D4', // Cyan
  '#0891B2', // Sky
  '#0284C7', // Light Blue
  '#2563EB', // Blue
];

export const PrecipitationChart: React.FC<PrecipitationChartProps> = ({
  data,
  locations,
  showGrid = true,
  showLegend = true,
  height = 400,
}) => {
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
                {entry.value.toFixed(1)}mm
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
        <BarChart
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
            label={{ 
              value: 'Precipitation (mm)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
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
            <Bar
              key={location}
              dataKey={location}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};