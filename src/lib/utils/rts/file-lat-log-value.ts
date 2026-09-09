import {
  buildGoogleMapsLocationUrl,
  parseGoogleMapsLocationUrl,
} from "@/lib/utils/rts/map-location-value";

export type FileLatLogCameraMetadata = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  capturedAt: string;
  source: "camera";
  googleMapsUrl: string;
};

export type FileLatLogUploadMetadata = {
  source: "upload";
  googleMapsUrl: string;
};

export type FileLatLogMetadata = FileLatLogCameraMetadata | FileLatLogUploadMetadata;
type LegacyFileLatLogCameraMetadata = Omit<FileLatLogCameraMetadata, "googleMapsUrl">;

// Kept for existing imports while fileLatLog supports both camera and manual uploads.
export type FileLatLogCaptureMetadata = FileLatLogMetadata;

export type FileLatLogFieldValue = {
  file?: File | null;
  documentGuid?: string | null;
  documentName?: string | null;
  metadata?: FileLatLogMetadata | null;
};

const hasValidCoordinates = (value: unknown): value is { latitude: number; longitude: number } => {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  const latitude = Number(record.latitude);
  const longitude = Number(record.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
};

export function isFileLatLogCaptureMetadata(value: unknown): value is FileLatLogMetadata {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  if (!parseGoogleMapsLocationUrl(record.googleMapsUrl)) return false;

  if (record.source === "upload") return true;

  if (record.source !== "camera" || !hasValidCoordinates(record)) return false;
  const cameraRecord = record as Record<string, unknown>;
  return typeof cameraRecord.capturedAt === "string" &&
    !Number.isNaN(new Date(cameraRecord.capturedAt).getTime()) &&
    (cameraRecord.accuracy === null || cameraRecord.accuracy === undefined || Number.isFinite(Number(cameraRecord.accuracy)));
}

export function parseFileLatLogCaptureMetadata(value: unknown): FileLatLogMetadata | null {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as Record<string, unknown>;

    if (record.source === "upload") {
      const googleMapsUrl = parseGoogleMapsLocationUrl(record.googleMapsUrl);
      return googleMapsUrl ? { source: "upload", googleMapsUrl } : null;
    }

    // Historic camera captures did not persist a Maps URL. Derive it safely.
    if (record.source !== "camera" || !hasValidCoordinates(record)) return null;
    const cameraRecord = record as Record<string, unknown>;
    const googleMapsUrl = parseGoogleMapsLocationUrl(cameraRecord.googleMapsUrl) ??
      buildGoogleMapsLocationUrl(Number(cameraRecord.latitude), Number(cameraRecord.longitude));
    if (!googleMapsUrl) return null;

    const normalized: FileLatLogCameraMetadata = {
      latitude: Number(cameraRecord.latitude),
      longitude: Number(cameraRecord.longitude),
      accuracy: cameraRecord.accuracy == null ? null : Number(cameraRecord.accuracy),
      capturedAt: typeof cameraRecord.capturedAt === "string" ? cameraRecord.capturedAt : "",
      source: "camera",
      googleMapsUrl,
    };
    if (!isFileLatLogCaptureMetadata(normalized)) return null;

    return normalized;
  } catch {
    return null;
  }
}

export function serializeFileLatLogCaptureMetadata(value: FileLatLogMetadata | LegacyFileLatLogCameraMetadata | null | undefined): string | null {
  if (!value || typeof value !== "object") return null;

  if (value.source === "upload" && isFileLatLogCaptureMetadata(value)) {
    return JSON.stringify({
      source: "upload",
      googleMapsUrl: value.googleMapsUrl,
    });
  }

  if (value.source !== "camera" || !hasValidCoordinates(value)) return null;
  const cameraValue = value as LegacyFileLatLogCameraMetadata & { googleMapsUrl?: unknown };
  const googleMapsUrl = parseGoogleMapsLocationUrl(cameraValue.googleMapsUrl) ??
    buildGoogleMapsLocationUrl(value.latitude, value.longitude);
  if (!googleMapsUrl || typeof value.capturedAt !== "string" || Number.isNaN(new Date(value.capturedAt).getTime())) return null;

  return JSON.stringify({
    latitude: value.latitude,
    longitude: value.longitude,
    accuracy: value.accuracy == null ? null : Number(value.accuracy),
    capturedAt: value.capturedAt,
    source: "camera",
    googleMapsUrl,
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

export function getFileLatLogMetadata(value: unknown): FileLatLogMetadata | null {
  return isFileLatLogFieldValue(value) && isFileLatLogCaptureMetadata(value.metadata)
    ? value.metadata
    : null;
}
