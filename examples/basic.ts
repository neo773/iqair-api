import { createIQAirClient } from "../src";

const client = createIQAirClient();

async function main() {
  const dataSource = "central-pollution-control-board";

  const stations = await client.getStations({ dataSource });
  console.log(`Found ${stations.length} stations`);
  console.log("First station:", stations[0]);

  const nearest = await client.getNearestStation({
    lat: 28.6139,
    lng: 77.209,
    dataSource,
  });
  console.log("Nearest station:", nearest);

  if (nearest) {
    const aqi = await client.getStationAQI({ stationUrl: nearest.url });
    console.log("Station AQI:", aqi);
  }

  const locationAQI = await client.getAQIForLocation({
    lat: 28.6139,
    lng: 77.209,
    dataSource,
  });
  console.log("Location AQI:", locationAQI);
}

main().catch(console.error);
