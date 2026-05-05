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
    throw error;
  }
}

/** Fetches validation mappings for a specific property type */
export async function getValidationByPropertyTypeId(propertyTypeId: number): Promise<PropertyTypeAndTypeOfUseValidation[]> {
  try {
    // Fetch only validations for the specific property type by filtering on the server side
    const qs = new URLSearchParams();
    qs.set("page", "-1");
    qs.set("pageSize", "-1");
    qs.set("PropertyTypeId", String(propertyTypeId));
    
    const response = await apiClient.get<{ items: PropertyTypeAndTypeOfUseValidation[]; totalCount: number }>(
      `/PropertyDescriptionAndTypeOfUseValidation?${qs.toString()}`
    );
    
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch type of use validation",
        "Get validation failed"
      );
    }
    
    return response.data?.items ?? [];
  } catch (error) {
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
    throw error;
  }
}

/** Deletes all validation mappings for a specific property type */
export async function deleteValidationsByPropertyTypeId(propertyTypeId: number): Promise<void> {
  try {
    const validations = await getValidationByPropertyTypeId(propertyTypeId);
    await Promise.all(validations.map((v) => deletePropertyTypeValidation(v.id)));
  } catch (error) {
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

    // 1. Create new mappings one by one, tracking successes for rollback
    const createdMappings: { id: number; typeOfUseId: number }[] = [];
    let addError: Error | null = null;
    
    for (const typeOfUseId of toAdd) {
      try {
        const created = await createPropertyTypeValidation(propertyTypeId, typeOfUseId);
        createdMappings.push({ id: created.id, typeOfUseId });
      } catch (error) {
        addError = error as Error;
        break; // Stop on first failure
      }
    }

    // If any add failed, rollback all successful adds
    if (addError) {
      await Promise.all(
        createdMappings.map((m) => 
          deletePropertyTypeValidation(m.id).catch((_rollbackError) => {
            // Rollback failed - error already logged at service layer
          })
        )
      );
      throw addError;
    }

    // 2. Delete removed mappings one by one, tracking successes for rollback
    const deletedMappings: PropertyTypeAndTypeOfUseValidation[] = [];
    let deleteError: Error | null = null;
    
    for (const mapping of toRemove) {
      try {
        await deletePropertyTypeValidation(mapping.id);
        deletedMappings.push(mapping);
      } catch (error) {
        deleteError = error as Error;
        break; // Stop on first failure
      }
    }

    // If any delete failed, rollback everything
    if (deleteError) {
      // Restore deleted mappings by recreating them
      const restorePromises = deletedMappings.map((m) =>
        createPropertyTypeValidation(propertyTypeId, m.typeOfUseId).catch((_restoreError) => {
          // Restore failed - error already logged at service layer
        })
      );

      // Remove newly created mappings
      const rollbackPromises = createdMappings.map((m) =>
        deletePropertyTypeValidation(m.id).catch((_rollbackError) => {
          // Rollback failed - error already logged at service layer
        })
      );

      // Wait for all restore/rollback operations
      await Promise.all([...restorePromises, ...rollbackPromises]);

      throw deleteError;
    }
  } catch (error) {
    throw error;
  }
}
