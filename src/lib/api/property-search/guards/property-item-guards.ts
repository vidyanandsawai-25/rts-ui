/**
 * Property Search item type guards and normalization.
 */

import { ApiError } from "@/lib/utils/api";
import type {
  PropertySearchApiItem,
  PropertySearchApiResponse,
} from "@/types/property-search-api.types";
import {
  PROPERTY_STATUSES,
  type PropertyStatus,
  type SearchResult,
} from "@/types/property-search.types";
import type { PagedResponse } from "@/types/common.types";

function readField(obj: Record<string, unknown>, camel: string, pascal: string): unknown {
  if (Object.prototype.hasOwnProperty.call(obj, camel) && obj[camel] != null) {
    return obj[camel];
  }
  if (Object.prototype.hasOwnProperty.call(obj, pascal) && obj[pascal] != null) {
    return obj[pascal];
  }
  return undefined;
}

function resolvePropertyId(obj: Record<string, unknown>): number {
  const raw =
    readField(obj, "propertyId", "PropertyId") ??
    readField(obj, "id", "Id");
  return Number(raw);
}

export function isPropertySearchApiItem(
  value: unknown
): value is PropertySearchApiItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  const propertyId = resolvePropertyId(obj);
  return Number.isFinite(propertyId) && propertyId > 0;
}

function toOptionalNumber(value: unknown): number | null {
  if (value == null || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toRawText(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function readApiText(
  obj: Record<string, unknown>,
  camel: string,
  pascal: string
): string {
  const raw = readField(obj, camel, pascal);
  return raw == null ? "" : String(raw).trim();
}

function normalizePropertySearchApiItem(
  raw: Record<string, unknown>
): PropertySearchApiItem {
  return {
    propertyId: resolvePropertyId(raw),
    upicId: readApiText(raw, "upicId", "UpicId") || null,
    zoneName: readApiText(raw, "zoneName", "ZoneName") || null,
    wardName: readApiText(raw, "wardName", "WardName") || null,
    propertyNo: readApiText(raw, "propertyNo", "PropertyNo") || null,
    partitionNo: readApiText(raw, "partitionNo", "PartitionNo") || null,
    oldPropertyNo: readApiText(raw, "oldPropertyNo", "OldPropertyNo") || null,
    citySurveyNo:
      readApiText(raw, "citySurveyNo", "CitySurveyNo") ||
      readApiText(raw, "cityServeyNo", "CityServeyNo") ||
      null,
    plotNo: readApiText(raw, "plotNo", "PlotNo") || null,
    wingFlatNo: readApiText(raw, "wingFlatNo", "WingFlatNo") || null,
    propertyCount:
      toOptionalNumber(readField(raw, "propertyCount", "PropertyCount")) ?? null,
    categoryName: readApiText(raw, "categoryName", "CategoryName") || null,
    propertyDescription:
      readApiText(raw, "propertyDescription", "PropertyDescription") || null,
    mobile: readApiText(raw, "mobile", "Mobile") || null,
    propertyHolderName:
      readApiText(raw, "propertyHolderName", "PropertyHolderName") || null,
    occupierName: readApiText(raw, "occupierName", "OccupierName") || null,
    shopBuildingName:
      readApiText(raw, "shopBuildingName", "ShopBuildingName") || null,
    societyName: readApiText(raw, "societyName", "SocietyName") || null,
    address: readApiText(raw, "address", "Address") || null,
    rv: toOptionalNumber(readField(raw, "rv", "Rv")),
    cv: toOptionalNumber(readField(raw, "cv", "Cv")),
    rvcv: toOptionalNumber(readField(raw, "rvcv", "Rvcv")),
    totalTax: toOptionalNumber(readField(raw, "totalTax", "TotalTax")),
    status: readApiText(raw, "status", "Status") || null,
  };
}

function normalizePropertyStatus(raw: string | null | undefined): PropertyStatus {
  const trimmed = raw?.trim();
  if (trimmed && (PROPERTY_STATUSES as readonly string[]).includes(trimmed)) {
    return trimmed as PropertyStatus;
  }
  return PROPERTY_STATUSES[0];
}

export function normalizePropertySearchItem(
  data: PropertySearchApiItem | Record<string, unknown>
): SearchResult {
  const item =
    typeof data === "object" &&
    data !== null &&
    "propertyId" in data &&
    typeof (data as PropertySearchApiItem).propertyId === "number"
      ? (data as PropertySearchApiItem)
      : normalizePropertySearchApiItem(data as Record<string, unknown>);

  const propertyId = Number(item.propertyId);
  if (!Number.isFinite(propertyId) || propertyId <= 0) {
    throw new ApiError(
      500,
      "Invalid data received from server",
      `Invalid propertyId: ${item.propertyId}`
    );
  }

  const legacyRvCv = toOptionalNumber(item.rvcv);
  const rv = toOptionalNumber(item.rv) ?? legacyRvCv ?? 0;
  const cv =
    item.rv != null || item.cv != null
      ? toOptionalNumber(item.cv)
      : legacyRvCv;

  return {
    id: item.upicId || `prop-${propertyId}`,
    propertyId,
    upicId: toRawText(item.upicId),
    zone: toRawText(item.zoneName),
    ward: toRawText(item.wardName),
    propertyNo: toRawText(item.propertyNo),
    partitionNo: toRawText(item.partitionNo),
    oldPropertyNo: toRawText(item.oldPropertyNo),
    citySurveyNo: toRawText(item.citySurveyNo ?? item.cityServeyNo),
    plotNo: toRawText(item.plotNo),
    wingFlatNo: toRawText(item.wingFlatNo),
    propertyCount: item.propertyCount ?? 0,
    category: toRawText(item.categoryName),
    description: toRawText(item.propertyDescription),
    mobile: toRawText(item.mobile),
    holderName: toRawText(item.propertyHolderName),
    holderNameMarathi: "",
    occupierName: toRawText(item.occupierName),
    occupierNameMarathi: "",
    shopBuildingName: toRawText(item.shopBuildingName),
    societyName: toRawText(item.societyName),
    address: toRawText(item.address),
    rv,
    cv,
    totalTax: toOptionalNumber(item.totalTax) ?? 0,
    status: normalizePropertyStatus(item.status),
  };
}

export function isPropertySearchApiResponse(
  value: unknown
): value is PropertySearchApiResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.success === "boolean" &&
    typeof obj.items === "object" &&
    obj.items !== null &&
    (Array.isArray((obj.items as Record<string, unknown>).items) ||
      Array.isArray((obj.items as Record<string, unknown>).Items))
  );
}

function isDirectPagedPropertySearch(
  value: unknown
): value is PagedResponse<unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return Array.isArray(obj.items);
}

