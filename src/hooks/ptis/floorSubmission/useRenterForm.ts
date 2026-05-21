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
    saveAction?: (id: string | number, data: any) => Promise<{ success: boolean; error?: any }>;
    onSaveSuccess?: (data: RenterPayload) => void;
}

export const useRenterForm = ({ initialData, floorId, saveAction, onSaveSuccess }: UseRenterFormProps) => {
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

        const mappedRenterDetails: RenterFormDataDetails = {
            renterName: details.renterName || details.renterNameEnglish || firstRenterDetail?.renterName || firstRenterDetail?.renterNameEnglish || "",
            agreementId: details.agreementId || firstRenterDetail?.agreementId || "",
            agreementDate: formatDateToInput(details.agreementDate || firstRenterDetail?.agreementDate),
            agreementDateFrom: formatDateToInput(details.agreementFromDate || firstRenterDetail?.durationFrom || firstRenterDetail?.agreementFromDate),
            agreementDateTo: formatDateToInput(details.agreementToDate || firstRenterDetail?.durationTo || firstRenterDetail?.agreementToDate),
            rentAmount: details.nonCalculateRentMonthly || details.rentMonthly || firstRenterDetail?.rentMonthly || firstRenterDetail?.rentAmount || "",
            rentAmountAGR: details.nonCalculateRentMonthly || details.rentMonthly || firstRenterDetail?.rentMonthly || firstRenterDetail?.rentAmount || "",
            rentAmountSUR: "",
            incrementFrequency: firstRenterDetail?.incrementFrequency || "No Increment",
            incrementType: firstRenterDetail?.incrementType || "Percentage",
            incrementValue: firstRenterDetail?.incrementValue || "",
            customDateRanges: details.customDateRanges || firstRenterDetail?.customDateRanges || []
        };

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
            ...details,
            floorId,
            renterDetails: mappedRenterDetails
        });
    }, [initialData, floorId]);

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

            const payload: RenterPayload = {
                ...formData,
                renterDetails: calculationResult?.renterDetails || [],
                renterMast: calculationResult?.fyBreakdown || [],
                grandTotal: calculationResult?.grandTotal || 0,
                renterCustomIncrements,
                renterTableEntries: calculationResult?.renterTableEntries || [],
            };

            // Persist to backend via server action if provided
            if (saveAction) {
                const id = formData?.id || (formData?.propertyDetailsId as string | number | undefined) || floorId;
                const result = await saveAction(id, payload);
                if (!result?.success) {
                    toast.error(result?.error?.message || 'Failed to save renter details to server');
                    return false;
                }
            }

            // Enterprise Persistence: Session Storage (Avoids 4KB cookie limit)
            const storageKey = `renter_data_${floorId}`;
            sessionStorage.setItem(storageKey, JSON.stringify(payload));

            if (onSaveSuccess) {
                await Promise.resolve(onSaveSuccess(payload));
            }
            setShowSuccessPopup(true);

            return true;
        } catch (_error) {
            toast.error("Failed to process renter data");
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [formData, floorId, saveAction, onSaveSuccess]);

    return {
        formData,
        setFormData,
        isSaving,
        showSuccessPopup,
        setShowSuccessPopup,
        handleSave
    };
};
