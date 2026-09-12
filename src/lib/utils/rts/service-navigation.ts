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
 * Checks if a service URL is set to '#' or placeholder, meaning struck / no redirect & no form.
 */
export function isServiceUrlStruck(serviceUrl: string | null | undefined): boolean {
  if (!serviceUrl) return false;
  const url = serviceUrl.trim();
  return url === '#' || url === '#/' || url === '##' || url.startsWith('#');
}

/**
 * Checks whether a service dynamically requires citizen login prior to applying.
 * Only requires login if the service URL explicitly requires UPIC or citizen/property identification.
 * Services in Property Tax, Water Supply, or Trade License that have plain URLs (e.g. new registration / self-assessment)
 * do NOT require login or UPIC concatenation.
 */
export function isLoginRequiredForService(
  service?: { name?: unknown; title?: unknown; serviceName?: string; serviceUrl?: string | null; __deptName?: string; __deptId?: string | number; departmentId?: number | string } | null,
  _department?: { name?: unknown; title?: unknown; departmentName?: string; id?: string | number; departmentId?: string | number } | null
): boolean {
  if (!service) return false;

  const rawUrl = service?.serviceUrl?.trim() ?? "";
  if (!rawUrl || isServiceUrlStruck(rawUrl)) return false;

  // Only require login if the service URL explicitly requires UPIC or consumer/license identification
  return (
    rawUrl.includes("upicNo=") ||
    rawUrl.includes("upicid=") ||
    rawUrl.includes("ConsumerNo=") ||
    rawUrl.includes("LicenceNo=") ||
    /([?&][^?&=]+)=$/.test(rawUrl)
  );
}

/**
 * Checks if a service URL is a valid external URL to redirect to.
 */
export function isExternalServiceUrl(serviceUrl: string | null | undefined): boolean {
  if (!serviceUrl) return false;
  const url = serviceUrl.trim();
  if (isServiceUrlStruck(url)) return false;
  return /^https?:\/\//i.test(url);
}

/**
 * Validates an external RTS service URL and fills its configured UPIC placeholder.
 * This module is intentionally client-safe so the citizen UI and login action agree.
 */
export function prepareExternalServiceNavigation(
  serviceUrl: string | null | undefined,
  upicId?: string | null
): ExternalServiceNavigationResult {
  const externalUrl = serviceUrl?.trim() ?? "";

  if (!externalUrl || isServiceUrlStruck(externalUrl) || !/^https?:\/\//i.test(externalUrl)) {
    return { ok: false, reason: "invalid-url", requiresUpic: false };
  }

  try {
    new URL(externalUrl);
  } catch {
    return { ok: false, reason: "invalid-url", requiresUpic: false };
  }

  const requiresUpic =
    externalUrl.includes("upicNo=") ||
    externalUrl.includes("upicid=") ||
    externalUrl.includes("ConsumerNo=") ||
    externalUrl.includes("LicenceNo=") ||
    /([?&][^?&=]+)=$/.test(externalUrl);

  // If the service URL does not have UPIC placeholder, navigate directly without appending UPIC
  if (!requiresUpic) {
    return { ok: true, destination: externalUrl, requiresUpic: false };
  }

  const cleanUpic = upicId?.trim();
  if (!cleanUpic) {
    return { ok: false, reason: "missing-upic", requiresUpic: true };
  }

  let destination = externalUrl;
  if (destination.includes("upicNo=")) {
    destination = destination.replace(/upicNo=[^&]*/, `upicNo=${encodeURIComponent(cleanUpic)}`);
  } else if (destination.includes("upicid=")) {
    destination = destination.replace(/upicid=[^&]*/, `upicid=${encodeURIComponent(cleanUpic)}`);
  } else if (destination.includes("ConsumerNo=")) {
    destination = destination.replace(/ConsumerNo=[^&]*/, `ConsumerNo=${encodeURIComponent(cleanUpic)}`);
  } else if (destination.includes("LicenceNo=")) {
    destination = destination.replace(/LicenceNo=[^&]*/, `LicenceNo=${encodeURIComponent(cleanUpic)}`);
  } else {
    destination = destination.replace(/([?&][^?&=]+)=$/, `$1=${encodeURIComponent(cleanUpic)}`);
  }

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
