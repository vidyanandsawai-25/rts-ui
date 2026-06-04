"use server";

import { revalidatePath } from "next/cache";
import {
  createPolicyConfiguration,
  updatePolicyConfiguration,
  deletePolicyConfiguration,
  getPolicyConfigurationsPagedServer,
  getPolicyConfigurationById,
  ApiError,
} from "@/lib/api/policy-configuration.services";
import type { PagedResponse, PolicyConfiguration } from "@/types/policy-configuration.types";
import {
  validateRequiredStringFromFormData,
  getOptionalStringFromFormData,
  getBooleanFromFormData,
} from "@/lib/utils/validation-helpers";
import { cookies } from "next/headers";
import { getUserIdFromCookies } from "@/lib/utils/cookie";

/** Server action to fetch paged Policy Configurations */
export async function getPolicyConfigurationsPagedAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<PagedResponse<PolicyConfiguration>> {
  return await getPolicyConfigurationsPagedServer(pageNumber, pageSize, searchTerm);
}

/** Server action to fetch a single Policy Configuration by ID */
export async function getPolicyConfigurationByIdAction(
  id: string | number
): Promise<PolicyConfiguration> {
  return await getPolicyConfigurationById(id);
}

/** Server action to delete a Policy Configuration */
export async function deletePolicyConfigurationAction(formData: FormData) {
  const locale = validateRequiredStringFromFormData(formData, "locale");
  const idRaw = validateRequiredStringFromFormData(formData, "id");
  
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Invalid id: must be a positive number");
  }

  await deletePolicyConfiguration(id);
  revalidatePath(`/${locale}/property-tax/policy-configuration`);
}

/** Server action to save (create or update) a Policy Configuration */
export async function savePolicyConfiguration(id: string, formData: FormData) {
  let locale: string;
  let policyCode: string;
  let category: string;
  let displayName: string;
  let description: string;
  let dataType: string;
  let policyValue: string;
  let defaultValue: string;
  let unit: string;
  let effectiveFrom: string;
  
  // Validate and parse required fields from FormData
  try {
    locale = validateRequiredStringFromFormData(formData, "locale");
  } catch {
    return { ok: false, error: "invalid_locale" };
  }
  
  try {
    policyCode = validateRequiredStringFromFormData(formData, "policyCode");
  } catch {
    return { ok: false, error: "invalid_policyCode" };
  }
  
  try {
    category = validateRequiredStringFromFormData(formData, "category");
  } catch {
    return { ok: false, error: "invalid_category" };
  }
  
  try {
    displayName = validateRequiredStringFromFormData(formData, "displayName");
  } catch {
    return { ok: false, error: "invalid_displayName" };
  }
  
  try {
    description = validateRequiredStringFromFormData(formData, "description");
  } catch {
    return { ok: false, error: "invalid_description" };
  }
  
  try {
    dataType = validateRequiredStringFromFormData(formData, "dataType");
  } catch {
    return { ok: false, error: "invalid_dataType" };
  }
  
  try {
    policyValue = validateRequiredStringFromFormData(formData, "policyValue");
  } catch {
    return { ok: false, error: "invalid_policyValue" };
  }
  
  try {
    defaultValue = validateRequiredStringFromFormData(formData, "defaultValue");
  } catch {
    return { ok: false, error: "invalid_defaultValue" };
  }
  
  try {
    unit = validateRequiredStringFromFormData(formData, "unit");
  } catch {
    return { ok: false, error: "invalid_unit" };
  }
  
  try {
    effectiveFrom = validateRequiredStringFromFormData(formData, "effectiveFrom");
  } catch {
    return { ok: false, error: "invalid_effectiveFrom" };
  }
  
  // Optional and helper fields
  const effectiveToRaw = getOptionalStringFromFormData(formData, "effectiveTo");
  const effectiveTo = effectiveToRaw && effectiveToRaw.trim() !== "" ? effectiveToRaw : null;
  const isActive = getBooleanFromFormData(formData, "isActive");
  
  const cookieStore = await cookies();
  const createdBy = getUserIdFromCookies(cookieStore) ?? undefined;
  
  let numericId: number | undefined = undefined;
  let isUpdate = false;

  // Validate ID if it is an update operation
  if (id && id.trim() !== "") {
    numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return {
        ok: false,
        error: "invalid_id",
      };
    }
    isUpdate = true;
  }
  
  const payload = {
    id: numericId,
    policyCode,
    category,
    displayName,
    description,
    dataType,
    policyValue,
    defaultValue,
    unit,
    effectiveFrom,
    effectiveTo,
    isActive,
    createdBy,
  };

  try {
    if (isUpdate) {
      await updatePolicyConfiguration(payload);
      revalidatePath(`/${locale}/property-tax/policy-configuration`);
      return { ok: true, mode: "update" as const };
    } else {
      await createPolicyConfiguration(payload);
      revalidatePath(`/${locale}/property-tax/policy-configuration`);
      return { ok: true, mode: "create" as const };
    }
  } catch (error) {
    // Handle 409 Conflict (e.g., duplicate policy codes)
    if (error instanceof ApiError && error.statusCode === 409) {
      return {
        ok: false,
        error: "duplicate",
      };
    }
    
    // Handle other specific API errors
    if (error instanceof ApiError) {
      return {
        ok: false,
        error: "api_error",
        message: error.message || "An error occurred while saving the record.",
      };
    }
    
    // Handle generic system errors
    return {
      ok: false,
      error: "unknown",
      message: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }
}
