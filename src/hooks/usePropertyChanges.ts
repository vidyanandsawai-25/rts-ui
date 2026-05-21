import { useCallback, useEffect, RefObject } from 'react';
import { PropertyBasicDetailsApiItem } from '@/types/property-basic-details.types';
import { parseOptionalNumber } from '@/lib/utils/form-helpers';
import { propertyValidators } from '@/lib/utils/kyc-validation.constants';
import {
    sanitizeFlatShopNo,
    sanitizePlotNo,
    sanitizeSurveyNo,
    sanitizeSubZoneNo,
    sanitizePlotArea,
    sanitizePositiveInteger,
} from '@/lib/utils/input-sanitization';

interface UsePropertyChangesProps {
    formRef: RefObject<HTMLFormElement | null>;
    categoryId: number | null;
    propertyTypeId: number | null;
    moujaId: number | null;
    propertyData: PropertyBasicDetailsApiItem | null;
    setHasChanges: (value: boolean) => void;
}

export const usePropertyChanges = ({
    formRef,
    categoryId,
    propertyTypeId,
    moujaId,
    propertyData,
    setHasChanges,
}: UsePropertyChangesProps) => {
    

    const checkFormChanges = useCallback(() => {
        if (!formRef.current) return;
        const formData = new FormData(formRef.current);
        const residentialToilets = parseOptionalNumber(formData.get("noOfResidentialToilets"));
        const commercialToilets = parseOptionalNumber(formData.get("noOfCommercialToilets"));
        const plotArea = parseOptionalNumber(formData.get("plotArea"));
        const taxZoneIdFromForm = parseOptionalNumber(formData.get("taxZoneId"));

        const isChanged =
            taxZoneIdFromForm !== (propertyData?.taxZoneId ?? null) ||
            String(formData.get("plotNo") ?? "").trim() !== (propertyData?.plotNo ?? "") ||
            String(formData.get("flatOrShopNo") ?? "").trim() !== (propertyData?.flatOrShopNo ?? "") ||
            String(formData.get("surveyNo") ?? "").trim() !== (propertyData?.surveyNo ?? "") ||
            String(formData.get("subZoneNo") ?? "").trim() !== (propertyData?.subZoneNo ?? "") ||
            residentialToilets !== (propertyData?.noOfResidentialToilets ?? null) ||
            commercialToilets !== (propertyData?.noOfCommercialToilets ?? null) ||
            plotArea !== (propertyData?.plotArea ?? null) ||
            categoryId !== (propertyData?.categoryId ?? null) ||
            propertyTypeId !== (propertyData?.propertyTypeId ?? null) ||
            moujaId !== (propertyData?.moujaId ?? null);

        const flatOrShopNo = sanitizeFlatShopNo(String(formData.get("flatOrShopNo") ?? ""));
        const plotNo = sanitizePlotNo(String(formData.get("plotNo") ?? ""));
        const surveyNo = sanitizeSurveyNo(String(formData.get("surveyNo") ?? ""));
        const subZoneNo = sanitizeSubZoneNo(String(formData.get("subZoneNo") ?? ""));
        const plotAreaStr = sanitizePlotArea(String(formData.get("plotArea") ?? ""));
        const resToiletsStr = sanitizePositiveInteger(String(formData.get("noOfResidentialToilets") ?? ""));
        const commToiletsStr = sanitizePositiveInteger(String(formData.get("noOfCommercialToilets") ?? ""));
        const taxZoneId = String(formData.get("taxZoneId") ?? "");

        const isValid =
            categoryId !== null &&
            propertyValidators.isValidFlatShopNo(flatOrShopNo) &&
            propertyValidators.isValidPlotNo(plotNo) &&
            propertyValidators.isValidPlotArea(plotAreaStr) &&
            propertyValidators.isValidSurveyNo(surveyNo) &&
            propertyValidators.isValidSubZoneNo(subZoneNo) &&
            propertyValidators.isValidPositiveNumber(resToiletsStr) &&
            propertyValidators.isValidPositiveNumber(commToiletsStr) &&
            (taxZoneId !== '');

        setHasChanges(isChanged && isValid);
    }, [categoryId, propertyTypeId, moujaId, propertyData, formRef, setHasChanges]);

    useEffect(() => {
        checkFormChanges();
    }, [checkFormChanges]);

    return { checkFormChanges };
};
