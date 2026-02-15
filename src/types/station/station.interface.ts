export interface Station {
  id: string;
  name: string;
  url: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}
