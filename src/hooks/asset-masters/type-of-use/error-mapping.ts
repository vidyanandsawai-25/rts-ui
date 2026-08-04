import { mapSharedApiError, SharedErrorMapOptions } from "@/lib/utils/asset-utils/shared-error-mapping";

export function getErrorMessage(
  message: string | undefined,
  statusCode: number | undefined,
  t: (key: string, values?: Record<string, string>) => string,
  tCommon: (key: string) => string,
  fallbackEntityName: string
): string {
  return mapSharedApiError({
    message,
    statusCode,
    t: t as SharedErrorMapOptions["t"],
    tCommon: tCommon as SharedErrorMapOptions["tCommon"],
    fallbackEntityName,
    entityMatchers: [
      { test: /subtype|sub type|assetsubtypeofuse/i, labelKey: "subtype.title" },
      { test: /typeofuse|type of use|assettypeofuse/i, labelKey: "type.title" },
      { test: /group/i, labelKey: "group.title" }
    ]
  });
}
