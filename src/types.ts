export interface Env {
  STATIONS_CACHE: KVNamespace;
  DEFAULT_DATA_SOURCE: string;
  CACHE_TTL_SECONDS: string;
}


export interface CachedStation {
  id: string;
  name: string;
  url: string;
  city?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export interface StationWithDistance extends CachedStation {
  distance: number; 
}


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


export interface StationListResponse {
  "routes/$(locale)": {
    data: StationListData;
  };
  "routes/$(locale).profile.$slug": {
    data: StationListData;
  };
}

export interface StationListData {
  profileStations?: {
    data: StationItem[];
    response: Record<string, unknown>;
  };
  stationsMapData?: {
    data: StationItem[];
    response: Record<string, unknown>;
  };
}

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


export interface IndividualStationResponse {
  root: {
    data: IndividualStationData;
  };
  "routes/$": {
    data: IndividualStationData;
  };
}

export interface IndividualStationData {
  details?: StationDetails;
  measurements?: {
    data?: {
      measurements?: {
        hourly?: HistoricalDataPoint[];
        daily?: HistoricalDataPoint[];
      };
    };
  };
}

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

export interface Pollutant {
  unit: string;
  description: string;
  aqi: number;
  concentration: number;
  pollutantName: string;
}

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
