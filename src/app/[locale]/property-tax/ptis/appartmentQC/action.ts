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

function handleActionError(error: unknown, defaultKey: string): { success: false; error: string } {
  if (error instanceof ApiError) {
    return { success: false, error: error.contextMessage };
  }
  return { success: false, error: defaultKey };
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
    return handleActionError(error, "ptis.apartmentQC.errors.fetchFailed");
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
    return handleActionError(error, "ptis.apartmentQC.errors.fetchPagedFailed");
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
    revalidatePath("/property-tax/ptis/appartmentQC");
    return {
      success: true,
      data,
      message: "ptis.apartmentQC.actions.updateSuccess",
    };
  } catch (error: unknown) {
    return handleActionError(error, "ptis.apartmentQC.errors.updateFailed");
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
    revalidatePath("/property-tax/ptis/appartmentQC");
    return { success: true, message: "ptis.apartmentQC.actions.refreshing" };
  } catch (error: unknown) {
    return handleActionError(error, "ptis.apartmentQC.errors.revalidateFailed");
  }
}
