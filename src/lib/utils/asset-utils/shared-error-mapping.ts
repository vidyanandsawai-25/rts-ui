export type SharedErrorMapOptions = {
  message?: string;
  statusCode?: number;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
  tCommon: (key: string, values?: Record<string, string | number | Date>) => string;
  fallbackEntityName: string;
  entityLabelKey?: string;
  entityMatchers?: Array<{ test: RegExp; labelKey: string }>;
  customStatusCodes?: Record<number, string>;
};

export function mapSharedApiError({
  message,
  statusCode,
  t,
  tCommon,
  fallbackEntityName,
  entityLabelKey,
  entityMatchers = [],
  customStatusCodes,
}: SharedErrorMapOptions): string {
  let rawMsg = (message || "").trim().replace(/\.$/, "");
  const fallbackMessage = rawMsg || t("apiErrors.operationFailed") || tCommon("errors.generic") || tCommon("errors.deleteError");


  if (rawMsg.startsWith("{") && rawMsg.endsWith("}")) {
    try {
      const parsed = JSON.parse(rawMsg);
      if (parsed.errors && typeof parsed.errors === "object") {
        const firstErrorKey = Object.keys(parsed.errors)[0];
        if (firstErrorKey) {
          const errorsList = parsed.errors[firstErrorKey];
          if (Array.isArray(errorsList) && errorsList.length > 0) {
            rawMsg = String(errorsList[0]);
          } else if (typeof errorsList === "string") {
            rawMsg = errorsList;
          }
        }
      } else if (typeof parsed.message === "string" && parsed.message.trim()) {
        rawMsg = parsed.message.trim();
      }
    } catch {
      // Keep rawMsg as-is if the response is not valid JSON.
    }
  }

  const match = rawMsg.match(/Cannot deactivate\/delete this (.*?) because it is referenced in:\s*(.*)/i);
  if (match) {
    const entity = match[1];
    const tables = match[2];

    let entityName = fallbackEntityName;
    const lowerEntity = entity.toLowerCase();

    if (entityLabelKey) {
      try {
        entityName = t(entityLabelKey);
      } catch {}
    }

    for (const matcher of entityMatchers) {
      if (matcher.test.test(lowerEntity)) {
        try {
          entityName = t(matcher.labelKey);
        } catch {}
        break;
      }
    }

    try {
      const translation = t("apiErrors.referencedIn", { entity: entityName, tables });
      if (translation && translation !== "apiErrors.referencedIn") {
        return translation;
      }
    } catch {}

    return `Cannot deactivate or delete this ${entityName} because it is referenced in: ${tables}.`;
  }

  const code = statusCode ?? 0;
  if (customStatusCodes && customStatusCodes[code]) {
    return customStatusCodes[code];
  }

  try {
    const key = `apiErrors.${rawMsg}`;
    const translated = t(key as never);
    if (translated && translated !== key && !translated.includes(key)) {
      return translated;
    }
  } catch {}

  const lowerMsg = rawMsg.toLowerCase();
  if (lowerMsg.includes("duplicate") || lowerMsg.includes("already exists")) {
    try {
      const dupTranslation = t("apiErrors.duplicateRecord");
      if (dupTranslation && dupTranslation !== "apiErrors.duplicateRecord") {
        return dupTranslation;
      }
    } catch {}
  }

  if (statusCode === 409) {
    return t("apiErrors.inUse") || "Record is in use.";
  }

  if (statusCode && statusCode >= 500) {
    return t("apiErrors.operationFailed") || tCommon("errors.generic") || tCommon("errors.deleteError") || "Something went wrong.";
  }

  if (rawMsg) return rawMsg;

  return fallbackMessage;
}
