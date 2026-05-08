"use server";

import { revalidatePath } from "next/cache";
import type { ApartmentQCDetail, ApartmentQCSearchParams } from "@/types/apartmentQC.types";
import {
  getApartmentQCDetails,
  getApartmentQCDetailsSafe,
} from "@/lib/api/appartmentQC.service";

/* ============================================================
   ACTION RESULT TYPE
============================================================ */

export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string };

/* ============================================================
   ERROR HELPERS
============================================================ */

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  );
}

function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  return "Something went wrong";
}

/* ============================================================
   SEARCH / FETCH ACTIONS
============================================================ */

/**
 * Fetch apartment QC detail records for the given search parameters.
 * Supports pagination, sorting, and advanced search filters.
 */
export async function fetchApartmentQCDetailsAction(
  params: ApartmentQCSearchParams
): Promise<ActionResult<ApartmentQCDetail[]>> {
  try {
    const res = await getApartmentQCDetails(params);

    if (!res.success || !res.data?.success) {
      return {
        success: false,
        error:
          res.data?.message ||
          res.error ||
          "Failed to fetch apartment QC details",
      };
    }

    return {
      success: true,
      data: res.data.items ?? [],
      message: res.data.message,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Fetch apartment QC detail records with full pagination response metadata.
 * Useful for building data tables with pagination controls.
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
    const res = await getApartmentQCDetails(params);

    if (!res.success || !res.data?.success) {
      return {
        success: false,
        error: res.data?.message || res.error || "Failed to fetch paged records",
      };
    }

    // Note: The API response might return items directly or via a paged structure.
    // Based on the provided response schema, it's an envelope with "items".
    // If pagination meta is added to the envelope, we can extract it here.

    return {
      success: true,
      data: {
        items: res.data.items ?? [],
        totalCount: res.data.totalCount ?? res.data.items?.length ?? 0,
        totalPages: res.data.totalPages ?? 1,
        pageNumber: res.data.pageNumber ?? 1,
        pageSize: res.data.pageSize ?? (res.data.items?.length || 10),
        hasNext: !!res.data.hasNext,
        hasPrevious: !!res.data.hasPrevious
      },
      message: res.data.message,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Safe variant — always resolves; returns an empty array on API failure.
 * Useful for server-component data loading where a hard error is undesirable.
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
  return fetchApartmentQCDetailsAction({ wardId, propertyNo });
}

/**
 * Fetch details with all three search parameters.
 */
export async function fetchApartmentQCFullSearchAction(
  wardId: number | string,
  propertyNo: number | string,
  partType: string
): Promise<ActionResult<ApartmentQCDetail[]>> {
  return fetchApartmentQCDetailsAction({ wardId, propertyNo, partType });
}

/* ============================================================
   REVALIDATION HELPER
   Call after any mutation that affects the listing page.
============================================================ */

export async function revalidateApartmentQCAction(): Promise<ActionResult> {
  try {
    revalidatePath("/property-tax/appartmentQC");
    return { success: true, message: "Cache revalidated" };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
