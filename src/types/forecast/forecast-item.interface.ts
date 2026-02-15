export interface ForecastItem {
  ts: string;
  aqi?: number;
  pressure?: number;
  humidity?: number;
  wind?: {
    speed: number;
    direction: number;
  };
  icon?: string;
  condition?: string;
  temperature?: number | { max: number; min: number };
}
