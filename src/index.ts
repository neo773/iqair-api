import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env } from "./types";
import { createClient } from "./services/iqair-client";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());
app.use("*", logger());

app.get("/", (c) => {
  return c.json({
    name: "IQAir API",
    version: "1.0.0",
    endpoints: {
      "/aqi": "GET - Get AQI for a location (params: lat, lng, source?)",
      "/stations": "GET - List all cached stations (params: source?, refresh?)",
      "/stations/nearest":
        "GET - Find nearest stations (params: lat, lng, source?, limit?)",
    },
  });
});

app.get("/aqi", async (c) => {
  const lat = c.req.query("lat");
  const lng = c.req.query("lng");
  const source = c.req.query("source") || c.env.DEFAULT_DATA_SOURCE;

  if (!lat || !lng) {
    return c.json({ error: "Missing required parameters: lat, lng" }, 400);
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return c.json({ error: "Invalid coordinates" }, 400);
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return c.json({ error: "Coordinates out of range" }, 400);
  }

  try {
    const client = createClient(c.env);
    const aqi = await client.getAQIForLocation(latitude, longitude, source);

    if (!aqi) {
      return c.json({ error: "Could not fetch AQI data" }, 500);
    }

    return c.json(aqi);
  } catch (error) {
    console.error("Error fetching AQI:", error);
    return c.json(
      { error: "Internal server error", details: String(error) },
      500
    );
  }
});

app.get("/stations", async (c) => {
  const source = c.req.query("source") || c.env.DEFAULT_DATA_SOURCE;
  const refresh = c.req.query("refresh") === "true";

  try {
    const client = createClient(c.env);
    const stations = await client.getStations(source, refresh);

    return c.json({
      source,
      count: stations.length,
      stations,
    });
  } catch (error) {
    console.error("Error fetching stations:", error);
    return c.json(
      { error: "Internal server error", details: String(error) },
      500
    );
  }
});

app.get("/stations/nearest", async (c) => {
  const lat = c.req.query("lat");
  const lng = c.req.query("lng");
  const source = c.req.query("source") || c.env.DEFAULT_DATA_SOURCE;
  const limit = parseInt(c.req.query("limit") || "5", 10);

  if (!lat || !lng) {
    return c.json({ error: "Missing required parameters: lat, lng" }, 400);
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return c.json({ error: "Invalid coordinates" }, 400);
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return c.json({ error: "Coordinates out of range" }, 400);
  }

  try {
    const client = createClient(c.env);
    const stations = await client.getNearestStations(
      latitude,
      longitude,
      source,
      limit
    );

    return c.json({
      query: { latitude, longitude, source, limit },
      count: stations.length,
      stations,
    });
  } catch (error) {
    console.error("Error fetching nearest stations:", error);
    return c.json(
      { error: "Internal server error", details: String(error) },
      500
    );
  }
});

app.get("/station/*", async (c) => {
  const stationUrl = "/" + c.req.path.replace("/station/", "");

  if (!stationUrl || stationUrl === "/") {
    return c.json({ error: "Missing station URL" }, 400);
  }

  try {
    const client = createClient(c.env);
    const aqi = await client.fetchStationAQI(stationUrl);

    if (!aqi) {
      return c.json({ error: "Could not fetch AQI data for station" }, 500);
    }

    return c.json(aqi);
  } catch (error) {
    console.error("Error fetching station AQI:", error);
    return c.json(
      { error: "Internal server error", details: String(error) },
      500
    );
  }
});

export default app;
