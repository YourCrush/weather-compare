export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  color?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color: string;
  type: 'line' | 'bar' | 'area';
  yAxisId?: string;
}

export interface ChartConfig {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  series: ChartSeries[];
  showGrid: boolean;
  showLegend: boolean;
  sharedYAxis: boolean;
  animationEnabled: boolean;
  height?: number;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface TemperatureChartData {
  date: string;
  [cityName: string]: number | string;
}

export interface PrecipitationChartData {
  date: string;
  [cityName: string]: number | string;
}

export interface WindChartData {
  date: string;
  [cityName: string]: number | string;
}

export interface HistoricalChartData {
  month: string;
  [cityName: string]: number | string;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export interface ChartLegendProps {
  payload?: Array<{
    value: string;
    type: string;
    color: string;
  }>;
}