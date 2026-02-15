import { describe, expect, test } from "bun:test";
import { buildUrl } from "../../../src/utils/build-url.util";

describe("buildUrl", () => {
  test("creates url with base and path", () => {
    const url = buildUrl("https://www.iqair.com", "/test");

    expect(url.origin).toBe("https://www.iqair.com");
    expect(url.pathname).toBe("/test");
  });

  test("adds provided params", () => {
    const url = buildUrl("https://www.iqair.com", "/test", {
      foo: "bar",
      num: 123,
    });

    expect(url.searchParams.get("foo")).toBe("bar");
    expect(url.searchParams.get("num")).toBe("123");
  });

  test("ignores undefined params", () => {
    const url = buildUrl("https://www.iqair.com", "/test", {
      defined: "value",
      notDefined: undefined,
    });

    expect(url.searchParams.get("defined")).toBe("value");
    expect(url.searchParams.has("notDefined")).toBe(false);
  });

  test("does not add source param", () => {
    const url = buildUrl("https://www.iqair.com", "/test");

    expect(url.searchParams.has("source")).toBe(false);
  });
});
