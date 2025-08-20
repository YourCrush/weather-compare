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
import { Location, WeatherData } from '../../types';
import { useSettings } from '../../context';

interface YearOverYearChartProps {
  locationsWithData: Array<{ location: Location; data: WeatherData }>;
}

interface ChartDataPoint {
  month: string;
  [key: string]: string | number;
}

export const YearOverYearChart: React.FC<YearOverYearChartProps> = ({
  locationsWithData,
}) => {
  const { formatTemperature } = useSettings();

  // Transform data for year-over-year comparison
  const transformData = (): ChartDataPoint[] => {
    if (locationsWithData.length === 0) return [];

    // Get the last 24 months of data
    const now = new Date();
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), 1);
    
    const monthsMap = new Map<string, ChartDataPoint>();

    // Initialize months for the last 24 months
    for (let i = 0; i < 24; i++) {
      const date = new Date(twoYearsAgo);
      date.setMonth(date.getMonth() + i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      monthsMap.set(monthKey, { month: monthLabel });
    }

    // Add data for each location
    locationsWithData.forEach(({ location, data }) => {
      data.historical.monthly.forEach(monthData => {
        const monthKey = monthData.month.slice(0, 7);
        const existing = monthsMap.get(monthKey);
        
        if (existing) {
          existing[location.name] = monthData.tempMean;
        }
      });
    });

    return Array.from(monthsMap.values()).filter(item => 
      Object.keys(item).length > 1 // Has data beyond just the month
    );
  };

  const chartData = transformData();
  const locationNames = locationsWithData.map(({ location }) => location.name);

  const CHART_COLORS = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {label}
          </p>
          {payload.map((entry: any, index: number) => {
            const temp = formatTemperature(entry.value);
            return (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-600 dark:text-gray-400">{entry.dataKey}:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {temp.value}{temp.unit}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          24-Month Temperature Trends
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Insufficient historical data for year-over-year comparison
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
        <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        24-Month Temperature Trends
      </h2>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Monthly average temperatures over the past two years showing seasonal patterns and year-over-year changes
      </p>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-gray-200 dark:stroke-gray-700"
            />
            <XAxis
              dataKey="month"
              className="text-gray-600 dark:text-gray-400"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(value) => {
                const temp = formatTemperature(value);
                return `${temp.value}°`;
              }}
              className="text-gray-600 dark:text-gray-400"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '14px',
              }}
            />
            
            {locationNames.map((location, index) => (
              <Line
                key={location}
                type="monotone"
                dataKey={location}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 5, strokeWidth: 2 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart insights */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="font-medium text-blue-900 dark:text-blue-100">Seasonal Patterns</div>
          <div className="text-blue-800 dark:text-blue-200 text-xs mt-1">
            Clear seasonal cycles visible across all locations
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="font-medium text-green-900 dark:text-green-100">Year-over-Year</div>
          <div className="text-green-800 dark:text-green-200 text-xs mt-1">
            Compare same months across different years
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <div className="font-medium text-purple-900 dark:text-purple-100">Trend Analysis</div>
          <div className="text-purple-800 dark:text-purple-200 text-xs mt-1">
            Identify long-term climate trends
          </div>
        </div>
      </div>
    </div>
  );
};