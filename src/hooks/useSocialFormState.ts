import { useState, useMemo, useCallback } from "react";
import { FlatSocialAttributeState, flattenAttributes } from "@/lib/utils/social-details";
import { hasSocialChangesComparedToInitial } from "@/lib/utils/social-changes";
import { PropertySocialInfoResponseDto } from "@/types/property-social-details.types";

export const useSocialFormState = (initialSocialData: PropertySocialInfoResponseDto | null) => {
    const initialFlatData = useMemo(() => {
        return flattenAttributes(initialSocialData?.socialAttributes || []);
    }, [initialSocialData]);

    const [formState, setFormState] = useState<{
        data: Record<number, FlatSocialAttributeState>;
        errors: Record<number, string>;
    }>(() => ({
        data: flattenAttributes(initialSocialData?.socialAttributes || []),
        errors: {}
    }));

    const [prevInitialSocialData, setPrevInitialSocialData] = useState(initialSocialData);

    if (initialSocialData && initialSocialData !== prevInitialSocialData) {
        setPrevInitialSocialData(initialSocialData);
        setFormState({
            data: flattenAttributes(initialSocialData.socialAttributes || []),
            errors: {}
        });
    }

    const hasChanges = useMemo(() => {
        return hasSocialChangesComparedToInitial(formState.data, initialFlatData);
    }, [formState.data, initialFlatData]);

    const handleInputChange = useCallback((
        attributeId: number,
        field: keyof FlatSocialAttributeState,
        value: string | number | boolean | null | undefined
    ) => {
        setFormState((prev) => {
            const nextData = { ...prev.data };
            const currentAttr = nextData[attributeId];
            if (!currentAttr) return prev;

            nextData[attributeId] = { ...currentAttr, [field]: value };
            
            const nextErrors = { ...prev.errors };
            delete nextErrors[attributeId];

            return {
                data: nextData,
                errors: nextErrors
            };
        });
    }, []);

    const handleToggleEnabled = useCallback((attributeId: number, checked: boolean) => {
        setFormState((prev) => {
            const nextData = { ...prev.data };
            const currentAttr = nextData[attributeId];
            if (!currentAttr) return prev;

            nextData[attributeId] = { ...currentAttr, bitValue: checked };
            
            const nextErrors = { ...prev.errors };
            delete nextErrors[attributeId];

            if (!checked) {
                Object.values(nextData).forEach((attr) => {
                    if (attr.parentAttributeId === attributeId) {
                        delete nextErrors[attr.socialAttributeId];
                    }
                });
            }

            return {
                data: nextData,
                errors: nextErrors
            };
        });
    }, []);

    return {
        socialData: formState.data,
        validationErrors: formState.errors,
        setFormState,
        hasChanges,
        initialFlatData,
        handleInputChange,
        handleToggleEnabled
    };
};