function extractPropertySearchRawItems(data: unknown): unknown[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const obj = data as Record<string, unknown>;

  if (Array.isArray(obj.items)) {
    return obj.items;
  }

  const nestedItems = obj.items;
  if (nestedItems && typeof nestedItems === "object") {
    const nested = nestedItems as Record<string, unknown>;
    if (Array.isArray(nested.items)) {
      return nested.items;
    }
    if (Array.isArray(nested.Items)) {
      return nested.Items;
    }
  }

  const nestedData = obj.data;
  if (nestedData && typeof nestedData === "object") {
    const dataObj = nestedData as Record<string, unknown>;
    if (Array.isArray(dataObj.items)) {
      return dataObj.items;
    }
    if (Array.isArray(dataObj.Items)) {
      return dataObj.Items;
    }
  }

  return [];
}

function mapPropertySearchItems(rawItems: unknown[]): SearchResult[] {
  return rawItems
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    )
    .map((item) => {
      try {
        return normalizePropertySearchItem(item);
      } catch {
        return null;
      }
    })
    .filter((item): item is SearchResult => item !== null);
}

const EMPTY_PROPERTY_SEARCH_PAGE: PagedResponse<SearchResult> = {
  items: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 0,
  hasPrevious: false,
  hasNext: false,
};

export function normalizePropertySearchResponse(
  data: unknown
): PagedResponse<SearchResult> {
  if (isDirectPagedPropertySearch(data)) {
    const items = mapPropertySearchItems(data.items);
    return {
      items,
      totalCount: data.totalCount ?? items.length,
      pageNumber: data.pageNumber ?? 1,
      pageSize: data.pageSize ?? 10,
      totalPages: data.totalPages ?? 0,
      hasPrevious: data.hasPrevious ?? false,
      hasNext: data.hasNext ?? false,
    };
  }

  const rawItems = extractPropertySearchRawItems(data);
  if (rawItems.length > 0 || isPropertySearchApiResponse(data)) {
    if (
      isPropertySearchApiResponse(data) &&
      data.success === false
    ) {
      throw new ApiError(
        500,
        data.errors || data.message || "Property search request failed",
        data.message || "Property search request failed"
      );
    }

    const items = mapPropertySearchItems(rawItems);
    const envelopeItems =
      typeof data === "object" && data !== null
        ? ((data as Record<string, unknown>).items as
            | Record<string, unknown>
            | undefined)
        : undefined;

    return {
      items,
      totalCount:
        Number(envelopeItems?.totalCount ?? envelopeItems?.TotalCount) ||
        items.length,
      pageNumber:
        Number(envelopeItems?.pageNumber ?? envelopeItems?.PageNumber) || 1,
      pageSize:
        Number(envelopeItems?.pageSize ?? envelopeItems?.PageSize) || 10,
      totalPages:
        Number(envelopeItems?.totalPages ?? envelopeItems?.TotalPages) || 0,
      hasPrevious: Boolean(
        envelopeItems?.hasPrevious ?? envelopeItems?.HasPrevious
      ),
      hasNext: Boolean(envelopeItems?.hasNext ?? envelopeItems?.HasNext),
    };
  }

  return EMPTY_PROPERTY_SEARCH_PAGE;
}
