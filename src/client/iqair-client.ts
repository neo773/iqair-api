import { IQAirClientConfig } from "./iqair-client.config";
import {
  DEFAULT_BASE_URL,
  DEFAULT_LOCALE,
  DEFAULT_USER_AGENT,
  STATION_LIST_ROUTES,
  INDIVIDUAL_STATION_ROUTES,
} from "../constants";
import { IQAirException } from "../exceptions";
import { fetchAndDecode } from "../utils/decoder.util";
import { findNearestStation, findNearestStations } from "../utils/geo.util";
import { buildUrl } from "../utils/build-url.util";
import type {
  Station,
  StationWithDistance,
  AQIResponse,
  StationListResponse,
  IndividualStationResponse,
  GetStationsParams,
  GetStationAQIParams,
  GetNearestStationParams,
  GetNearestStationsParams,
  GetAQIForLocationParams,
} from "../types";

export class IQAirClient {
  private readonly baseUrl: string;
  private readonly locale: string;
  private readonly userAgent: string;

  constructor(config: IQAirClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    this.locale = config.locale ?? DEFAULT_LOCALE;
    this.userAgent = config.userAgent ?? DEFAULT_USER_AGENT;
  }

  private async request<T>(url: string): Promise<T> {
    return fetchAndDecode<T>(url, this.userAgent);
  }

  async getStations(params: GetStationsParams): Promise<Station[]> {
    const url = buildUrl(
      this.baseUrl,
      `/${this.locale}/profile/${params.dataSource}.data`,
      {
        limit: params.limit ?? 500,
        _routes: STATION_LIST_ROUTES,
      }
    );

    const data = await this.request<StationListResponse>(url.toString());
    const routeData = data["routes/$(locale).profile.$slug"]?.data;
    const stationsData = routeData?.stationsMapData?.data;

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

  async getStationAQI(params: GetStationAQIParams): Promise<AQIResponse> {
    const url = buildUrl(
      this.baseUrl,
      `/${this.locale}${params.stationUrl}.data`,
      {
        _routes: INDIVIDUAL_STATION_ROUTES,
      }
    );

    const data = await this.request<IndividualStationResponse>(url.toString());
    const routeData = data.root?.data || data["routes/$"]?.data;
    const details = routeData?.details;

    if (!details || !details.current) {
      throw new IQAirException("No station details found in response", 404);
    }

    const measurements = routeData?.measurements?.data?.measurements;
    const historical = measurements
      ? {
          hourly: measurements.hourly || [],
          daily: measurements.daily || [],
        }
      : undefined;

    return {
      station: {
        id: details.id,
        name: details.name,
        url: params.stationUrl,
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
  }

  async getNearestStation(
    params: GetNearestStationParams
  ): Promise<StationWithDistance | null> {
    const stations = await this.getStations({ dataSource: params.dataSource });
    return findNearestStation(params.lat, params.lng, stations);
  }

  async getNearestStations(
    params: GetNearestStationsParams
  ): Promise<StationWithDistance[]> {
    const stations = await this.getStations({ dataSource: params.dataSource });
    return findNearestStations(params.lat, params.lng, stations, params.limit);
  }

  async getAQIForLocation(
    params: GetAQIForLocationParams
  ): Promise<AQIResponse | null> {
    const nearestStation = await this.getNearestStation({
      lat: params.lat,
      lng: params.lng,
      dataSource: params.dataSource,
    });

    if (!nearestStation) {
      return null;
    }

    const aqi = await this.getStationAQI({ stationUrl: nearestStation.url });
    aqi.station.distance = nearestStation.distance;
    return aqi;
  }
}
