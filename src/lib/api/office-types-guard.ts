import { Office } from "@/types/office.types";
import { PagedResponse } from "@/types/common.types";
import { ApiError } from "@/lib/utils/api";
import { parseBoolean } from "@/lib/utils/type-guards";

/**
 * Type guard for PagedResponse<Office>
 */
export function isPagedResponse(value: unknown): value is PagedResponse<Office> {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    Array.isArray(obj.items) &&
    typeof obj.totalCount === "number" &&
    typeof obj.pageNumber === "number" &&
    typeof obj.pageSize === "number"
  );
}

/**
 * Type guard for Office - validates structure before normalization
 */
export function isOfficeShape(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  
  const officeId = Number(obj.officeId ?? obj.id);
  return Number.isFinite(officeId) && officeId > 0;
}

/**
 * Normalizes and validates an office object
 * @throws ApiError if required fields are missing or invalid
 */
export function normalizeOffice(data: Record<string, unknown>): Office {
  const officeId = Number(data.officeId ?? data.id);
  if (!Number.isFinite(officeId) || officeId <= 0) {
    throw new ApiError(500, "Invalid office data: officeId is required", "Data normalization failed");
  }

  const officeCode = String(data.officeCode ?? "").trim();
  if (!officeCode) {
    throw new ApiError(500, "Invalid office data: officeCode is required", "Data normalization failed");
  }

  const officeName = String(data.officeName ?? "").trim();
  if (!officeName) {
    throw new ApiError(500, "Invalid office data: officeName is required", "Data normalization failed");
  }

  return {
    officeId,
    officeCode,
    officeName,
    type: String(data.type ?? "").trim(),
    address: String(data.address ?? "").trim(),
    city: String(data.city ?? "").trim(),
    pincode: String(data.pincode ?? "").trim(),
    phone: String(data.phone ?? "").trim(),
    emailId: String(data.emailId ?? "").trim(),
    officeIncharge: data.officeIncharge != null ? Number(data.officeIncharge) : null,
    designationMasterId: data.designationMasterId != null ? Number(data.designationMasterId) : null,
    establishedDate: data.establishedDate ? String(data.establishedDate) : null,
    isActive: parseBoolean(data.isActive ?? data.isStatus),
    createdDate: String(data.createdDate ?? ""),
    updatedDate: data.updatedDate != null ? String(data.updatedDate) : null,
  };
}
