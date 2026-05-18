import { BuildingPermissionState, BuildingKey } from "@/types/building-permission.types";

/**
 * Validates the building permission form state.
 * Returns an object with errors for each certificate key if they are enabled but incomplete.
 */
export const validateBuildingForm = (
    state: BuildingPermissionState,
    t: (key: string) => string
): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    let isValid = true;

    const keys: BuildingKey[] = [
        "buildingPermit",
        "commencementCertificate",
        "occupancyCertificate",
        "possessionCertificate",
        "index2",
        "electricBill",
        "buildCompletionCertificate",
    ];

    keys.forEach((key) => {
        const item = state[key];
        if (item.enabled) {
            if (!item.number || item.number.trim() === "") {
                if (!errors[key]) {
                    errors[key] = t("validation.numberRequired");
                    isValid = false;
                }
            }
            if ((!item.date || item.date.trim() === "") && !errors[key]) {
                errors[key] = t("validation.dateRequired");
                isValid = false;
            }
        }
    });

    return { isValid, errors };
};
