import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { IQAirClient } from "../../../src/client/iqair-client";
import { IQAirException } from "../../../src/exceptions/iqair.exception";

describe("IQAirClient", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.close();
          },
        }),
      } as Response)
    );
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("creates client without config", () => {
    const client = new IQAirClient();

    expect(client).toBeInstanceOf(IQAirClient);
  });

  test("uses default base url when not provided", async () => {
    const client = new IQAirClient();

    try {
      await client.getStations({ dataSource: "test" });
    } catch {
      // Expected to fail during turbo stream decode
    }

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://www.iqair.com"),
      expect.any(Object)
    );
  });

  test("uses custom base url when provided", async () => {
    const client = new IQAirClient({ baseUrl: "https://custom.iqair.com" });

    try {
      await client.getStations({ dataSource: "test" });
    } catch {
      // Expected to fail during turbo stream decode
    }

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://custom.iqair.com"),
      expect.any(Object)
    );
  });

  test("uses default user agent when not provided", async () => {
    const client = new IQAirClient();

    try {
      await client.getStations({ dataSource: "test" });
    } catch {
      // Expected to fail during turbo stream decode
    }

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "User-Agent": expect.stringContaining("Chrome"),
        }),
      })
    );
  });

  test("uses custom user agent when provided", async () => {
    const client = new IQAirClient({ userAgent: "CustomBot/1.0" });

    try {
      await client.getStations({ dataSource: "test" });
    } catch {
      // Expected to fail during turbo stream decode
    }

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "User-Agent": "CustomBot/1.0",
        }),
      })
    );
  });

  test("throws IQAirException on non-ok response", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: () => Promise.resolve("Not found"),
      } as Response)
    );

    const client = new IQAirClient();

    expect(
      client.getStationAQI({ stationUrl: "/non-existent" })
    ).rejects.toBeInstanceOf(IQAirException);
  });

  test("uses custom locale when provided", async () => {
    const client = new IQAirClient({ locale: "us-en" });

    try {
      await client.getStations({ dataSource: "test" });
    } catch {
      // Expected to fail during turbo stream decode
    }

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/us-en/"),
      expect.any(Object)
    );
  });
});
