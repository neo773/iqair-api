import { describe, expect, test } from "bun:test";
import { IQAirException } from "../../../src/exceptions/iqair.exception";

describe("IQAirException", () => {
  test("creates exception with message and status code", () => {
    const exception = new IQAirException("Test error", 400);

    expect(exception.message).toBe("Test error");
    expect(exception.statusCode).toBe(400);
    expect(exception.name).toBe("IQAirException");
  });

  test("creates exception with body", () => {
    const exception = new IQAirException("Test error", 500, '{"error": "internal"}');

    expect(exception.body).toBe('{"error": "internal"}');
  });

  test("is instance of Error", () => {
    const exception = new IQAirException("Test", 400);

    expect(exception).toBeInstanceOf(Error);
  });
});
