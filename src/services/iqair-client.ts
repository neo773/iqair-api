import { fetchAndDecode } from "../utils/decoder";
import type {
  CachedStation,
  StationListResponse,
  IndividualStationResponse,
  AQIResponse,
  StationWithDistance,
  Env,
} from "../types";
import { findNearestStation, findNearestStations } from "../utils/geo";

const BASE_URL = "https://www.iqair.com";
const LOCALE = "in-en";


const STATIONS_CACHE_KEY = "stations:all";
const AQI_CACHE_KEY = "aqi:station";
const AQI_CACHE_TTL = 300;

export class IQAirClient {
  constructor(
    private kv: KVNamespace,
    private cacheTtlSeconds: number = 1209600
  ) { }

  async fetchAllStations(dataSourceSlug: string): Promise<CachedStation[]> {
    const routeParam = encodeURIComponent(
      "routes/$(locale),routes/$(locale).profile.$slug"
    );
    const url = `${BASE_URL}/${LOCALE}/profile/${dataSourceSlug}.data?limit=500&_routes=${routeParam}`;
    console.log(url);
    const data = await fetchAndDecode<StationListResponse>(url);
    const routeData = data["routes/$(locale).profile.$slug"]?.data;
    const stationsData =
      routeData?.stationsMapData?.data

    if (!stationsData || stationsData.length === 0) {
      return [];
    }

    return stationsData.map((station) => ({
      id: station.id,
      name: station.name,
      url: station.url,
      latitude: station.coordinates.latitude,
      longitude: station.coordinates.longitude,
    }));
  }

  /**
   * Gets all stations, using cache if available.
   */
  async getStations(
    dataSourceSlug: string,
    forceRefresh = false
  ): Promise<CachedStation[]> {
    const cacheKey = `${STATIONS_CACHE_KEY}:${dataSourceSlug}`;


    if (!forceRefresh) {
      const cached = await this.kv.get<CachedStation[]>(cacheKey, "json");
      if (cached) {
        console.log(`Using cached stations for ${dataSourceSlug}`);
        return cached;
      }
    }


    console.log(`Fetching fresh stations for ${dataSourceSlug}`);
    const stations = await this.fetchAllStations(dataSourceSlug);


    if (stations.length > 0) {
      await this.kv.put(cacheKey, JSON.stringify(stations), {
        expirationTtl: this.cacheTtlSeconds,
      });
      console.log(
        `Cached ${stations.length} stations for ${this.cacheTtlSeconds}s`
      );
    }

    return stations;
  }

  async getNearestStation(
    latitude: number,
    longitude: number,
    dataSourceSlug: string
  ): Promise<StationWithDistance | null> {
    const stations = await this.getStations(dataSourceSlug);
    return findNearestStation(latitude, longitude, stations);
  }

  async getNearestStations(
    latitude: number,
    longitude: number,
    dataSourceSlug: string,
    limit: number = 5
  ): Promise<StationWithDistance[]> {
    const stations = await this.getStations(dataSourceSlug);
    return findNearestStations(latitude, longitude, stations, limit);
  }

  async fetchStationAQI(stationUrl: string): Promise<AQIResponse | null> {
    const cacheKey = `${AQI_CACHE_KEY}:${stationUrl}`;


    const cached = await this.kv.get<AQIResponse>(cacheKey, "json");
    if (cached) {
      return cached;
    }

    const routeParam = encodeURIComponent("routes/$");
    const url = `${BASE_URL}/${LOCALE}${stationUrl}.data?_routes=${routeParam}`;

    try {
      const data = await fetchAndDecode<IndividualStationResponse>(url);


      const routeData = data.root?.data || data["routes/$"]?.data;
      const details = routeData?.details;

      if (!details || !details.current) {
        console.error("No station details found in response");
        return null;
      }


      const measurements = routeData?.measurements?.data?.measurements;
      const historical = measurements
        ? {
          hourly: measurements.hourly || [],
          daily: measurements.daily || [],
        }
        : undefined;

      const response: AQIResponse = {
        station: {
          id: details.id,
          name: details.name,
          url: stationUrl,
          distance: 0,
        },
        current: {
          ts: details.current.ts,
          aqi: details.current.aqi,
          mainPollutant: details.current.mainPollutant,
          concentration: details.current.concentration,
          condition: details.current.condition,
          temperature: details.current.temperature,
          humidity: details.current.humidity,
          pressure: details.current.pressure,
          wind: details.current.wind,
        },
        pollutants: details.current.pollutants?.map((p) => ({
          name: p.pollutantName,
          aqi: p.aqi,
          concentration: p.concentration,
          unit: p.unit,
        })),
        historical,
      };


      await this.kv.put(cacheKey, JSON.stringify(response), {
        expirationTtl: AQI_CACHE_TTL,
      });

      return response;
    } catch (error) {
      console.error(`Error fetching AQI for ${stationUrl}:`, error);
      return null;
    }
  }

  async getAQIForLocation(
    latitude: number,
    longitude: number,
    dataSourceSlug: string
  ): Promise<AQIResponse | null> {

    let stations = await this.getStations(dataSourceSlug, false);
    let nearestStation = findNearestStation(latitude, longitude, stations);

    if (!nearestStation) {
      console.log("No stations in cache, fetching fresh data");
      stations = await this.getStations(dataSourceSlug, true);
      nearestStation = findNearestStation(latitude, longitude, stations);

      if (!nearestStation) {
        console.error("No stations found after refresh");
        return null;
      }
    }

    let aqi = await this.fetchStationAQI(nearestStation.url);


    if (!aqi) {
      console.log("Station fetch failed, refreshing station list and retrying");
      stations = await this.getStations(dataSourceSlug, true);
      nearestStation = findNearestStation(latitude, longitude, stations);

      if (!nearestStation) {
        console.error("No stations found after refresh");
        return null;
      }

      aqi = await this.fetchStationAQI(nearestStation.url);
    }

    if (aqi) {
      aqi.station.distance = nearestStation.distance;
    }

    return aqi;
  }
}

export function createClient(env: Env): IQAirClient {
  const cacheTtl = parseInt(env.CACHE_TTL_SECONDS, 10) || 1209600;
  return new IQAirClient(env.STATIONS_CACHE, cacheTtl);
}
