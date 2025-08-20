import { Location, WeatherData } from '../types';

/**
 * Export current view as PNG using html2canvas
 */
export const exportToPNG = async (): Promise<void> => {
  try {
    // Dynamically import html2canvas to reduce bundle size
    const html2canvas = (await import('html2canvas')).default;
    
    // Find the main content area to capture
    const element = document.querySelector('main') || document.body;
    
    if (!element) {
      throw new Error('No content to export');
    }

    // Configure html2canvas options
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      ignoreElements: (element) => {
        // Ignore certain elements like modals, tooltips, etc.
        return element.classList.contains('export-ignore') ||
               element.tagName === 'SCRIPT' ||
               element.tagName === 'STYLE';
      },
    });

    // Create download link
    const link = document.createElement('a');
    link.download = `weather-comparison-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('PNG export failed:', error);
    throw new Error('Failed to export PNG. Please try again.');
  }
};

/**
 * Export weather data as CSV
 */
export const exportToCSV = async (
  locations: Location[],
  weatherDataMap: Map<string, WeatherData>
): Promise<void> => {
  try {
    if (locations.length === 0) {
      throw new Error('No locations to export');
    }

    const csvData = generateCSVData(locations, weatherDataMap);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    link.download = `weather-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.href = URL.createObjectURL(blob);
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(link.href);
    
  } catch (error) {
    console.error('CSV export failed:', error);
    throw new Error('Failed to export CSV. Please try again.');
  }
};

/**
 * Generate CSV data from weather information
 */
function generateCSVData(
  locations: Location[],
  weatherDataMap: Map<string, WeatherData>
): string {
  const headers = [
    'Location',
    'Country',
    'Region',
    'Latitude',
    'Longitude',
    'Current Temperature (°C)',
    'Feels Like (°C)',
    'Humidity (%)',
    'Wind Speed (m/s)',
    'Wind Gust (m/s)',
    'Pressure (hPa)',
    'Cloud Cover (%)',
    'UV Index',
    'Precipitation 24h (mm)',
    'Precipitation Probability (%)',
    'Weather Code',
    'Sunrise',
    'Sunset',
    'Last Updated',
  ];

  const rows = locations.map(location => {
    const weatherData = weatherDataMap.get(location.id);
    const current = weatherData?.current;
    
    return [
      location.name,
      location.country,
      location.region || '',
      location.latitude.toString(),
      location.longitude.toString(),
      current?.temperature?.toString() || '',
      current?.feelsLike?.toString() || '',
      current?.humidity?.toString() || '',
      current?.windSpeed?.toString() || '',
      current?.windGust?.toString() || '',
      current?.pressure?.toString() || '',
      current?.cloudCover?.toString() || '',
      current?.uvIndex?.toString() || '',
      current?.precipitation?.total24h?.toString() || '',
      current?.precipitation?.probability?.toString() || '',
      current?.weatherCode?.toString() || '',
      current?.sunrise || '',
      current?.sunset || '',
      weatherData?.lastUpdated || '',
    ];
  });

  // Convert to CSV format
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Export forecast data as CSV
 */
export const exportForecastToCSV = async (
  locations: Location[],
  weatherDataMap: Map<string, WeatherData>
): Promise<void> => {
  try {
    if (locations.length === 0) {
      throw new Error('No locations to export');
    }

    const csvData = generateForecastCSVData(locations, weatherDataMap);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    link.download = `weather-forecast-${new Date().toISOString().split('T')[0]}.csv`;
    link.href = URL.createObjectURL(blob);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(link.href);
    
  } catch (error) {
    console.error('Forecast CSV export failed:', error);
    throw new Error('Failed to export forecast CSV. Please try again.');
  }
};

/**
 * Generate forecast CSV data
 */
function generateForecastCSVData(
  locations: Location[],
  weatherDataMap: Map<string, WeatherData>
): string {
  const headers = [
    'Location',
    'Date',
    'Min Temperature (°C)',
    'Max Temperature (°C)',
    'Weather Code',
    'Precipitation 24h (mm)',
    'Precipitation Probability (%)',
    'Wind Speed (m/s)',
    'Wind Gust (m/s)',
  ];

  const rows: string[][] = [];

  locations.forEach(location => {
    const weatherData = weatherDataMap.get(location.id);
    const forecast = weatherData?.weekly?.daily || [];
    
    forecast.forEach(day => {
      rows.push([
        location.name,
        day.date,
        day.tempMin.toString(),
        day.tempMax.toString(),
        day.weatherCode.toString(),
        day.precipitation.total24h.toString(),
        day.precipitation.probability.toString(),
        day.windSpeed.toString(),
        day.windGust.toString(),
      ]);
    });
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Export chart data as CSV
 */
export const exportChartDataToCSV = async (
  chartData: any[],
  filename: string = 'chart-data'
): Promise<void> => {
  try {
    if (!chartData || chartData.length === 0) {
      throw new Error('No chart data to export');
    }

    // Get all unique keys from the data
    const allKeys = new Set<string>();
    chartData.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys);
    const rows = chartData.map(item => 
      headers.map(header => item[header]?.toString() || '')
    );

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.href = URL.createObjectURL(blob);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(link.href);
    
  } catch (error) {
    console.error('Chart data CSV export failed:', error);
    throw new Error('Failed to export chart data. Please try again.');
  }
};