"use client";
import React from 'react';


import { Label } from "@/components/common/label";
import { Input, Select, Button } from "@/components/common";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

const fieldLabelClassName = "text-xs leading-snug tracking-normal !font-semibold text-slate-700";

interface NewRangeData {
    fromDate: string;
    toDate: string;
    incrementType: 'Percentage' | 'Fixed';
    incrementValue: string | number;
    calculationMethod: 'Base Value' | 'Incremented Value';
}

interface AddRangeFormProps {
    newRangeData: NewRangeData;
    setNewRangeData: React.Dispatch<React.SetStateAction<NewRangeData>> | ((data: NewRangeData) => void);
    onAdd: () => void;
    agreementStart: string;
    agreementEnd: string;
    errors: Record<string, string>;
    hasValidationError: boolean;
}

export const AddRangeForm = ({ 
    newRangeData, 
    setNewRangeData, 
    onAdd, 
    agreementStart, 
    agreementEnd, 
    errors,
    hasValidationError: _hasValidationError
}: AddRangeFormProps) => {
    const t = useTranslations('quickDataEntry');
    
    return (
        <div className="bg-white border border-dashed border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    {t('floor.renterSection.addNewDateRange')}
                </div>
            </div>
            
            <div className="flex items-end gap-4 flex-wrap lg:flex-nowrap">
                <div className="flex-1 min-w-[130px] space-y-1.5">
                    <Label className={fieldLabelClassName}>{t('floor.renterSection.fromDate')} *</Label>
                    <Input
                        type="date"
                        value={newRangeData.fromDate}
                        onChange={(e) => setNewRangeData({ ...newRangeData, fromDate: e.target.value })}
                        min={agreementStart}
                        max={agreementEnd}
                        error={errors.fromDate}
                        className="h-8 text-xs font-bold"
                    />
                </div>

                <div className="flex-1 min-w-[130px] space-y-1.5">
                    <Label className={fieldLabelClassName}>{t('floor.renterSection.toDate')} *</Label>
                    <Input
                        type="date"
                        value={newRangeData.toDate}
                        onChange={(e) => setNewRangeData({ ...newRangeData, toDate: e.target.value })}
                        min={newRangeData.fromDate || agreementStart}
                        max={agreementEnd}
                        error={errors.toDate}
                        className="h-8 text-xs font-bold"
                    />
                </div>

                <div className="flex-1 min-w-[150px] space-y-1.5">
                    <Label className={fieldLabelClassName}>{t('floor.renterSection.incrementType')} *</Label>
                    <Select
                        value={newRangeData.incrementType}
                        onChange={(_, val) => setNewRangeData({ ...newRangeData, incrementType: val as 'Percentage' | 'Fixed' })}
                        options={[
                            { label: `${t('floor.renterSection.percentage')} %`, value: "Percentage" }, 
                            { label: `${t('floor.renterSection.fixedAmount')} ₹`, value: "Fixed" }
                        ]}
                        className="h-8 text-xs font-bold"
                    />
                </div>

                <div className="flex-1 min-w-[100px] space-y-1.5">
                    <Label className={fieldLabelClassName}>{newRangeData.incrementType === 'Percentage' ? `${t('floor.renterSection.value')} (%)` : `${t('floor.renterSection.amount')} (₹)`} *</Label>
                    <Input
                        type="number"
                        value={newRangeData.incrementValue}
                        onChange={(e) => setNewRangeData({ ...newRangeData, incrementValue: e.target.value })}
                        placeholder={newRangeData.incrementType === 'Percentage' ? '10' : '500'}
                        error={errors.incrementValue}
                        className="h-8 text-xs font-bold"
                    />
                </div>

                <div className="flex-1 min-w-[150px] space-y-1.5">
                    <Label className={fieldLabelClassName}>{t('floor.renterSection.method')} *</Label>
                    <Select
                        value={newRangeData.calculationMethod}
                        onChange={(_, val) => setNewRangeData({ ...newRangeData, calculationMethod: val as 'Base Value' | 'Incremented Value' })}
                        options={[
                            { label: t('floor.renterSection.baseValueLinear'), value: "Base Value" }, 
                            { label: t('floor.renterSection.incrementedCompounding'), value: "Incremented Value" }
                        ]}
                        className="h-8 text-xs font-bold"
                    />
                </div>

                <Button
                    disabled={!newRangeData.fromDate || !newRangeData.toDate || !newRangeData.incrementValue}
                    onClick={onAdd}
                    className="h-8 px-4 text-[10px] font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2"
                >
                    <Plus className="w-3.5 h-3.5" /> {t('floor.renterSection.add')}
                </Button>
            </div>
        </div>
    );
};
