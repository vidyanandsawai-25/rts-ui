export type RtsDocumentAction = "view" | "download";
export type RtsDocumentAudience = "admin" | "citizen";

interface DownloadRtsDocumentOptions {
  url: string;
  fallbackFileName: string;
  errorMessage: string;
}

function getRtsDocumentProxyUrl(
  documentGuid: string,
  action: RtsDocumentAction,
  audience: RtsDocumentAudience
): string {
  const proxyBasePath = audience === "admin" ? "/api/rts/documents" : "/api/service/documents";
  return `${proxyBasePath}/${encodeURIComponent(documentGuid.trim())}/${action}`;
}

export function getAdminRtsDocumentViewUrl(documentGuid: string): string {
  return getRtsDocumentProxyUrl(documentGuid, "view", "admin");
}

export function getAdminRtsDocumentDownloadUrl(documentGuid: string): string {
  return getRtsDocumentProxyUrl(documentGuid, "download", "admin");
}

export function getCitizenRtsDocumentViewUrl(documentGuid: string): string {
  return getRtsDocumentProxyUrl(documentGuid, "view", "citizen");
}

export function getCitizenRtsDocumentDownloadUrl(documentGuid: string): string {
  return getRtsDocumentProxyUrl(documentGuid, "download", "citizen");
}

function getResponseErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const response = payload as Record<string, unknown>;
  for (const key of ["message", "error", "title", "detail"]) {
    const value = response[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  if (Array.isArray(response.errors)) {
    const firstError = response.errors.find(
      (value): value is string => typeof value === "string" && value.trim().length > 0
    );
    if (firstError) return firstError.trim();
  }

  return null;
}

async function getDownloadFailureMessage(response: Response, fallback: string): Promise<string> {
  const text = (await response.text()).trim();
  if (!text) return fallback;

  try {
    return getResponseErrorMessage(JSON.parse(text)) ?? text;
  } catch {
    return text;
  }
}

function getDownloadFileName(contentDisposition: string | null, fallbackFileName: string): string {
  const encodedMatch = contentDisposition?.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  const filenameMatch = contentDisposition?.match(/filename\s*=\s*(?:"([^"]+)"|([^;\s]+))/i);
  const rawFileName = encodedMatch?.[1]
    ? decodeURIComponent(encodedMatch[1].replace(/^"|"$/g, ""))
    : filenameMatch?.[1] || filenameMatch?.[2] || fallbackFileName;

  return rawFileName.replace(/[\\/:*?"<>|]/g, "_").trim() || "document";
}

/** Downloads a proxied RTS document without navigating away from the current drawer. */
export async function downloadRtsDocument({
  url,
  fallbackFileName,
  errorMessage,
}: DownloadRtsDocumentOptions): Promise<void> {
  const response = await fetch(url, { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error(await getDownloadFailureMessage(response, errorMessage));
  }

  const blob = await response.blob();
  if (!blob.size) throw new Error(errorMessage);

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = getDownloadFileName(response.headers.get("content-disposition"), fallbackFileName);
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}
