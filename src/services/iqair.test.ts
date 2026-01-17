import { test, expect, describe } from "bun:test";

import { fetchAndDecode } from "../utils/decoder";
import { haversineDistance, findNearestStation } from "../utils/geo";
import type { CachedStation } from "../types";

const BASE_URL = "https://www.iqair.com";
const LOCALE = "in-en";
const DATA_SOURCE = "central-pollution-control-board";

describe("decoder", () => {
  test("fetchAndDecode fetches station list page", async () => {
    const routeParam = encodeURIComponent(
      "routes/$(locale),routes/$(locale).profile.$slug"
    );
    const url = `${BASE_URL}/${LOCALE}/profile/${DATA_SOURCE}.data?page=1&_routes=${routeParam}`;

    const data = await fetchAndDecode<any>(url);

    expect(data).toBeDefined();
    expect(data["routes/$(locale).profile.$slug"]).toBeDefined();

    const profileData = data["routes/$(locale).profile.$slug"].data;
    expect(profileData.profileStations).toBeDefined();
    expect(profileData.profileStations.data.length).toBeGreaterThan(0);

    const station = profileData.profileStations.data[0];
    expect(station.id).toBeDefined();
    expect(station.name).toBeDefined();
    expect(station.url).toBeDefined();
    expect(station.coordinates).toBeDefined();
    expect(station.coordinates.latitude).toBeNumber();
    expect(station.coordinates.longitude).toBeNumber();
  });

  test("fetchAndDecode fetches individual station AQI", async () => {

    const routeParam = encodeURIComponent(
      "routes/$(locale),routes/$(locale).profile.$slug"
    );
    const listUrl = `${BASE_URL}/${LOCALE}/profile/${DATA_SOURCE}.data?page=1&_routes=${routeParam}`;
    const listData = await fetchAndDecode<any>(listUrl);
    const station = listData["routes/$(locale).profile.$slug"].data.profileStations.data[0];

    const url = `${BASE_URL}${station.url}.data`;
    const data = await fetchAndDecode<any>(url);

    expect(data).toBeDefined();

    const details = data.root?.data?.details || data["routes/$"]?.data?.details;
    expect(details).toBeDefined();
    expect(details.current).toBeDefined();
    expect(details.current.aqi).toBeNumber();
    expect(details.current.ts).toBeDefined();
  });
});

describe("geo", () => {
  test("haversineDistance calculates distance correctly", () => {

    const mumbai = { lat: 19.076, lng: 72.8777 };
    const delhi = { lat: 28.6139, lng: 77.209 };

    const distance = haversineDistance(
      mumbai.lat,
      mumbai.lng,
      delhi.lat,
      delhi.lng
    );

    expect(distance).toBeGreaterThan(1100);
    expect(distance).toBeLessThan(1200);
  });

  test("haversineDistance returns 0 for same point", () => {
    const distance = haversineDistance(19.076, 72.8777, 19.076, 72.8777);
    expect(distance).toBe(0);
  });

  test("findNearestStation finds closest station", () => {
    const stations: CachedStation[] = [
      { id: "1", name: "Delhi", url: "/delhi", latitude: 28.6139, longitude: 77.209 },
      { id: "2", name: "Mumbai", url: "/mumbai", latitude: 19.076, longitude: 72.8777 },
      { id: "3", name: "Kolkata", url: "/kolkata", latitude: 22.5726, longitude: 88.3639 },
    ];

    const nearest = findNearestStation(19.0, 73.0, stations);

    expect(nearest).toBeDefined();
    expect(nearest!.name).toBe("Mumbai");
    expect(nearest!.distance).toBeLessThan(50);
  });

  test("findNearestStation returns null for empty array", () => {
    const nearest = findNearestStation(19.076, 72.8777, []);
    expect(nearest).toBeNull();
  });
});

describe("fetch all stations", () => {
  test("fetches stations with limit param", async () => {
    const routeParam = encodeURIComponent(
      "routes/$(locale),routes/$(locale).profile.$slug"
    );
    const url = `${BASE_URL}/${LOCALE}/profile/${DATA_SOURCE}.data?limit=1000&_routes=${routeParam}`;

    const data = await fetchAndDecode<any>(url);
    const stations = data["routes/$(locale).profile.$slug"].data.profileStations.data;

    expect(stations.length).toBeGreaterThan(0);

    for (const station of stations) {
      expect(station.id).toBeDefined();
      expect(station.coordinates).toBeDefined();
    }
  });
});
