import React, { useState } from 'react';
import { formatTemperature, formatSpeed } from '../../utils/units';
import { TodayForecast } from '../../types';

interface ComparisonChartProps {
    todayForecasts: Map<string, TodayForecast>;
    locationNames: Map<string, string>;
    units: 'metric' | 'imperial';
}

type MetricType = 'temperature' | 'humidity' | 'windSpeed' | 'rainChance';

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ todayForecasts, locationNames, units }) => {
    const [activeMetric, setActiveMetric] = useState<MetricType>('temperature');

    // Get metric configuration
    const getMetricConfig = (metric: MetricType) => {
        const configs = {
            temperature: {
                label: 'Temperature',
                icon: '🌡️',
                color: '#ef4444',
                lightBg: 'bg-red-50 dark:bg-red-900/20',
                textColor: 'text-red-700 dark:text-red-300',
                format: (value: number) => formatTemperature(value, units),
                unit: units === 'metric' ? '°C' : '°F',
            },
            humidity: {
                label: 'Humidity',
                icon: '💧',
                color: '#3b82f6',
                lightBg: 'bg-blue-50 dark:bg-blue-900/20',
                textColor: 'text-blue-700 dark:text-blue-300',
                format: (value: number) => `${value}%`,
                unit: '%',
            },
            windSpeed: {
                label: 'Wind Speed',
                icon: '🌬️',
                color: '#eab308',
                lightBg: 'bg-yellow-50 dark:bg-yellow-900/20',
                textColor: 'text-yellow-700 dark:text-yellow-300',
                format: (value: number) => formatSpeed(value, units),
                unit: units === 'metric' ? 'km/h' : 'mph',
            },
            rainChance: {
                label: 'Rain Chance',
                icon: '🌧️',
                color: '#8b5cf6',
                lightBg: 'bg-purple-50 dark:bg-purple-900/20',
                textColor: 'text-purple-700 dark:text-purple-300',
                format: (value: number) => `${value}%`,
                unit: '%',
            },
        };
        return configs[metric];
    };

    const currentConfig = getMetricConfig(activeMetric);
    
    // Prepare line chart data
    const chartData = Array.from(todayForecasts.entries()).map(([locationId, forecast]) => {
        const locationName = locationNames.get(locationId) || 'Unknown';
        const hourlyData = forecast.hourly.map(hour => {
            let value: number;
            switch (activeMetric) {
                case 'temperature':
                    value = hour.temperature;
                    break;
                case 'humidity':
                    value = hour.humidity;
                    break;
                case 'windSpeed':
                    value = hour.windSpeed;
                    break;
                case 'rainChance':
                    value = hour.precipitation.probability;
                    break;
                default:
                    value = 0;
            }
            return {
                time: hour.time,
                value,
                hour: new Date(hour.time).getHours(),
            };
        });
        
        return {
            locationId,
            locationName,
            data: hourlyData,
        };
    });

    // Get all values to determine chart scale
    const allValues = chartData.flatMap(location => location.data.map(d => d.value));
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);
    const valueRange = maxValue - minValue;

    // Color palette for different cities
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    if (chartData.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-3xl mb-2">📊</div>
                <p className="text-gray-500 dark:text-gray-400">
                    No hourly forecast data available for comparison
                </p>
            </div>
        );
    }

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
                    <span>{currentConfig.label} Throughout Today</span>
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Hourly {currentConfig.label.toLowerCase()} comparison across all locations
                </p>
            </div>

            {/* Line Chart */}
            <div className={`p-6 ${currentConfig.lightBg} rounded-lg`}>
                <div className="relative h-64 w-full">
                    <svg className="w-full h-full" viewBox="0 0 800 200">
                        {/* Grid lines */}
                        {[0, 1, 2, 3, 4].map(i => (
                            <line
                                key={i}
                                x1="60"
                                y1={40 + i * 30}
                                x2="740"
                                y2={40 + i * 30}
                                stroke="currentColor"
                                strokeWidth="0.5"
                                className="text-gray-300 dark:text-gray-600"
                            />
                        ))}
                        
                        {/* Y-axis labels */}
                        {[0, 1, 2, 3, 4].map(i => {
                            const value = maxValue - (i * valueRange / 4);
                            return (
                                <text
                                    key={i}
                                    x="50"
                                    y={45 + i * 30}
                                    textAnchor="end"
                                    className="text-xs fill-gray-500 dark:fill-gray-400"
                                >
                                    {currentConfig.format(value)}
                                </text>
                            );
                        })}

                        {/* X-axis labels (hours) */}
                        {[0, 6, 12, 18, 24].map(hour => (
                            <text
                                key={hour}
                                x={60 + (hour / 24) * 680}
                                y="190"
                                textAnchor="middle"
                                className="text-xs fill-gray-500 dark:fill-gray-400"
                            >
                                {hour}:00
                            </text>
                        ))}

                        {/* Data lines */}
                        {chartData.map((location, locationIndex) => {
                            const color = colors[locationIndex % colors.length];
                            const points = location.data.map((point, index) => {
                                const x = 60 + (index / (location.data.length - 1)) * 680;
                                const y = 40 + ((maxValue - point.value) / valueRange) * 120;
                                return `${x},${y}`;
                            }).join(' ');

                            return (
                                <g key={location.locationId}>
                                    <polyline
                                        points={points}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth="2"
                                        className="drop-shadow-sm"
                                    />
                                    {/* Data points */}
                                    {location.data.map((point, index) => {
                                        const x = 60 + (index / (location.data.length - 1)) * 680;
                                        const y = 40 + ((maxValue - point.value) / valueRange) * 120;
                                        return (
                                            <circle
                                                key={index}
                                                cx={x}
                                                cy={y}
                                                r="3"
                                                fill={color}
                                                className="drop-shadow-sm"
                                            />
                                        );
                                    })}
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 justify-center mt-4">
                    {chartData.map((location, index) => (
                        <div key={location.locationId} className="flex items-center space-x-2">
                            <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: colors[index % colors.length] }}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {location.locationName}
                            </span>
                        </div>
                    ))}
                </div>
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
                            {currentConfig.format(allValues.reduce((a, b) => a + b, 0) / allValues.length)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Range
                        </div>
                        <div className={`font-semibold ${currentConfig.textColor}`}>
                            {currentConfig.format(Math.abs(maxValue - minValue))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};