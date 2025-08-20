export interface ExportOptions {
  format: 'png' | 'csv' | 'json';
  filename?: string;
  quality?: number; // For PNG exports (0-1)
  includeMetadata?: boolean;
}

export interface ExportData {
  locations: string[];
  data: any[];
  metadata: {
    exportDate: string;
    dataSource: string;
    units: string;
    timeRange: string;
  };
}

export interface ShareableLink {
  cities: string[];
  view: string;
  units: string;
  theme: string;
  timeRange?: string;
  chartSettings?: any;
}

export interface ExportService {
  exportToPNG(elementId: string, options?: ExportOptions): Promise<void>;
  exportToCSV(data: any[], filename?: string): Promise<void>;
  generateShareableLink(config: ShareableLink): string;
  parseShareableLink(url: string): ShareableLink | null;
}