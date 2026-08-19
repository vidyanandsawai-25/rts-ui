import "server-only";

import { getAppConfig } from "@/config/app.config";
import { serverFetch } from "@/lib/utils/server-fetch";

type CitizenDocumentAction = "view" | "download";

function getCitizenDocumentUrl(documentGuid: string, action: CitizenDocumentAction): string {
  const guid = documentGuid.trim();
  if (!guid) throw new Error("Document GUID is required");

  const baseUrl = getAppConfig().api.baseUrl?.trim();
  if (!baseUrl) throw new Error("API base URL is not configured");

  return `${baseUrl.replace(/\/$/, "")}/documents/${encodeURIComponent(guid)}/${action}`;
}

/**
 * Public document endpoints intentionally do not receive admin or RTS-session credentials.
 */
async function fetchCitizenDocument(
  documentGuid: string,
  action: CitizenDocumentAction
): Promise<Response> {
  return serverFetch(getCitizenDocumentUrl(documentGuid, action), {
    method: "GET",
    headers: { Accept: "*/*" },
    cache: "no-store",
  });
}

export async function viewCitizenRtsDocument(documentGuid: string): Promise<Response> {
  return fetchCitizenDocument(documentGuid, "view");
}

export async function downloadCitizenRtsDocument(documentGuid: string): Promise<Response> {
  return fetchCitizenDocument(documentGuid, "download");
}
