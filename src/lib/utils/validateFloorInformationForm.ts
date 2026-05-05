import { validateForm, propertyValidations } from '@/lib/utils/validation';

import { FloorInformationFormData } from '@/types/property-old-details.types';

/**
 * Validates the floor information form data.
 * 
 * @param formData - The floor form state
 * @param t - Translation function
 * @returns Object containing validation errors
 */
export const validateFloorInformationForm = (
  formData: FloorInformationFormData,
  t: (key: string, values?: Record<string, string | number | Date>) => string
) => {
  const validationData = {
    oldFloorId: formData.oldFloorId,
    oldConstructionYear: formData.oldConstructionYear,
    oldConstructionTypeId: formData.oldConstructionTypeId,
    oldTypeOfUseId: formData.oldTypeOfUseId,
  };

  return validateForm(validationData, {
    oldFloorId: propertyValidations.required("floor", t),
    oldConstructionYear: propertyValidations.required("constructionYear", t),
    oldConstructionTypeId: propertyValidations.required("constructionType", t),
    oldTypeOfUseId: propertyValidations.required("typeOfUse", t),
  });
};
