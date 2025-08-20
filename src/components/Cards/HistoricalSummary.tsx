import React from 'react';
import { HistoricalData } from '../../types';
import { useSettings } from '../../context';

interface HistoricalSummaryProps {
  historical: HistoricalData;
}

export const HistoricalSummary: React.FC<HistoricalSummaryProps> = ({ historical }) => {
  const { formatTemperature, formatSpeed } = useSettings();

  // Calculate averages from historical data
  const calculateAverages = () => {
    if (historical.monthly.length === 0) {
      return null;
    }

    const recent12Months = historical.monthly.slice(-12);
    const totalMonths = recent12Months.length;

    const avgTempMin = recent12Months.reduce((sum, month) => sum + month.tempMin, 0) / totalMonths;
    const avgTempMax = recent12Months.reduce((sum, month) => sum + month.tempMax, 0) / totalMonths;
    const avgTempMean = recent12Months.reduce((sum, month) => sum + month.tempMean, 0) / totalMonths;
    const totalPrecipitation = recent12Months.reduce((sum, month) => sum + month.precipitationTotal, 0);
    const avgPrecipDays = recent12Months.reduce((sum, month) => sum + month.precipitationDays, 0) / totalMonths;
    const avgWindSpeed = recent12Months.reduce((sum, month) => sum + month.windSpeed, 0) / totalMonths;

    return {
      avgTempMin,
      avgTempMax,
      avgTempMean,
      totalPrecipitation,
      avgPrecipDays,
      avgWindSpeed,
    };
  };

  // Get seasonal trends
  const getSeasonalTrends = () => {
    if (historical.monthly.length < 12) {
      return null;
    }

    const recent12Months = historical.monthly.slice(-12);
    const seasons = {
      winter: [] as typeof recent12Months,
      spring: [] as typeof recent12Months,
      summer: [] as typeof recent12Months,
      fall: [] as typeof recent12Months,
    };

    recent12Months.forEach(month => {
      const monthNum = new Date(month.month).getMonth();
      if (monthNum >= 11 || monthNum <= 1) seasons.winter.push(month);
      else if (monthNum >= 2 && monthNum <= 4) seasons.spring.push(month);
      else if (monthNum >= 5 && monthNum <= 7) seasons.summer.push(month);
      else seasons.fall.push(month);
    });

    const getSeasonAvg = (seasonData: typeof recent12Months) => {
      if (seasonData.length === 0) return null;
      return seasonData.reduce((sum, month) => sum + month.tempMean, 0) / seasonData.length;
    };

    return {
      winter: getSeasonAvg(seasons.winter),
      spring: getSeasonAvg(seasons.spring),
      summer: getSeasonAvg(seasons.summer),
      fall: getSeasonAvg(seasons.fall),
    };
  };

  const averages = calculateAverages();
  const seasonalTrends = getSeasonalTrends();

  if (!averages) {
    return (
      <div className="text-center py-8">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No historical data available
        </p>
      </div>
    );
  }

  const avgTempMin = formatTemperature(averages.avgTempMin);
  const avgTempMax = formatTemperature(averages.avgTempMax);
  const avgTempMean = formatTemperature(averages.avgTempMean);
  const avgWind = formatSpeed(averages.avgWindSpeed);

  return (
    <div className="space-y-6">
      {/* Annual averages */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          12-Month Averages
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Temperature</span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {avgTempMean.value}{avgTempMean.unit}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {avgTempMin.value}° to {avgTempMax.value}°
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Precipitation</span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {Math.round(averages.totalPrecipitation)}mm
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(averages.avgPrecipDays)} days/month
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Wind Speed</span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {avgWind.value} {avgWind.unit}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Data Period</span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {historical.monthly.length} months
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(historical.startDate).getFullYear()} - {new Date(historical.endDate).getFullYear()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal trends */}
      {seasonalTrends && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Seasonal Averages
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(seasonalTrends).map(([season, temp]) => {
              if (temp === null) return null;
              
              const seasonTemp = formatTemperature(temp);
              const seasonColors = {
                winter: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
                spring: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
                summer: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
                fall: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
              };

              return (
                <div
                  key={season}
                  className={`rounded-lg p-2 ${seasonColors[season as keyof typeof seasonColors]}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium capitalize">{season}</span>
                    <span className="text-xs font-bold">
                      {seasonTemp.value}{seasonTemp.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent trends */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          Recent Months
        </h4>
        <div className="space-y-2">
          {historical.monthly.slice(-6).reverse().map((month, index) => {
            const monthTemp = formatTemperature(month.tempMean);
            const monthDate = new Date(month.month);
            
            return (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-gray-900 dark:text-gray-100">
                    {monthTemp.value}{monthTemp.unit}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {Math.round(month.precipitationTotal)}mm
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};