import type { Pollutant } from "./pollutant.interface";

export interface CurrentConditions {
  ts: string;
  aqi: number;
  mainPollutant: string;
  concentration: number;
  estimated: boolean;
  condition?: string;
  icon?: string;
  humidity?: number;
  pressure?: number;
  temperature?: number;
  wind?: {
    speed: number;
    direction: number;
  };
  pollutants?: Pollutant[];
  aqiDescription?: string;
}
