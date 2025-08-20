import React from 'react';
import { Location, WeatherData } from '../../types';
import { useSettings } from '../../context';

interface SeasonalTrendsProps {
  locationsWithData: Array<{ location: Location; data: WeatherData }>;
}

interface SeasonalData {
  season: string;
  avgTemp: number;
  avgPrecip: number;
  months: number;
  color: string;
  icon: React.ReactNode;
}

export const SeasonalTrends: React.FC<SeasonalTrendsProps> = ({
  locationsWithData,
}) => {
  const { formatTemperature } = useSettings();

  const getSeasonalData = (data: WeatherData): SeasonalData[] => {
    const seasons = {
      winter: { temps: [] as number[], precips: [] as number[], months: 0 },
      spring: { temps: [] as number[], precips: [] as number[], months: 0 },
      summer: { temps: [] as number[], precips: [] as number[], months: 0 },
      fall: { temps: [] as number[], precips: [] as number[], months: 0 },
    };

    data.historical.monthly.forEach(month => {
      const monthNum = new Date(month.month).getMonth();
      let season: keyof typeof seasons;
      
      if (monthNum >= 11 || monthNum <= 1) season = 'winter';
      else if (monthNum >= 2 && monthNum <= 4) season = 'spring';
      else if (monthNum >= 5 && monthNum <= 7) season = 'summer';
      else season = 'fall';

      seasons[season].temps.push(month.tempMean);
      seasons[season].precips.push(month.precipitationTotal);
      seasons[season].months++;
    });

    const seasonalData: SeasonalData[] = [
      {
        season: 'Winter',
        avgTemp: seasons.winter.temps.length > 0 
          ? seasons.winter.temps.reduce((a, b) => a + b, 0) / seasons.winter.temps.length 
          : 0,
        avgPrecip: seasons.winter.precips.length > 0 
          ? seasons.winter.precips.reduce((a, b) => a + b, 0) / seasons.winter.precips.length 
          : 0,
        months: seasons.winter.months,
        color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        ),
      },
      {
        season: 'Spring',
        avgTemp: seasons.spring.temps.length > 0 
          ? seasons.spring.temps.reduce((a, b) => a + b, 0) / seasons.spring.temps.length 
          : 0,
        avgPrecip: seasons.spring.precips.length > 0 
          ? seasons.spring.precips.reduce((a, b) => a + b, 0) / seasons.spring.precips.length 
          : 0,
        months: seasons.spring.months,
        color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      },
      {
        season: 'Summer',
        avgTemp: seasons.summer.temps.length > 0 
          ? seasons.summer.temps.reduce((a, b) => a + b, 0) / seasons.summer.temps.length 
          : 0,
        avgPrecip: seasons.summer.precips.length > 0 
          ? seasons.summer.precips.reduce((a, b) => a + b, 0) / seasons.summer.precips.length 
          : 0,
        months: seasons.summer.months,
        color: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
        ),
      },
      {
        season: 'Fall',
        avgTemp: seasons.fall.temps.length > 0 
          ? seasons.fall.temps.reduce((a, b) => a + b, 0) / seasons.fall.temps.length 
          : 0,
        avgPrecip: seasons.fall.precips.length > 0 
          ? seasons.fall.precips.reduce((a, b) => a + b, 0) / seasons.fall.precips.length 
          : 0,
        months: seasons.fall.months,
        color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        ),
      },
    ];

    return seasonalData.filter(season => season.months > 0);
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
        <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Seasonal Climate Analysis
      </h2>

      <div className="space-y-8">
        {locationsWithData.map(({ location, data }) => {
          const seasonalData = getSeasonalData(data);
          
          if (seasonalData.length === 0) {
            return (
              <div key={location.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {location.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Insufficient data for seasonal analysis
                </p>
              </div>
            );
          }

          // Find hottest and coldest seasons
          const hottestSeason = seasonalData.reduce((prev, current) => 
            current.avgTemp > prev.avgTemp ? current : prev
          );
          const coldestSeason = seasonalData.reduce((prev, current) => 
            current.avgTemp < prev.avgTemp ? current : prev
          );
          const wettestSeason = seasonalData.reduce((prev, current) => 
            current.avgPrecip > prev.avgPrecip ? current : prev
          );

          return (
            <div key={location.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                {location.name}
              </h3>

              {/* Seasonal breakdown */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {seasonalData.map((season) => {
                  const temp = formatTemperature(season.avgTemp);
                  return (
                    <div key={season.season} className={`p-4 rounded-lg ${season.color}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {season.icon}
                        <span className="font-medium">{season.season}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-lg font-bold">
                          {temp.value}{temp.unit}
                        </div>
                        <div className="text-sm opacity-80">
                          {Math.round(season.avgPrecip)}mm rain
                        </div>
                        <div className="text-xs opacity-70">
                          {season.months} months data
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Key insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z" />
                    </svg>
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">
                      Hottest Season
                    </span>
                  </div>
                  <div className="text-red-900 dark:text-red-100">
                    <div className="font-bold">
                      {hottestSeason.season}
                    </div>
                    <div className="text-sm">
                      {formatTemperature(hottestSeason.avgTemp).value}°
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Coldest Season
                    </span>
                  </div>
                  <div className="text-blue-900 dark:text-blue-100">
                    <div className="font-bold">
                      {coldestSeason.season}
                    </div>
                    <div className="text-sm">
                      {formatTemperature(coldestSeason.avgTemp).value}°
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <span className="text-sm font-medium text-cyan-800 dark:text-cyan-200">
                      Wettest Season
                    </span>
                  </div>
                  <div className="text-cyan-900 dark:text-cyan-100">
                    <div className="font-bold">
                      {wettestSeason.season}
                    </div>
                    <div className="text-sm">
                      {Math.round(wettestSeason.avgPrecip)}mm
                    </div>
                  </div>
                </div>
              </div>

              {/* Temperature range */}
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Annual Temperature Range
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="h-2 bg-gradient-to-r from-blue-400 via-green-400 to-red-400 rounded-full"></div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatTemperature(coldestSeason.avgTemp).value}° to {formatTemperature(hottestSeason.avgTemp).value}°
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};