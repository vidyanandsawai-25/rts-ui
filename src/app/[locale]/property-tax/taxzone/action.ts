
"use server";

import { revalidatePath } from "next/cache";
import { createTaxZone, updateTaxZone, deleteTaxZone, getTaxZonePagedServer, getTaxZoneById, ApiError } from "@/lib/api/taxzone.services";
import type { PagedResponse, TaxZone } from "@/types/taxzone.types";
import { validateRequiredStringFromFormData } from "@/lib/utils/validation-helpers";

export async function getTaxZonePagedAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<PagedResponse<TaxZone>> {
  return await getTaxZonePagedServer(pageNumber, pageSize, searchTerm);
}

export async function getTaxZoneByIdAction(taxZoneId: string | number): Promise<TaxZone> {
  return await getTaxZoneById(taxZoneId);
}

export async function deleteTaxZoneAction(formData: FormData) {
  // ✅ Use generic reusable validator
  const locale = validateRequiredStringFromFormData(formData, "locale");
  const taxZoneIdRaw = validateRequiredStringFromFormData(formData, "taxZoneId");
  
  // Validate taxZoneId is a positive number
  const taxZoneId = Number(taxZoneIdRaw);
  if (!Number.isFinite(taxZoneId) || taxZoneId <= 0) {
    throw new Error("Invalid taxZoneId: must be a positive number");
  }

  await deleteTaxZone(taxZoneId);
  revalidatePath(`/${locale}/property-tax/taxzone`);
}

export async function saveTaxZone(id: string, formData: FormData) {
  // ✅ Use generic reusable validator with error handling
  let locale: string;
  try {
    locale = validateRequiredStringFromFormData(formData, "locale");
  } catch {
    return {
      ok: false,
      error: "invalid_locale",
    };
  }
  
  const taxZoneNo = (formData.get("taxZoneNo") as string) || "";
  const taxZoneType = (formData.get("taxZoneType") as string) || "";
  const remark = (formData.get("remark") as string) || "";
  const isActive = (formData.get("isActive") as string) === "true";
  
  // ✅ Validate id parameter - must be empty or a valid number
  let numericId: number | undefined = undefined;
  let isUpdate = false;

  if (id && id.trim() !== "") {
    numericId = Number(id);
    
    // ❌ Reject malformed IDs - security fix
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return {
        ok: false,
        error: "invalid_id",
      };
    }
    
    isUpdate = true;
  }
  
  const payload = {
    taxZoneId: numericId,
    taxZoneNo: taxZoneNo,
    taxZoneType: taxZoneType,
    remark: remark,
    isActive: isActive,
  };

  try {
    if (isUpdate) {
      await updateTaxZone(payload);
      revalidatePath(`/${locale}/property-tax/taxzone`);
      return { ok: true, mode: "update" as const };
    } else {
      await createTaxZone(payload);
      revalidatePath(`/${locale}/property-tax/taxzone`);
      return { ok: true, mode: "create" as const };
    }
  } catch (error) {
    // Handle 409 Conflict (duplicate record)
    if (error instanceof ApiError && error.statusCode === 409) {
      return {
        ok: false,
        error: "duplicate",
      };
    }
    
    // Handle other API errors
    if (error instanceof ApiError) {
      return {
        ok: false,
        error: "api_error",
        message: error.message || "An error occurred while saving the record.",
      };
    }
    
    // Handle generic errors
    return {
      ok: false,
      error: "unknown",
      message: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }
}

