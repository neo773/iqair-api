export function buildUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, string | number | undefined>
): URL {
  const url = new URL(baseUrl + path);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url;
}
