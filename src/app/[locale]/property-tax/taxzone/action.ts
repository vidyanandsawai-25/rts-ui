
"use server";

import { revalidatePath } from "next/cache";
import { createTaxZone, updateTaxZone, deleteTaxZone, ApiError } from "@/lib/api/taxzone.services";

export async function deleteTaxZoneAction(formData: FormData) {
  const taxZoneId = formData.get("taxZoneId") as string;
  if (!taxZoneId) throw new Error("taxZoneId is required");

  await deleteTaxZone(taxZoneId);
  revalidatePath("/[locale]/property-tax/taxzone");
}

export async function saveTaxZone(id: string, formData: FormData) {
  const payload = {
    taxZoneId: id ? Number(id) : undefined,
    taxZoneNo: formData.get("taxZoneNo") as string,
    taxZoneType: formData.get("taxZoneType") as string,
    remark: (formData.get("remark") as string) || "",
    isActive: (formData.get("isActive") as string) === "true",
  };

  try {
    if (id) {
      await updateTaxZone(payload);
      revalidatePath("/[locale]/property-tax/taxzone");
      return { ok: true, mode: "update" as const };
    } else {
      await createTaxZone(payload);
      revalidatePath("/[locale]/property-tax/taxzone");
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

