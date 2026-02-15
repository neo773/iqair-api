import { describe, expect, test, beforeAll } from "bun:test";
import { IQAirClient } from "../../src/client/iqair-client";

describe("IQAirClient E2E", () => {
  let client: IQAirClient;
  const dataSource = "central-pollution-control-board";

  beforeAll(() => {
    client = new IQAirClient();
  });

  test("getStations returns stations list", async () => {
    const result = await client.getStations({ dataSource });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("id");
    expect(result[0]).toHaveProperty("name");
    expect(result[0]).toHaveProperty("url");
    expect(result[0]).toHaveProperty("latitude");
    expect(result[0]).toHaveProperty("longitude");
  });

  test("getStationAQI returns AQI data for a station", async () => {
    const stations = await client.getStations({ dataSource });
    const result = await client.getStationAQI({ stationUrl: stations[0].url });

    expect(result).toHaveProperty("station");
    expect(result).toHaveProperty("current");
    expect(result.station).toHaveProperty("id");
    expect(result.station).toHaveProperty("name");
    expect(result.current).toHaveProperty("aqi");
    expect(typeof result.current.aqi).toBe("number");
  });

  test("getNearestStation returns nearest station", async () => {
    const result = await client.getNearestStation({
      lat: 28.6139,
      lng: 77.209,
      dataSource,
    });

    expect(result).not.toBeNull();
    expect(result!).toHaveProperty("distance");
    expect(result!).toHaveProperty("name");
    expect(typeof result!.distance).toBe("number");
  });

  test("getNearestStations returns sorted stations", async () => {
    const result = await client.getNearestStations({
      lat: 28.6139,
      lng: 77.209,
      dataSource,
      limit: 3,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(3);
    expect(result.length).toBeGreaterThan(0);

    for (let i = 1; i < result.length; i++) {
      expect(result[i].distance).toBeGreaterThanOrEqual(result[i - 1].distance);
    }
  });

  test("getAQIForLocation returns AQI for coordinates", async () => {
    const result = await client.getAQIForLocation({
      lat: 28.6139,
      lng: 77.209,
      dataSource,
    });

    expect(result).not.toBeNull();
    expect(result!).toHaveProperty("station");
    expect(result!).toHaveProperty("current");
    expect(result!.station.distance).toBeGreaterThan(0);
    expect(typeof result!.current.aqi).toBe("number");
  });
});
