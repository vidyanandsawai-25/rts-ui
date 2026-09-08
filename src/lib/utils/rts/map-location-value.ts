export type MapLocationValue = {
  latitude: number;
  longitude: number;
  address: string;
};

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

export function isValidMapLocationValue(value: unknown) {
  return parseMapLocationValue(value) !== null;
}
