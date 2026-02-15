import { describe, expect, test } from "bun:test";
import { haversineDistance, findNearestStation, findNearestStations } from "../../../src/utils/geo.util";
import type { Station } from "../../../src/types";

describe("haversineDistance", () => {
  test("returns 0 for same coordinates", () => {
    const distance = haversineDistance(28.6139, 77.209, 28.6139, 77.209);

    expect(distance).toBe(0);
  });

  test("calculates distance between two points", () => {
    // Delhi to Mumbai ~1,150 km
    const distance = haversineDistance(28.6139, 77.209, 19.076, 72.8777);

    expect(distance).toBeGreaterThan(1100);
    expect(distance).toBeLessThan(1200);
  });
});

describe("findNearestStation", () => {
  const stations: Station[] = [
    { id: "1", name: "Station A", url: "/a", latitude: 28.6, longitude: 77.2 },
    { id: "2", name: "Station B", url: "/b", latitude: 19.0, longitude: 72.8 },
    { id: "3", name: "Station C", url: "/c", latitude: 28.7, longitude: 77.1 },
  ];

  test("returns null for empty stations array", () => {
    const result = findNearestStation(28.6139, 77.209, []);

    expect(result).toBeNull();
  });

  test("returns nearest station with distance", () => {
    const result = findNearestStation(28.6139, 77.209, stations);

    expect(result).not.toBeNull();
    expect(result!.id).toBe("1");
    expect(result!.distance).toBeGreaterThan(0);
  });
});

describe("findNearestStations", () => {
  const stations: Station[] = [
    { id: "1", name: "Station A", url: "/a", latitude: 28.6, longitude: 77.2 },
    { id: "2", name: "Station B", url: "/b", latitude: 19.0, longitude: 72.8 },
    { id: "3", name: "Station C", url: "/c", latitude: 28.7, longitude: 77.1 },
  ];

  test("returns stations sorted by distance", () => {
    const results = findNearestStations(28.6139, 77.209, stations, 3);

    expect(results.length).toBe(3);
    expect(results[0].distance).toBeLessThanOrEqual(results[1].distance);
    expect(results[1].distance).toBeLessThanOrEqual(results[2].distance);
  });

  test("respects limit parameter", () => {
    const results = findNearestStations(28.6139, 77.209, stations, 2);

    expect(results.length).toBe(2);
  });
});
