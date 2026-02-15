import type { Station } from "./station.interface";

export interface StationWithDistance extends Station {
  distance: number;
}
