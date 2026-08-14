export type RtsDocumentAction = "view" | "download";
export type RtsDocumentAudience = "admin" | "citizen";

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
