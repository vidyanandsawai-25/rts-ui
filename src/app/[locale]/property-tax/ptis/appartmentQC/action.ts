"use server";

import { revalidatePath } from "next/cache";
import type { ApartmentQCDetail, ApartmentQCSearchParams } from "@/types/apartmentQC.types";
import {
  getApartmentQCDetailsLocalized,
  getApartmentQCDetailsSafe,
  updateApartmentQCDetailsLocalized,
} from "@/lib/api/appartmentQC.service";
import { ApiError } from "@/lib/utils/api";

/* ============================================================
   ACTION RESULT TYPE
 ============================================================ */

export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string };

/* ============================================================
   ERROR HELPERS
 ============================================================ */

/**
 * Convert translation keys or error messages to user-facing strings.
 * If the input looks like a translation key (e.g., "ptis.apartmentQC.errors.fetchFailed"),
 * convert it to a human-readable message as a fallback.
 */
function toUserFacingErrorMessage(messageOrKey: string): string {
  const value = messageOrKey.trim();
  if (!value) {
    return "An unexpected error occurred.";
  }

  // Check if it looks like a translation key (dotted notation)
  const looksLikeTranslationKey = /^[a-z0-9]+(?:\.[a-z0-9]+)+$/i.test(value);
  
  if (!looksLikeTranslationKey) {
    // Already a plain message, return as-is
    return value;
  }

  // Extract the last segment and convert camelCase/PascalCase to readable text
  const fallbackMessage = value
    .split(".")
    .pop()
    ?.replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim();

  if (!fallbackMessage) {
    return "An unexpected error occurred.";
  }

  // Capitalize first letter
  return fallbackMessage.charAt(0).toUpperCase() + fallbackMessage.slice(1);
}

function handleActionError(error: unknown, defaultKey: string): { success: false; error: string } {
  if (error instanceof ApiError) {
    return {
      success: false,
      error: toUserFacingErrorMessage(error.contextMessage || defaultKey),
    };
  }
  return { success: false, error: toUserFacingErrorMessage(defaultKey) };
}

/* ============================================================
   SEARCH / FETCH ACTIONS
 ============================================================ */

/**
 * Fetch apartment QC detail records for the given search parameters.
 */
export async function fetchApartmentQCDetailsAction(
  params: ApartmentQCSearchParams
): Promise<ActionResult<ApartmentQCDetail[]>> {
  try {
    const data = await getApartmentQCDetailsLocalized(params);
    return {
      success: true,
      data: data.items ?? [],
      message: data.message,
    };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to fetch apartment QC details");
  }
}

/**
 * Fetch apartment QC detail records with full pagination response metadata.
 */
export async function fetchApartmentQCDetailsPagedAction(
  params: ApartmentQCSearchParams
): Promise<ActionResult<{
  items: ApartmentQCDetail[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}>> {
  try {
    const data = await getApartmentQCDetailsLocalized(params);
    return {
      success: true,
      data: {
        items: data.items ?? [],
        totalCount: data.totalCount ?? data.items?.length ?? 0,
        totalPages: data.totalPages ?? 1,
        pageNumber: data.pageNumber ?? 1,
        pageSize: data.pageSize ?? (data.items?.length || 10),
        hasNext: !!data.hasNext,
        hasPrevious: !!data.hasPrevious
      },
      message: data.message,
    };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to fetch apartment QC details with pagination");
  }
}

/**
 * Safe variant — always resolves; returns an empty array on API failure.
 */
export async function fetchApartmentQCDetailsSafeAction(
  params: ApartmentQCSearchParams
): Promise<ApartmentQCDetail[]> {
  try {
    return await getApartmentQCDetailsSafe(params);
  } catch {
    return [];
  }
}

/**
 * Update apartment QC property details.
 */
export async function updateApartmentQCAction(
  propertyDetailsId: number | string,
  payload: Partial<ApartmentQCDetail>
): Promise<ActionResult<ApartmentQCDetail>> {
  try {
    const data = await updateApartmentQCDetailsLocalized(propertyDetailsId, payload);
    // Revalidate for all locales by using the base path pattern
    revalidatePath("/[locale]/property-tax/ptis/appartmentQC", "page");
    return {
      success: true,
      data,
      message: "Apartment QC details updated successfully",
    };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to update apartment QC details");
  }
}

/**
 * Fetch details by WardId only.
 */
export async function fetchApartmentQCByWardAction(
  wardId: number | string
): Promise<ActionResult<ApartmentQCDetail[]>> {
  return fetchApartmentQCDetailsAction({ wardId });
}

/**
 * Fetch details by WardId + PropertyNo.
 */
export async function fetchApartmentQCByPropertyAction(
  wardId: number | string,
  propertyNo: number | string
): Promise<ActionResult<ApartmentQCDetail[]>> {
  return fetchApartmentQCDetailsAction({ wardId, propertyNo: String(propertyNo) });
}

/* ============================================================
   REVALIDATION HELPER
 ============================================================ */

export async function revalidateApartmentQCAction(): Promise<ActionResult> {
  try {
    // Revalidate for all locales by using the base path pattern
    revalidatePath("/[locale]/property-tax/ptis/appartmentQC", "page");
    return { success: true, message: "Apartment QC data refreshed" };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to refresh apartment QC data");
  }
}
