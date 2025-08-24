import React, { useState } from 'react';
import { formatTemperature, formatSpeed, formatPressure } from '../../utils/units';

interface ChartData {
    name: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    rainChance: number;
}

interface ComparisonChartProps {
    data: ChartData[];
    units: 'metric' | 'imperial';
}

type MetricType = 'temperature' | 'humidity' | 'windSpeed' | 'rainChance';

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ data, units }) => {
    const [activeMetric, setActiveMetric] = useState<MetricType>('temperature');

    // Get metric configuration
    const getMetricConfig = (metric: MetricType) => {
        const configs = {
            temperature: {
                label: 'Temperature',
                icon: '🌡️',
                color: 'bg-red-500',
                lightBg: 'bg-red-50 dark:bg-red-900/20',
                textColor: 'text-red-700 dark:text-red-300',
                format: (value: number) => formatTemperature(value, units),
                getValue: (item: ChartData) => item.temperature,
            },
            humidity: {
                label: 'Humidity',
                icon: '💧',
                color: 'bg-blue-500',
                lightBg: 'bg-blue-50 dark:bg-blue-900/20',
                textColor: 'text-blue-700 dark:text-blue-300',
                format: (value: number) => `${value}%`,
                getValue: (item: ChartData) => item.humidity,
            },
            windSpeed: {
                label: 'Wind Speed',
                icon: '🌬️',
                color: 'bg-yellow-500',
                lightBg: 'bg-yellow-50 dark:bg-yellow-900/20',
                textColor: 'text-yellow-700 dark:text-yellow-300',
                format: (value: number) => formatSpeed(value, units),
                getValue: (item: ChartData) => item.windSpeed,
            },
            rainChance: {
                label: 'Rain Chance',
                icon: '🌧️',
                color: 'bg-purple-500',
                lightBg: 'bg-purple-50 dark:bg-purple-900/20',
                textColor: 'text-purple-700 dark:text-purple-300',
                format: (value: number) => `${value}%`,
                getValue: (item: ChartData) => item.rainChance,
            },
        };
        return configs[metric];
    };

    const currentConfig = getMetricConfig(activeMetric);
    const values = data.map(currentConfig.getValue);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    return (
        <div className="space-y-6">
            {/* Metric Selector */}
            <div className="flex flex-wrap gap-2 justify-center">
                {(['temperature', 'humidity', 'windSpeed', 'rainChance'] as MetricType[]).map((metric) => {
                    const config = getMetricConfig(metric);
                    const isActive = activeMetric === metric;

                    return (
                        <button
                            key={metric}
                            onClick={() => setActiveMetric(metric)}
                            className={`
                                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                                ${isActive
                                    ? `${config.lightBg} ${config.textColor} shadow-sm border-2 border-current`
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }
                            `}
                        >
                            <span className="text-lg">{config.icon}</span>
                            <span className="text-sm">{config.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Chart Title */}
            <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-center space-x-2">
                    <span>{currentConfig.icon}</span>
                    <span>{currentConfig.label} Comparison</span>
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Compare {currentConfig.label.toLowerCase()} across all locations
                </p>
            </div>

            {/* Clean Bar Chart */}
            <div className="space-y-4">
                {data.map((item, index) => {
                    const value = currentConfig.getValue(item);
                    const isHighest = value === maxValue;
                    const isLowest = value === minValue && maxValue !== minValue;

                    // Calculate bar width based on metric type
                    let barWidth: number;
                    if (activeMetric === 'humidity' || activeMetric === 'rainChance') {
                        // For percentages, use the actual percentage
                        barWidth = Math.max(value, 2);
                    } else {
                        // For other metrics, use relative scaling
                        barWidth = maxValue === minValue ? 100 : Math.max(((value - minValue) / (maxValue - minValue)) * 100, 8);
                    }

                    return (
                        <div key={item.name} className="space-y-2">
                            {/* Location name and value */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                        {item.name}
                                    </h5>
                                    {isHighest && (
                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                            Highest
                                        </span>
                                    )}
                                    {isLowest && (
                                        <span className="px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                                            Lowest
                                        </span>
                                    )}
                                </div>
                                <div className={`font-semibold ${currentConfig.textColor}`}>
                                    {currentConfig.format(value)}
                                </div>
                            </div>

                            {/* Clean horizontal bar */}
                            <div className="relative">
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${currentConfig.color} transition-all duration-700 ease-out rounded-full`}
                                        style={{ width: `${barWidth}%` }}
                                    />
                                </div>
                                {/* Value label shows actual value, not confusing percentage */}
                                <div className="absolute inset-y-0 right-2 flex items-center">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 hidden sm:block">
                                        {currentConfig.format(value)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary Stats */}
            <div className={`p-4 ${currentConfig.lightBg} rounded-lg`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Highest
                        </div>
                        <div className={`font-semibold ${currentConfig.textColor}`}>
                            {currentConfig.format(maxValue)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Lowest
                        </div>
                        <div className={`font-semibold ${currentConfig.textColor}`}>
                            {currentConfig.format(minValue)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Average
                        </div>
                        <div className={`font-semibold ${currentConfig.textColor}`}>
                            {currentConfig.format(values.reduce((a, b) => a + b, 0) / values.length)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Range
                        </div>
                        <div className={`font-semibold ${currentConfig.textColor}`}>
                            {activeMetric === 'temperature'
                                ? formatTemperature(Math.abs(maxValue - minValue), units).replace(/[°CF]/g, '°')
                                : activeMetric === 'humidity' || activeMetric === 'rainChance'
                                    ? `${Math.abs(maxValue - minValue).toFixed(0)}%`
                                    : formatSpeed(Math.abs(maxValue - minValue), units)
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick comparison table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-2 font-medium text-gray-900 dark:text-gray-100">Location</th>
                            <th className="text-center py-2 font-medium text-gray-900 dark:text-gray-100">🌡️</th>
                            <th className="text-center py-2 font-medium text-gray-900 dark:text-gray-100">💧</th>
                            <th className="text-center py-2 font-medium text-gray-900 dark:text-gray-100">🌬️</th>
                            <th className="text-center py-2 font-medium text-gray-900 dark:text-gray-100">🌧️</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={item.name} className="border-b border-gray-100 dark:border-gray-800">
                                <td className="py-2 font-medium text-gray-900 dark:text-gray-100">{item.name}</td>
                                <td className="text-center py-2 text-gray-600 dark:text-gray-400">
                                    {formatTemperature(item.temperature, units)}
                                </td>
                                <td className="text-center py-2 text-gray-600 dark:text-gray-400">
                                    {item.humidity}%
                                </td>
                                <td className="text-center py-2 text-gray-600 dark:text-gray-400">
                                    {formatSpeed(item.windSpeed, units)}
                                </td>
                                <td className="text-center py-2 text-gray-600 dark:text-gray-400">
                                    {item.rainChance}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};