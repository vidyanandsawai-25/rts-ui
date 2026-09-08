export type MapLocationValue = {
  latitude: number;
  longitude: number;
  address: string;
};

function isGoogleMapsUrl(url: URL): boolean {
  const hostname = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();
  const isGoogleDomain = /(^|\.)google\.[a-z.]+$/.test(hostname);

  return (
    hostname === "maps.app.goo.gl" ||
    (hostname === "goo.gl" && path.startsWith("/maps")) ||
    (isGoogleDomain && (hostname.startsWith("maps.") || path.startsWith("/maps")))
  );
}

function isValidCoordinate(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function parseMapLocationValue(value: unknown): MapLocationValue | null {
  let candidate = value;

  if (typeof candidate === "string") {
    if (!candidate.trim()) return null;

    try {
      candidate = JSON.parse(candidate);
    } catch {
      return null;
    }
  }

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;

  const record = candidate as Record<string, unknown>;
  const latitude = Number(record.latitude ?? record.lat);
  const longitude = Number(record.longitude ?? record.lng);
  const addressValue = record.address ?? record.label;
  const address = typeof addressValue === "string" ? addressValue.trim() : "";

  if (!isValidCoordinate(latitude, longitude) || !address) return null;

  return { latitude, longitude, address };
}

export function serializeMapLocationValue(value: MapLocationValue) {
  return JSON.stringify({
    latitude: value.latitude,
    longitude: value.longitude,
    address: value.address.trim(),
  });
}

export function buildGoogleMapsLocationUrl(latitude: number, longitude: number): string | null {
  if (!isValidCoordinate(latitude, longitude)) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${latitude},${longitude}`
  )}`;
}

export function parseGoogleMapsLocationUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || !isGoogleMapsUrl(url)) return null;
    return value.trim();
  } catch {
    return null;
  }
}

export function getMapLocationUrl(value: unknown): string | null {
  const googleMapsUrl = parseGoogleMapsLocationUrl(value);
  if (googleMapsUrl) return googleMapsUrl;

  const location = parseMapLocationValue(value);
  return location ? buildGoogleMapsLocationUrl(location.latitude, location.longitude) : null;
}

export function isValidMapLocationValue(value: unknown) {
  return getMapLocationUrl(value) !== null;
}
