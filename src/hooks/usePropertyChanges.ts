import { useCallback, useEffect, RefObject } from 'react';
import { PropertyBasicDetailsApiItem } from '@/types/property-basic-details.types';
import { parseOptionalNumber } from '@/lib/utils/form-helpers';

interface UsePropertyChangesProps {
    formRef: RefObject<HTMLFormElement | null>;
    categoryId: number | null;
    propertyTypeId: number | null;
    wingId: number | null;
    initialWingId: number | null;
    propertyData: PropertyBasicDetailsApiItem | null;
    setHasChanges: (value: boolean) => void;
}

export const usePropertyChanges = ({
    formRef,
    categoryId,
    propertyTypeId,
    wingId,
    initialWingId,
    propertyData,
    setHasChanges,
}: UsePropertyChangesProps) => {
    

    const checkFormChanges = useCallback(() => {
        if (!formRef.current) return;
        const formData = new FormData(formRef.current);
        const residentialToilets = parseOptionalNumber(formData.get("noOfResidentialToilets"));
        const commercialToilets = parseOptionalNumber(formData.get("noOfCommercialToilets"));
        const plotArea = parseOptionalNumber(formData.get("plotArea"));

        const isChanged =
            String(formData.get("plotNo") ?? "").trim() !== (propertyData?.plotNo ?? "") ||
            String(formData.get("flatOrShopNo") ?? "").trim() !== (propertyData?.flatOrShopNo ?? "") ||
            String(formData.get("surveyNo") ?? "").trim() !== (propertyData?.surveyNo ?? "") ||
            String(formData.get("subZoneNo") ?? "").trim() !== (propertyData?.subZoneNo ?? "") ||
            residentialToilets !== (propertyData?.noOfResidentialToilets ?? null) ||
            commercialToilets !== (propertyData?.noOfCommercialToilets ?? null) ||
            plotArea !== (propertyData?.plotArea ?? null) ||
            categoryId !== (propertyData?.categoryId ?? null) ||
            propertyTypeId !== (propertyData?.propertyTypeId ?? null) ||
            wingId !== initialWingId;

        setHasChanges(isChanged);
    }, [categoryId, propertyTypeId, wingId, initialWingId, propertyData, formRef, setHasChanges]);

    useEffect(() => {
        checkFormChanges();
    }, [checkFormChanges]);

    return { checkFormChanges };
};
