import type { HistoricalDataPoint } from "../history/historical-data-point.interface";

export interface AQIResponse {
  station: {
    id: string;
    name: string;
    url: string;
    distance: number;
  };
  current: {
    ts: string;
    aqi: number;
    mainPollutant?: string;
    concentration?: number;
    condition?: string;
    temperature?: number;
    humidity?: number;
    pressure?: number;
    wind?: {
      speed: number;
      direction: number;
    };
  };
  pollutants?: Array<{
    name: string;
    aqi: number;
    concentration: number;
    unit: string;
  }>;
  historical?: {
    hourly: HistoricalDataPoint[];
    daily: HistoricalDataPoint[];
  };
}
