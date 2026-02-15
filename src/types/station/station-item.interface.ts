export interface StationItem {
  id: string;
  name: string;
  url: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  current: {
    aqi: {
      value: number;
      color: string;
      label: string;
    };
    ts: string;
  };
}
