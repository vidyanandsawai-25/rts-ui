import { validateForm, propertyValidations } from '@/lib/utils/validation';

/**
 * Validates the property basic details form data.
 * 
 * @param formData - The form data to validate
 * @param categoryId - The selected category ID
 * @param t - Translation function
 * @returns Object containing validation errors
 */
export const validatePropertyForm = (
    formData: FormData,
    categoryId: number | null,
    t: (key: string, values?: Record<string, string | number | Date>) => string
) => {
    const validationData = {
        categoryId,
        taxZoneId: formData.get("taxZoneId"),
        plotArea: formData.get("plotArea"),
        noOfResidentialToilets: formData.get("noOfResidentialToilets"),
        noOfCommercialToilets: formData.get("noOfCommercialToilets"),
    };

    return validateForm(validationData, {
        categoryId: propertyValidations.required("category", t),
        taxZoneId: propertyValidations.required("taxZoneNo", t),
        plotArea: propertyValidations.number("plotArea", t),
        noOfResidentialToilets: propertyValidations.number("residentialToilets", t),
        noOfCommercialToilets: propertyValidations.number("commercialToilets", t),
    });
};
