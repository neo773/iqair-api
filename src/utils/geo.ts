import type { CachedStation, StationWithDistance } from "../types";

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export function findNearestStation(
  latitude: number,
  longitude: number,
  stations: CachedStation[]
): StationWithDistance | null {
  if (stations.length === 0) {
    return null;
  }

  let nearest: StationWithDistance | null = null;
  let minDistance = Infinity;

  for (const station of stations) {
    const distance = haversineDistance(
      latitude,
      longitude,
      station.latitude,
      station.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = { ...station, distance };
    }
  }

  return nearest;
}

export function findNearestStations(
  latitude: number,
  longitude: number,
  stations: CachedStation[],
  limit: number = 5
): StationWithDistance[] {
  const withDistances: StationWithDistance[] = stations.map((station) => ({
    ...station,
    distance: haversineDistance(
      latitude,
      longitude,
      station.latitude,
      station.longitude
    ),
  }));

  withDistances.sort((a, b) => a.distance - b.distance);

  return withDistances.slice(0, limit);
}
