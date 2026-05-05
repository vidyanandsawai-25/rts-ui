"use server";
import { getUseTypesPagedServer } from "@/lib/api/typeofusemaster.service";
import type { UseType } from "@/types/typeOfUse.types";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import { createPropertyType, deletePropertyType, getPropertyTypesPaged, getPropertyTypeById, updatePropertyType } from "@/lib/api/property-type-crud.service";
import { getPropertyTypeAndTypeOfUseValidation, getValidationByPropertyTypeId, updatePropertyTypeValidations } from "@/lib/api/property-type-validation-mapping.service";
import { getPropertyTypeCategories } from "@/lib/api/property-type-category.service";
import { ApiError } from "@/lib/utils/api";
import { PropertyType, PropertyTypeFormModel, PropertyTypeAndTypeOfUseValidation } from "@/types/property-type.types";
import { PropertyTypeCategory } from "@/types/property-type-category.types";
import { PagedResponse } from "@/types/common.types";

// SSR action to fetch all TypeOfUse (for PropertyTypeForm)
// Uses -1 pageSize to fetch all records without pagination
export async function getTypeOfUseListAction(): Promise<UseType[]> {
  try {
    const result = await getUseTypesPagedServer({ pageNumber: 1, pageSize: -1 });
    return result.items;
  } catch (error) {
    throw error; // Rethrow so UI can distinguish between 'no data' and 'failed to load'
  }
}

export async function fetchPropertyTypePagedServerAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<PagedResponse<PropertyType>> {
  try {
    // Basic validation with upper bounds
    const MAX_PAGE_SIZE = 100;
    const MAX_PAGE_NUMBER = 10000;
    if (
      !Number.isFinite(pageNumber) ||
      !Number.isFinite(pageSize) ||
      pageNumber <= 0 ||
      pageSize <= 0 ||
      pageSize > MAX_PAGE_SIZE ||
      pageNumber > MAX_PAGE_NUMBER
    ) {
      throw new ApiError(400, "Invalid pagination parameters", "Validation failed");
    }

    // Validate sortBy against allowed columns to prevent injection
    const allowedSortColumns = ["propertyDescription", "type", "propertyTypeGroup"];
    const validSortBy = sortBy && allowedSortColumns.includes(sortBy) ? sortBy : undefined;
    const validSortOrder = sortOrder && ["asc", "desc"].includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : undefined;

    const result = await getPropertyTypesPaged(pageNumber, pageSize, searchTerm, validSortBy, validSortOrder);
    return result;
  } catch (error: unknown) {
    // Re-throw the error so Next.js error boundary can catch it
    throw error;
  }
}

export async function createPropertyTypeAction(
  data: PropertyTypeFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number; createdId?: number }> {
  try {
    const createdPropertyType = await createPropertyType(data);
    
    // Revalidate all locale variants of the property type page
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/propertytype`, "page");
    }
    
    // If API returned the created entity with ID, use it directly
    if (createdPropertyType?.id) {
      return { success: true, createdId: createdPropertyType.id };
    }
    
    // Fallback: API didn't return the ID, search for the newly created record
    // Fetch ALL records matching the description (-1 pageSize = fetch all without pagination)
    try {
      const searchResult = await getPropertyTypesPaged(1, -1, data.propertyDescription.trim());
      const match = searchResult.items.find(
        (item) =>
          item.propertyDescription === data.propertyDescription.trim() &&
          item.type === data.type.trim()
      );
      if (match?.id) {
        return { success: true, createdId: match.id };
      }
      // Fallback search found no exact match; still return success
    } catch (_searchError) {
      // Fallback search failed; still return success
    }
    
    // Property type created but couldn't retrieve ID - still success
    // Type of use validations won't be saved, but core entity is created
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.responseText,
        statusCode: error.statusCode
      };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to create property type" };
  }
}

/* ================= UPDATE ================= */
export async function updatePropertyTypeAction(
  data: PropertyTypeFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    await updatePropertyType(data);
    // Revalidate all locale variants of the property type page
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/propertytype`, "page");
    }
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.responseText,
        statusCode: error.statusCode
      };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to update property type" };
  }
}

export async function deletePropertyTypeAction(
  formData: FormData
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  const rawId = formData.get("id");
  const id =
    typeof rawId === "string" ? parseInt(rawId, 10) : 0;

  if (!id || id <= 0) {
    return {
      success: false,
      message: "Valid Property Type ID is required",
      statusCode: 400,
    };
  }

  try {
    await deletePropertyType(id);

    // Revalidate all locale variants of the property type page
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/propertytype`, "page");
    }
    return {
      success: true,
      message: "Property type deleted successfully",
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.responseText,
        statusCode: error.statusCode,
      };
    }

    return {
      success: false,
      message: "Failed to delete property type",
    };
  }
}

export async function getPropertyTypeByIdAction(
  id: number
): Promise<PropertyType> {
  try {
    if (!id || id <= 0) {
      throw new ApiError(400, "Valid Property Type ID is required", "Validation failed");
    }
    const result = await getPropertyTypeById(id);
    if (!result) {
      throw new ApiError(404, "Property Type not found", "Not Found");
    }
    return result;
  } catch (error) {
    throw error; // rethrow so UI can handle it
  }
}

export async function getPropertyTypeCategoriesAction(): Promise<PropertyTypeCategory[]> {
  try {
    const result = await getPropertyTypeCategories();
    return result;
  } catch (error) {
    throw error; // rethrow so UI does not treat a load failure as "no categories"
  }
}

// SSR action to fetch PropertyType to TypeOfUse validation mappings
export async function getPropertyTypeAndTypeOfUseValidationAction(): Promise<PropertyTypeAndTypeOfUseValidation[]> {
  try {
    const result = await getPropertyTypeAndTypeOfUseValidation();
    return result;
  } catch (error) {
    throw error; // rethrow so UI does not treat a load failure as 'no validations'
  }
}

// SSR action to fetch validation mappings for specific property type IDs (optimized for list page)
export async function getValidationsByPropertyTypeIdsAction(
  propertyTypeIds: number[]
): Promise<PropertyTypeAndTypeOfUseValidation[]> {
  try {
    if (!propertyTypeIds || propertyTypeIds.length === 0) {
      return [];
    }
    
    // Fetch validations for each property type in parallel using server-side filtering
    // This avoids downloading the entire validation table
    const validationPromises = propertyTypeIds.map((id) => 
      getValidationByPropertyTypeId(id)
    );
    
    const validationArrays = await Promise.all(validationPromises);
    
    // Flatten the array of arrays into a single array
    return validationArrays.flat();
  } catch (error) {
    throw error; // rethrow so the UI does not treat load failure as "no mappings"
  }
}

// Action to update TypeOfUse validation mappings for a property type
export async function updatePropertyTypeValidationsAction(
  propertyTypeId: number,
  typeOfUseIds: number[]
): Promise<{ success: boolean; message?: string }> {
  try {
    await updatePropertyTypeValidations(propertyTypeId, typeOfUseIds);
    // Revalidate all locale variants of the property type page
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/propertytype`, "page");
    }
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to update type of use validation" };
  }
}
