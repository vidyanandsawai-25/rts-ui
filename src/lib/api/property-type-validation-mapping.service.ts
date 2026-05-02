import { apiClient } from "@/services/api.service";
import { PropertyTypeAndTypeOfUseValidation } from "@/types/property-type.types";
import { ApiError } from "@/lib/utils/api";

/** Fetches all PropertyType to TypeOfUse validation mappings */
export async function getPropertyTypeAndTypeOfUseValidation(): Promise<PropertyTypeAndTypeOfUseValidation[]> {
  try {
    // Use -1 for page and pageSize to fetch all results (no pagination)
    const response = await apiClient.get<{ items: PropertyTypeAndTypeOfUseValidation[]; totalCount: number }>(
      "/PropertyDescriptionAndTypeOfUseValidation?page=-1&pageSize=-1"
    );
    if (!response.success) {
      throw new ApiError(response.statusCode ?? 500, response.error || "Failed to fetch type of use validation", "Get validation failed");
    }
    return response.data?.items ?? [];
  } catch (error) {
    console.error("Error fetching property type and type of use validation:", error);
    throw error;
  }
}

/** Fetches validation mappings for a specific property type */
export async function getValidationByPropertyTypeId(propertyTypeId: number): Promise<PropertyTypeAndTypeOfUseValidation[]> {
  try {
    const allValidations = await getPropertyTypeAndTypeOfUseValidation();
    return allValidations.filter((v) => v.propertyTypeId === propertyTypeId);
  } catch (error) {
    console.error(`Error fetching validation for property type ${propertyTypeId}:`, error);
    throw error;
  }
}

/** Creates a new PropertyType to TypeOfUse validation mapping */
export async function createPropertyTypeValidation(
  propertyTypeId: number,
  typeOfUseId: number
): Promise<PropertyTypeAndTypeOfUseValidation> {
  try {
    const payload = {
      propertyTypeId,
      typeOfUseId,
      isActive: true,
      createdBy: 1, // TODO: Get from auth context
    };
    const response = await apiClient.post<PropertyTypeAndTypeOfUseValidation>(
      "/PropertyDescriptionAndTypeOfUseValidation",
      payload
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to create validation mapping",
        "Create validation failed"
      );
    }
    return response.data!;
  } catch (error) {
    console.error("Error creating property type validation mapping:", error);
    throw error;
  }
}

/** Creates multiple PropertyType to TypeOfUse validation mappings */
export async function createPropertyTypeValidationBulk(
  propertyTypeId: number,
  typeOfUseIds: number[]
): Promise<void> {
  try {
    // Create all mappings in parallel
    await Promise.all(
      typeOfUseIds.map((typeOfUseId) =>
        createPropertyTypeValidation(propertyTypeId, typeOfUseId)
      )
    );
  } catch (error) {
    console.error("Error creating bulk property type validation mappings:", error);
    throw error;
  }
}

/** Deletes a PropertyType to TypeOfUse validation mapping by ID */
export async function deletePropertyTypeValidation(id: number): Promise<void> {
  try {
    const response = await apiClient.delete<void>(
      `/PropertyDescriptionAndTypeOfUseValidation/${encodeURIComponent(String(id))}`
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to delete validation mapping",
        "Delete validation failed"
      );
    }
  } catch (error) {
    console.error(`Error deleting property type validation ${id}:`, error);
    throw error;
  }
}

/** Deletes all validation mappings for a specific property type */
export async function deleteValidationsByPropertyTypeId(propertyTypeId: number): Promise<void> {
  try {
    const validations = await getValidationByPropertyTypeId(propertyTypeId);
    await Promise.all(validations.map((v) => deletePropertyTypeValidation(v.id)));
  } catch (error) {
    console.error(`Error deleting validations for property type ${propertyTypeId}:`, error);
    throw error;
  }
}

/** Updates validation mappings for a property type (replaces all existing with new set) */
export async function updatePropertyTypeValidations(
  propertyTypeId: number,
  newTypeOfUseIds: number[]
): Promise<void> {
  try {
    // Get existing mappings
    const existingValidations = await getValidationByPropertyTypeId(propertyTypeId);
    const existingTypeOfUseIds = existingValidations.map((v) => v.typeOfUseId);

    // Determine what to add and what to remove
    const toAdd = newTypeOfUseIds.filter((id) => !existingTypeOfUseIds.includes(id));
    const toRemove = existingValidations.filter((v) => !newTypeOfUseIds.includes(v.typeOfUseId));

    // 1. Create new mappings first (atomic phase 1)
    let createdMappings: { id: number; typeOfUseId: number }[] = [];
    try {
      createdMappings = await Promise.all(
        toAdd.map(async (typeOfUseId) => {
          const created = await createPropertyTypeValidation(propertyTypeId, typeOfUseId);
          return { id: created.id, typeOfUseId };
        })
      );
    } catch (addError) {
      // If any add fails, rollback all adds
      await Promise.all(
        createdMappings.map((m) => deletePropertyTypeValidation(m.id))
      );
      console.error(`Error adding new validations for property type ${propertyTypeId}, rolled back adds:`, addError);
      throw addError;
    }

    // 2. Delete removed mappings (atomic phase 2)
    try {
      await Promise.all(toRemove.map((v) => deletePropertyTypeValidation(v.id)));
    } catch (deleteError) {
      // If any delete fails, rollback adds (delete the ones we just added)
      await Promise.all(
        createdMappings.map((m) => deletePropertyTypeValidation(m.id))
      );
      console.error(`Error deleting old validations for property type ${propertyTypeId}, rolled back adds:`, deleteError);
      throw deleteError;
    }
  } catch (error) {
    console.error(`Error updating validations for property type ${propertyTypeId}:`, error);
    throw error;
  }
}
