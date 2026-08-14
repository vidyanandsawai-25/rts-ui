export type ExternalServiceNavigationResult =
  | {
      ok: true;
      destination: string;
      requiresUpic: boolean;
    }
  | {
      ok: false;
      reason: "invalid-url" | "missing-upic";
      requiresUpic: boolean;
    };

/**
 * Validates an external RTS service URL and fills its configured UPIC placeholder.
 * This module is intentionally client-safe so the citizen UI and login action agree.
 */
export function prepareExternalServiceNavigation(
  serviceUrl: string | null | undefined,
  upicId?: string | null
): ExternalServiceNavigationResult {
  const externalUrl = serviceUrl?.trim() ?? "";

  if (!externalUrl || !/^https?:\/\//i.test(externalUrl)) {
    return { ok: false, reason: "invalid-url", requiresUpic: false };
  }

  try {
    new URL(externalUrl);
  } catch {
    return { ok: false, reason: "invalid-url", requiresUpic: false };
  }

  const requiresUpic = externalUrl.includes("upicNo=") || /([?&][^?&=]+)=$/.test(externalUrl);
  if (!requiresUpic) {
    return { ok: true, destination: externalUrl, requiresUpic: false };
  }

  const cleanUpic = upicId?.trim();
  if (!cleanUpic) {
    return { ok: false, reason: "missing-upic", requiresUpic: true };
  }

  const destination = externalUrl.includes("upicNo=")
    ? externalUrl.replace(/upicNo=[^&]*/, `upicNo=${encodeURIComponent(cleanUpic)}`)
    : externalUrl.replace(/([?&][^?&=]+)=$/, `$1=${encodeURIComponent(cleanUpic)}`);

  return { ok: true, destination, requiresUpic: true };
}

export function getInternalRtsServiceHref(locale: string, serviceId: string, departmentId?: string): string {
  const basePath = `/${locale}/service/${encodeURIComponent(serviceId)}`;
  return departmentId ? `${basePath}?deptId=${encodeURIComponent(departmentId)}` : basePath;
}

/** Opens a placeholder while a click-initiated external launch is being prepared. */
export function openExternalServiceTab(): Window | null {
  const externalTab = window.open('about:blank', '_blank');
  if (externalTab) externalTab.opener = null;
  return externalTab;
}

export function navigateExternalServiceTab(externalTab: Window, destination: string): void {
  externalTab.location.replace(destination);
}
