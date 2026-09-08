export type FileLatLogCaptureMetadata = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  capturedAt: string;
  source: "camera";
};

export type FileLatLogFieldValue = {
  file?: File | null;
  documentGuid?: string | null;
  documentName?: string | null;
  metadata?: FileLatLogCaptureMetadata | null;
};

const hasValidCoordinates = (value: unknown): value is { latitude: number; longitude: number } => {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  const latitude = Number(record.latitude);
  const longitude = Number(record.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
};

export function isFileLatLogCaptureMetadata(value: unknown): value is FileLatLogCaptureMetadata {
  if (!hasValidCoordinates(value)) return false;

  const record = value as Record<string, unknown>;
  return (
    record.source === "camera" &&
    typeof record.capturedAt === "string" &&
    !Number.isNaN(new Date(record.capturedAt).getTime()) &&
    (record.accuracy === null || record.accuracy === undefined || Number.isFinite(Number(record.accuracy)))
  );
}

export function parseFileLatLogCaptureMetadata(value: unknown): FileLatLogCaptureMetadata | null {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!isFileLatLogCaptureMetadata(parsed)) return null;

    return {
      latitude: Number(parsed.latitude),
      longitude: Number(parsed.longitude),
      accuracy: parsed.accuracy == null ? null : Number(parsed.accuracy),
      capturedAt: parsed.capturedAt,
      source: "camera",
    };
  } catch {
    return null;
  }
}

export function serializeFileLatLogCaptureMetadata(value: FileLatLogCaptureMetadata | null | undefined): string | null {
  if (!isFileLatLogCaptureMetadata(value)) return null;

  return JSON.stringify({
    latitude: value.latitude,
    longitude: value.longitude,
    accuracy: value.accuracy,
    capturedAt: value.capturedAt,
    source: "camera",
  });
}

export function isFileLatLogFieldValue(value: unknown): value is FileLatLogFieldValue {
  const isFile = typeof File !== "undefined" && value instanceof File;
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && !isFile);
}

export function getFileLatLogDocumentGuid(value: unknown): string | null {
  if (!isFileLatLogFieldValue(value) || typeof value.documentGuid !== "string") return null;
  return value.documentGuid.trim() || null;
}

export function getFileLatLogFile(value: unknown): File | null {
  return isFileLatLogFieldValue(value) && typeof File !== "undefined" && value.file instanceof File
    ? value.file
    : null;
}
