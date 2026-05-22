/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from 'react';
import { calculateRentProgression } from "@/lib/utils/renter-calculations";
import { mapCustomDateRangesToPostPayload } from "@/lib/utils/renterUtils";
import { toast } from "sonner";
import { RenterFormData, RenterFormDataDetails, RenterPayload } from "@/types/renter.types";
import { validateRenterForm } from "@/lib/utils/renter-validation";


/**
 * Formats an ISO date string to YYYY-MM-DD for HTML date inputs
 */
const formatDateToInput = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        return d.toISOString().split('T')[0];
    } catch (_e) {
        return "";
    }
};

interface UseRenterFormProps {
    initialData: Record<string, any> | null;
    floorId: string;
    propertyId?: string | number;
    saveAction?: (id: string | number, data: any) => Promise<{ success: boolean; data?: any; error?: any }>;
    onSaveSuccess?: (data: RenterPayload) => void;
}

export const useRenterForm = ({ initialData, floorId, propertyId, saveAction, onSaveSuccess }: UseRenterFormProps) => {
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [formData, setFormData] = useState<RenterFormData | null>(null);

    // Initial Mapping Logic (Enterprise Pattern: Data Transformation Layer)
    useEffect(() => {
        let details = initialData || {};
        
        // If initialData is empty or missing key floor info, try to get from session storage
        if (!details.floor || !details.conYr) {
            try {
                const sessionData = sessionStorage.getItem('editingFloorForm');
                if (sessionData) {
                    const parsed = JSON.parse(sessionData);
                    // Merge session data with initial data, giving preference to initialData if it has values
                    details = { ...parsed, ...details };
                }
            } catch (_e) {
                console.warn("Failed to parse floor session details", _e);
            }
        }

        const firstRenterDetail = Array.isArray((details as any).renterDetails) ? (details as any).renterDetails[0] : null;
        const firstRenterMast = Array.isArray((details as any).renterMast) && (details as any).renterMast.length > 0 
            ? (details as any).renterMast[0] 
            : (Array.isArray((details as any).renters) && (details as any).renters.length > 0 
                ? (details as any).renters[0] 
                : null);

        let customDateRanges: any[] = [];
        if (details.renterDetails && !Array.isArray(details.renterDetails) && (details.renterDetails as any).customDateRanges) {
            customDateRanges = (details.renterDetails as any).customDateRanges;
        } else if (details.customDateRanges && details.customDateRanges.length > 0) {
            customDateRanges = details.customDateRanges;
        } else if (firstRenterDetail?.incrementFrequency === "Custom Date" && Array.isArray((details as any).renterDetails)) {
            customDateRanges = (details as any).renterDetails
                .filter((item: any) => item && item.customFromDate !== null && item.customFromDate !== undefined)
                .map((item: any) => ({
                    fromDate: formatDateToInput(item.customFromDate),
                    toDate: formatDateToInput(item.customToDate),
                    incrementType: item.customIncrementType || "Percentage",
                    incrementValue: item.customIncrementValue ?? 0,
                    calculationMethod: item.customMethod === "compounding" ? "Incremented Value" : "Base Value"
                }));
        }

        const isCompoundingVal = details.renterDetails && !Array.isArray(details.renterDetails) && (details.renterDetails as any).isCompounding !== undefined
            ? Boolean((details.renterDetails as any).isCompounding)
            : (firstRenterDetail?.incrementMethod === "compounding");

        const mappedRenterDetails: RenterFormDataDetails = {
            renterName: details.renterName || details.renterNameEnglish || firstRenterMast?.renterName || firstRenterMast?.renterNameEnglish || firstRenterDetail?.renterName || firstRenterDetail?.renterNameEnglish || "",
            agreementId: details.agreementId || firstRenterDetail?.agreementId || "",
            agreementDate: formatDateToInput(details.agreementDate || firstRenterMast?.agreementDate || firstRenterDetail?.agreementDate),
            agreementDateFrom: formatDateToInput(details.agreementFromDate || firstRenterMast?.agreementFromDate || firstRenterMast?.durationFrom || firstRenterDetail?.durationFrom || firstRenterDetail?.agreementFromDate),
            agreementDateTo: formatDateToInput(details.agreementToDate || firstRenterMast?.agreementToDate || firstRenterMast?.durationTo || firstRenterDetail?.durationTo || firstRenterDetail?.agreementToDate),
            rentAmount: details.nonCalculateRentMonthly || details.rentMonthly || firstRenterMast?.rentMonthly || firstRenterMast?.nonCalculateRentMonthly || firstRenterDetail?.rentMonthly || firstRenterDetail?.rentAmount || "",
            rentAmountAGR: details.nonCalculateRentMonthly || details.rentMonthly || firstRenterMast?.rentMonthly || firstRenterMast?.nonCalculateRentMonthly || firstRenterDetail?.rentMonthly || firstRenterDetail?.rentAmount || "",
            rentAmountSUR: "",
            incrementFrequency: firstRenterDetail?.incrementFrequency || "No Increment",
            incrementType: firstRenterDetail?.incrementType || "Percentage",
            incrementValue: firstRenterDetail?.incrementValue || "",
            isCompounding: isCompoundingVal,
            selfDeclarationAmount: details.nonCalculateRentMonthly || firstRenterMast?.nonCalculateRentMonthly || "",
            customDateRanges: customDateRanges
        };

        const dbFloorId = details.floorId !== undefined ? details.floorId : details.floorID;
        const safeFloorId = (dbFloorId !== undefined && dbFloorId !== null && dbFloorId !== '' && dbFloorId !== 'new') ? dbFloorId : floorId;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
            ...details,
            floorId: safeFloorId,
            propertyId: Number(propertyId || details.ownerID || details.propertyId || 0) || undefined,
            renterDetails: mappedRenterDetails
        });
    }, [initialData, floorId, propertyId]);

    const handleSave = useCallback(async () => {
        if (!formData?.renterDetails) return;

        const { renterDetails } = formData;

        // Enterprise Validation Layer
        const validationErrors = validateRenterForm(renterDetails);
        if (validationErrors.length > 0) {
            validationErrors.forEach(err => toast.error(err.message));
            return;
        }

        setIsSaving(true);
        try {
            const calculationResult = calculateRentProgression(renterDetails);
            const renterCustomIncrements = renterDetails.incrementFrequency === "Custom Date"
                ? mapCustomDateRangesToPostPayload(renterDetails.customDateRanges)
                : [];

            const parsedPropertyId = Number(propertyId || formData?.propertyId || formData?.ownerID || 0);
            const finalPropertyId = !isNaN(parsedPropertyId) && parsedPropertyId > 0 ? parsedPropertyId : 1;

            const rawDetailsId = Number(formData?.propertyDetailsId ?? formData?.id ?? 0);
            const finalPropertyDetailsId = !isNaN(rawDetailsId) && rawDetailsId > 0 ? rawDetailsId : undefined;

            const payload: RenterPayload = {
                ...formData,
                propertyId: finalPropertyId,
                propertyDetailsId: finalPropertyDetailsId,
                updatedBy: formData?.updatedBy ? Number(formData.updatedBy) : undefined,
                renterYesNo: Boolean(formData?.renterYesNo ?? true),
                renterName: renterDetails.renterName || undefined,
                renterNameEnglish: renterDetails.renterName || undefined,
                rentMonthly: renterDetails.rentAmount ? Number(renterDetails.rentAmount) : undefined,
                rentYearly: renterDetails.rentAmount ? Number(renterDetails.rentAmount) * 12 : undefined,
                agreementFromDate: renterDetails.agreementDateFrom || undefined,
                agreementToDate: renterDetails.agreementDateTo || undefined,
                agreementDate: renterDetails.agreementDate || undefined,
                nonCalculateRentMonthly: renterDetails.selfDeclarationAmount ? Number(renterDetails.selfDeclarationAmount) : 0,
                renterDetails: calculationResult?.renterDetails || [],
                renterMast: calculationResult?.fyBreakdown || [],
                grandTotal: calculationResult?.grandTotal || 0,
                renterCustomIncrements,
                renterTableEntries: calculationResult?.renterTableEntries || [],
            };

            let finalPayload = { ...payload };

            // Persist to backend via server action if provided
            if (saveAction && floorId !== 'new') {
                const id = formData?.id || (formData?.propertyDetailsId as string | number | undefined) || floorId;
                const result = await saveAction(id, payload);
                if (!result?.success) {
                    const errorMsg = typeof result?.error === 'object' && result?.error?.message 
                        ? result.error.message 
                        : (typeof result?.error === 'string' ? result.error : 'Failed to save renter details to server');
                    toast.error(errorMsg);
                    return false;
                }
                if (result?.data) {
                    const savedFloor = result.data as any;
                    const realFloorId = savedFloor?.id || savedFloor?.propertyDetailsId || payload.propertyDetailsId || payload.id || floorId;
                    finalPayload = {
                        ...payload,
                        ...savedFloor,
                        id: realFloorId,
                        propertyDetailsId: realFloorId,
                    };
                }
            }

            const activeFloorId = finalPayload.id || finalPayload.propertyDetailsId || floorId;

            // Enterprise Persistence: Session Storage (Avoids 4KB cookie limit)
            const storageKey = `renter_data_${activeFloorId}`;
            sessionStorage.setItem(storageKey, JSON.stringify(finalPayload));

            // Also keep 'new' key for safety if originally 'new'
            if (floorId === 'new') {
                sessionStorage.setItem('renter_data_new', JSON.stringify(finalPayload));
            }

            if (onSaveSuccess) {
                await Promise.resolve(onSaveSuccess(finalPayload));
            }
            setShowSuccessPopup(true);

            return true;
        } catch (_error) {
            toast.error("Failed to process renter data");
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [formData, floorId, saveAction, onSaveSuccess, propertyId]);

    return {
        formData,
        setFormData,
        isSaving,
        showSuccessPopup,
        setShowSuccessPopup,
        handleSave
    };
};
