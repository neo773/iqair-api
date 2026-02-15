# iqair-api

Fully typed TypeScript SDK for scraping IQAir air quality data.

## Installation

```bash
bun add iqair-api
```

## Usage

```typescript
import { createIQAirClient } from "iqair-api";

const client = createIQAirClient();

async function main() {
  const dataSource = "central-pollution-control-board";

  const stations = await client.getStations({ dataSource });
  console.log(`Found ${stations.length} stations`);

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
```

## API

### `createIQAirClient(config?)`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `baseUrl` | `string` | No | IQAir base URL (default: `https://www.iqair.com`) |
| `locale` | `string` | No | Locale path segment (default: `in-en`) |
| `userAgent` | `string` | No | Custom user agent string |

### Methods

| Method | Description |
|--------|-------------|
| `getStations(params)` | Get all stations for a data source |
| `getStationAQI(params)` | Get AQI data for a specific station |
| `getNearestStation(params)` | Find the nearest station to coordinates |
| `getNearestStations(params)` | Find nearest stations to coordinates (sorted) |
| `getAQIForLocation(params)` | Get AQI for the nearest station to coordinates |

### Types

```typescript
import type {
  Station,
  StationWithDistance,
  StationDetails,
  StationItem,
  AQIResponse,
  CurrentConditions,
  Pollutant,
  HistoricalDataPoint,
  ForecastItem,
  GetStationsParams,
  GetStationAQIParams,
  GetNearestStationParams,
  GetNearestStationsParams,
  GetAQIForLocationParams,
} from "iqair-api";
```

## Development

```bash
bun install
bun run build
bun test
bun test:unit
bun test:e2e
```

## License

MIT

## Disclaimer

This is an **unofficial** API client and is not affiliated with, endorsed by, or associated with IQAir or its parent organization. This package is provided for educational and informational purposes under fair use. Accessing publicly available air quality data is lawful and serves the public interest.
