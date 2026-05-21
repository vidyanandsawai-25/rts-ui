"use client";

import React, { useState, useEffect, memo, useMemo } from "react";
import { Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { validateDateRange } from "@/lib/utils/renterUtils";
import { calculateRangeTotal } from "./CustomDateRangeUtils";
import { AddRangeForm } from "./AddRangeForm";
import { CustomRangesTable } from "./CustomRangesTable";
import { CustomRangesSummary } from "./CustomRangesSummary";
import { Button } from "@/components/common";
import { useTranslations } from "next-intl";
import { RenterFormData, CustomDateRange } from "@/types/renter.types";

interface CustomDateRangeManagerProps {
    formData: RenterFormData | null;
    setFormData: React.Dispatch<React.SetStateAction<RenterFormData | null>>;
    showToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

type NewRangeData = {
    fromDate: string;
    toDate: string;
    incrementType: 'Percentage' | 'Fixed';
    incrementValue: string | number;
    calculationMethod: 'Base Value' | 'Incremented Value';
};

const EMPTY_RANGE: NewRangeData = {
    fromDate: '',
    toDate: '',
    incrementType: 'Percentage',
    incrementValue: '',
    calculationMethod: 'Base Value',
};

export const CustomDateRangeManager = memo(({ formData, setFormData }: CustomDateRangeManagerProps) => {
    const t = useTranslations('quickDataEntry');
    const AGREEMENT_FROM_DATE = formData?.renterDetails?.agreementDateFrom || '';
    const AGREEMENT_TO_DATE = formData?.renterDetails?.agreementDateTo || '';
    const originalBaseRent = parseFloat(String(formData?.renterDetails?.rentAmount ?? "0"));
    const customDateRanges = useMemo(
        () => (formData?.renterDetails?.customDateRanges || []) as CustomDateRange[],
        [formData?.renterDetails?.customDateRanges]
    );

    const [newRangeData, setNewRangeData] = useState<NewRangeData>(EMPTY_RANGE);
    const [dateRangeErrors, setDateRangeErrors] = useState<Record<string, string>>({ fromDate: '', toDate: '', incrementValue: '', general: '' });
    const [hasValidationError, setHasValidationError] = useState(false);
    const [deleteConfirmRangeId, setDeleteConfirmRangeId] = useState<string | null>(null);

    useEffect(() => {
        if (customDateRanges.length === 0 && AGREEMENT_FROM_DATE) {
            setNewRangeData(prev => ({ ...prev, fromDate: AGREEMENT_FROM_DATE }));
        }
    }, [AGREEMENT_FROM_DATE, customDateRanges.length]);

    const activeRangesTableData = useMemo(() => customDateRanges.map((range: CustomDateRange, index: number) => {
        const { durationMonths, durationTotal } = calculateRangeTotal(range, index, customDateRanges, originalBaseRent);
        return { id: range.id, rowIndex: index + 1, durationMonths, durationTotal, range, incrementSource: range, methodSource: range };
    }), [customDateRanges, originalBaseRent]);

    const summaryData = useMemo(() => {
        if (activeRangesTableData.length === 0 || originalBaseRent <= 0) return { grandTotal: 0, totalRanges: 0, baseRent: originalBaseRent };
        let grandTotal = 0;
        activeRangesTableData.forEach((row) => {
            grandTotal += row.durationTotal;
        });
        return { grandTotal, totalRanges: activeRangesTableData.length, baseRent: originalBaseRent };
    }, [activeRangesTableData, originalBaseRent]);

    const handleAddRange = () => {
        const validation = validateDateRange({ newRangeData, agreementStart: new Date(AGREEMENT_FROM_DATE), agreementEnd: new Date(AGREEMENT_TO_DATE), existingRanges: customDateRanges });
        setDateRangeErrors(validation.errors as unknown as Record<string, string>);
        setHasValidationError(!validation.isValid);
        if (!validation.isValid) return;

        const newRange: CustomDateRange = {
            ...newRangeData,
            id: Date.now().toString(),
            incrementValue: parseFloat(String(newRangeData.incrementValue)),
        };
        const updatedRanges = [...customDateRanges, newRange].sort(
            (a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime()
        );
        setFormData(prev => {
            if (!prev) return null;
            return { ...prev, renterDetails: { ...prev.renterDetails, customDateRanges: updatedRanges } };
        });
        setNewRangeData(EMPTY_RANGE);
        toast.success(t('floor.renterSection.add'));
    };

    return (
        <div className={`space-y-4 bg-white/60 border border-gray-200 rounded-xl p-4 shadow-sm ${hasValidationError ? "ring-2 ring-red-400 border-red-300" : ""}`}>
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> 
                    {t('floor.renterSection.customDateRanges')}
                </h4>
            </div>
            {dateRangeErrors.general && <div className="bg-red-100 border-2 border-red-500 rounded-lg px-4 py-2 flex items-center gap-3"><AlertTriangle className="w-5 h-5 text-red-600" /><span className="text-xs text-red-800 font-bold">{dateRangeErrors.general}</span></div>}
            <AddRangeForm newRangeData={newRangeData} setNewRangeData={setNewRangeData} onAdd={handleAddRange} agreementStart={AGREEMENT_FROM_DATE} agreementEnd={AGREEMENT_TO_DATE} errors={dateRangeErrors} hasValidationError={hasValidationError} />
            {customDateRanges.length > 0 && (
                <div className="space-y-3">
                    <CustomRangesTable data={activeRangesTableData} onDelete={setDeleteConfirmRangeId} />
                    <CustomRangesSummary summaryData={summaryData} />
                </div>
            )}
            {deleteConfirmRangeId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirmRangeId(null)}>
                    <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">{t('floor.renterSection.confirmDeletion')}?</h3>
                        <p className="text-sm text-slate-500 mb-6">{t('floor.renterSection.areYouSureDeleteRange')}</p>
                        <div className="flex gap-3">
                            <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirmRangeId(null)}>
                                {t('floor.renterSection.cancel')}
                            </Button>
                            <Button className="flex-1 bg-red-600 text-white" onClick={() => { 
                                setFormData(prev => {
                                    if (!prev) return null;
                                    return {
                                        ...prev, 
                                        renterDetails: { 
                                            ...prev.renterDetails, 
                                            customDateRanges: prev.renterDetails.customDateRanges.filter(r => r.id !== deleteConfirmRangeId) 
                                        }
                                    };
                                });
                                setDeleteConfirmRangeId(null); 
                                toast.success(t('floor.renterSection.deleted')); 
                            }}>
                                {t('floor.table.delete')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
CustomDateRangeManager.displayName = 'CustomDateRangeManager';
