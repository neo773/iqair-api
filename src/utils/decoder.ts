import { UNSAFE_decodeViaTurboStream } from "react-router";

async function resolveAllPromises<T>(obj: T): Promise<T> {
  if (obj instanceof Promise) {
    const resolved = await obj;
    return resolveAllPromises(resolved);
  }

  if (Array.isArray(obj)) {
    const resolved = await Promise.all(obj.map(resolveAllPromises));
    return resolved as T;
  }

  if (obj !== null && typeof obj === "object") {
    const entries = Object.entries(obj);
    const resolvedEntries = await Promise.all(
      entries.map(async ([key, value]) => [key, await resolveAllPromises(value)])
    );
    return Object.fromEntries(resolvedEntries) as T;
  }

  return obj;
}

export async function decodeTurboStream<T>(
  stream: ReadableStream<Uint8Array>
): Promise<T> {
  const decoded = await UNSAFE_decodeViaTurboStream(stream, globalThis);
  await decoded.done;
  const resolved = await resolveAllPromises(decoded.value);
  return resolved as T;
}

export async function fetchAndDecode<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error("Response body is null");
  }

  return decodeTurboStream<T>(response.body);
}
