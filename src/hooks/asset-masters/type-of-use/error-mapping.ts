export function getErrorMessage(
  message: string | undefined,
  statusCode: number | undefined,
  t: (key: string, values?: Record<string, string>) => string,
  tCommon: (key: string) => string,
  fallbackEntityName: string
): string {
  const rawMsg = (message || "").replace(/\.$/, "");
  const match = rawMsg.match(/Cannot deactivate\/delete this (.*?) because it is referenced in:\s*(.*)/i);
  if (match) {
    const entity = match[1];
    const tables = match[2];
    
    let entityName = fallbackEntityName;
    const lowerEntity = entity.toLowerCase();
    
    if (lowerEntity.includes("subtype") || lowerEntity.includes("sub type") || lowerEntity.includes("assetsubtypeofuse")) {
      try { entityName = t("subtype.title") || t("subType.title"); } catch {}
    } else if (lowerEntity.includes("typeofuse") || lowerEntity.includes("type of use") || lowerEntity.includes("assettypeofuse")) {
      try { entityName = t("type.title"); } catch {}
    } else if (lowerEntity.includes("group")) {
      try { entityName = t("group.title"); } catch {}
    }
    
    try {
      const translation = t("apiErrors.referencedIn", { entity: entityName, tables });
      if (translation && translation !== "apiErrors.referencedIn") {
        return translation;
      }
    } catch {}

    return `Cannot deactivate or delete this ${entityName} because it is referenced in: ${tables}.`;
  }
  
  try {
    const key = `apiErrors.${rawMsg}`;
    const translated = t(key as never);
    if (translated && translated !== key && !translated.includes(key)) {
      return translated;
    }
  } catch {}

  return statusCode === 409
    ? (t("apiErrors.inUse") || "Record is in use.")
    : (t("apiErrors.operationFailed") || tCommon("errors.generic") || tCommon("errors.deleteError"));
}
