export interface HistoricalDataPoint {
  ts: string;
  aqi?: number;
  pm25?: { aqi: number; concentration: number };
  pm10?: { aqi: number; concentration: number };
  o3?: { aqi: number; concentration: number };
  no2?: { aqi: number; concentration: number };
  so2?: { aqi: number; concentration: number };
  co?: { aqi: number; concentration: number };
  pressure?: number;
  humidity?: number;
  temperature?: number | { max: number; min: number };
  wind?: { speed: number; direction: number };
  condition?: string;
  icon?: string;
}
