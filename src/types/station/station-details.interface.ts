import type { CurrentConditions } from "../aqi/current-conditions.interface";
import type { ForecastItem } from "../forecast/forecast-item.interface";

export interface StationDetails {
  id: string;
  name: string;
  country: string;
  state: string;
  type: string;
  timezone: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  current: CurrentConditions;
  forecasts?: {
    hourly: ForecastItem[];
    daily: ForecastItem[];
  };
}
