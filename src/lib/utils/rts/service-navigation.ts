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
 * Checks whether a service/department dynamically requires citizen login prior to applying.
 * Evaluates the department metadata (Property Tax, Water Supply, Trade License)
 * and whether the service URL requires citizen/property authentication (e.g. upicNo=).
 */
export function isLoginRequiredForService(
  service?: { name?: unknown; title?: unknown; serviceName?: string; serviceUrl?: string | null; __deptName?: string; __deptId?: string | number; departmentId?: number | string } | null,
  department?: { name?: unknown; title?: unknown; departmentName?: string; id?: string | number; departmentId?: string | number } | null
): boolean {
  if (!service && !department) return false;

  // 1. Dynamic Check: If service URL requires UPIC or citizen identification parameter
  const rawUrl = service?.serviceUrl?.trim() ?? "";
  if (
    rawUrl &&
    (rawUrl.includes("upicNo=") ||
      rawUrl.includes("ConsumerNo=") ||
      rawUrl.includes("LicenceNo=") ||
      /([?&][^?&=]+)=$/.test(rawUrl))
  ) {
    return true;
  }

  // 2. Dynamic Department metadata check (English, Marathi, Hindi)
  const deptTexts: string[] = [];
  const extractText = (val: unknown) => {
    if (!val) return;
    if (typeof val === "string") {
      deptTexts.push(val.toLowerCase());
    } else if (typeof val === "object") {
      for (const v of Object.values(val as Record<string, unknown>)) {
        if (typeof v === "string") deptTexts.push(v.toLowerCase());
      }
    }
  };

  if (department) {
    extractText(department.name);
    extractText(department.title);
    extractText(department.departmentName);
  }
  if (service?.__deptName) {
    extractText(service.__deptName);
  }

  const combinedDept = deptTexts.join(" ");

  const isPropertyTaxDept =
    combinedDept.includes("property") ||
    combinedDept.includes("ptis") ||
    combinedDept.includes("मालमत्ता") ||
    combinedDept.includes("घरपट्टी") ||
    combinedDept.includes("संपत्ति");

  const isWaterDept =
    combinedDept.includes("water") ||
    combinedDept.includes("पाणी") ||
    combinedDept.includes("जल");

  const isTradeDept =
    combinedDept.includes("trade") ||
    combinedDept.includes("व्यवसाय") ||
    combinedDept.includes("ट्रेड") ||
    combinedDept.includes("व्यापार");

  return isPropertyTaxDept || isWaterDept || isTradeDept;
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

  const requiresUpic = externalUrl.includes("upicNo=") || /([?&][^?&=]+)=$/.test(externalUrl);
  if (!requiresUpic) {
    return { ok: true, destination: externalUrl, requiresUpic: false };
  }

  const cleanUpic = upicId?.trim();
  if (!cleanUpic) {
    return { ok: true, destination: externalUrl, requiresUpic: false };
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
