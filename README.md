# IQAir API

A simple proxy API for scraping air quality data from IQAir.com stations.

## API Routes

### `GET /`

Returns basic API info and available endpoints.

### `GET /aqi`

Get the current AQI for the nearest station to a location.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `lat` | Yes | Latitude |
| `lng` | Yes | Longitude |
| `source` | No | Data source slug (defaults to `central-pollution-control-board`) |

### `GET /stations`

List all cached stations for a data source.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `source` | No | Data source slug |
| `refresh` | No | Set to `true` to force refresh the cache |

### `GET /stations/nearest`

Find the nearest stations to a location.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `lat` | Yes | Latitude |
| `lng` | Yes | Longitude |
| `source` | No | Data source slug |
| `limit` | No | Number of stations to return (default: 5) |

### `GET /station/*`

Get the current AQI for a specific station by its URL path.

Example: `/station/india/maharashtra/mumbai/bandra`
