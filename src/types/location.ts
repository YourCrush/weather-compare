export interface Location {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  region?: string;
  admin1?: string; // State/Province
  admin2?: string; // County/District
}

export interface LocationSearchResult extends Location {
  displayName: string;
  relevance: number;
}