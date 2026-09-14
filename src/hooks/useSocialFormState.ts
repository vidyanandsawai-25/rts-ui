import { useState, useMemo, useCallback } from "react";
import { FlatSocialAttributeState, flattenAttributes } from "@/lib/utils/social-details";
import { hasSocialChangesComparedToInitial } from "@/lib/utils/social-changes";
import { PropertySocialInfoResponseDto } from "@/types/property-social-details.types";

import { SocialAttribute } from "@/types/social-attribute.types";

export const useSocialFormState = (
    initialSocialData: PropertySocialInfoResponseDto | null,
    masterAttributes?: SocialAttribute[]
) => {
    const buildInitialData = useCallback(() => {
        const flatData = flattenAttributes(initialSocialData?.socialAttributes || []);
        if (masterAttributes && masterAttributes.length > 0) {
            masterAttributes.forEach(attr => {
                if (!flatData[attr.id]) {
                    const isBitType = attr.dataType.toUpperCase() === "BIT";
                    flatData[attr.id] = {
                        id: null,
                        socialAttributeId: attr.id,
                        socialAttributeCode: attr.socialAttributeCode,
                        socialAttributeName: attr.socialAttributeName,
                        dataType: attr.dataType,
                        parentAttributeId: attr.parentAttributeId,
                        isRequiredWhenParentTrue: attr.isRequiredWhenParentTrue,
                        bitValue: isBitType ? false : null,
                        intValue: null,
                        decimalValue: null,
                        textValue: null,
                        dateValue: null,
                        documentBindingId: null,
                        remark: null,
                        isUploading: false,
                        isPhotoRequired: attr.isPhotoRequired,
                        isDocumentRequired: attr.isDocumentRequired,
                        documentGuid: null,
                        documentUrl: null,
                        photoBindingId: null,
                        photoGuid: null
                    };
                }
            });
        }
        return flatData;
    }, [initialSocialData, masterAttributes]);

    const initialFlatData = useMemo(() => buildInitialData(), [buildInitialData]);

    const [formState, setFormState] = useState<{
        data: Record<number, FlatSocialAttributeState>;
        errors: Record<number, string>;
    }>(() => ({
        data: buildInitialData(),
        errors: {}
    }));

    const hasChanges = useMemo(() => {
        return hasSocialChangesComparedToInitial(formState.data, initialFlatData);
    }, [formState.data, initialFlatData]);

    const [prevInitialSocialData, setPrevInitialSocialData] = useState(initialSocialData);

    if (initialSocialData && initialSocialData !== prevInitialSocialData) {
        setPrevInitialSocialData(initialSocialData);
        if (!hasChanges) {
            setFormState({
                data: buildInitialData(),
                errors: {}
            });
        }
    }

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
