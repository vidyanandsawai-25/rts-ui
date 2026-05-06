"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
    AgeFactorCVMaster,
} from "@/types/ageFactorCv.types";
import { useAgeFactorCvRowOps } from "./useAgeFactorCvRowOps";
import { useAgeFactorCvBulkOps } from "./useAgeFactorCvBulkOps";
import type { Option } from "@/components/common/select";

interface UseAgeFactorCvWeightageParams {
    data: AgeFactorCVMaster[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    constructionTypeOptions: Option[];
    initialAgeRangeOptions: Option[];
    allAgeFactors: AgeFactorCVMaster[];
}

export const useAgeFactorCvWeightage = ({
    data,
    pageNumber: _pageNumber,
    pageSize,
    totalCount: _totalCount,
    totalPages: _totalPages,
    constructionTypeOptions,
    initialAgeRangeOptions,
    allAgeFactors,
}: UseAgeFactorCvWeightageParams) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = useLocale();
    const t = useTranslations('ageFactorMaster');
    const tW = useTranslations('weightageMaster');

    const currentSelectedYear = searchParams.get("selectedYearRange") || "";
    const currentConstructionType = searchParams.get("constructionType") || "";
    const [selectedYear, setSelectedYear] = useState<string>(currentSelectedYear);
    const [editableRows, setEditableRows] = useState<Record<string, AgeFactorCVMaster>>({});
    const [constructionType, setConstructionType] = useState<string>(currentConstructionType);
    const [factorValue, setFactorValue] = useState<string>("0.00");

    // Age Range States
    const [ageFrom, setAgeFrom] = useState<string>("");
    const [ageTo, setAgeTo] = useState<string>("");
    const [userAddedAgeRanges, setUserAddedAgeRanges] = useState<Option[]>([]);

    const ageRangeOptions = useMemo(() => {
        const combined = [...(initialAgeRangeOptions || [])];
        userAddedAgeRanges.forEach(opt => {
            if (!combined.find(c => c.value === opt.value)) {
                combined.push(opt);
            }
        });
        return combined;
    }, [initialAgeRangeOptions, userAddedAgeRanges]);

    const [selectedAgeRange, setSelectedAgeRange] = useState<string>("");
    const [isAddYearRangeModalOpen, setIsAddYearRangeModalOpen] = useState(false);
    const [isAgeRangeAdded, setIsAgeRangeAdded] = useState(false);
    const [sessionCreatedUids, setSessionCreatedUids] = useState<Set<string>>(new Set());
    const [toasts, setToasts] = useState<Array<{ id: string; type: "success" | "error" | "info" | "warning"; message: string }>>([]);

    const getRowUid = useCallback((row: AgeFactorCVMaster): string => {
        const yearId = row.yearRangeCVId || row.yearRangeCVID || 'noYear';
        return row.id !== 0 
            ? row.id.toString() 
            : `${row.id}-${row.constructionTypeId}-${yearId}-${row.ageFrom}-${row.ageTo}`;
    }, []);

    const findRowByUid = (uid: string): AgeFactorCVMaster | undefined => {
        return data.find(row => getRowUid(row) === uid);
    };

    const addToast = useCallback((type: "success" | "error" | "info" | "warning", message: string): void => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, type, message }]);
    }, []);

    const removeToast = (id: string): void => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const newRecords = data.filter(row => row.id === 0 && !sessionCreatedUids.has(getRowUid(row)));
    const hasNewRecords = newRecords.length > 0;
    const newRecordsCount = newRecords.length;
    const hasShownWarningRef = useRef(false);

    useEffect(() => {
        if (hasNewRecords && !hasShownWarningRef.current) {
            addToast('warning', tW('common.messages.pendingRecordsWarning'));
            hasShownWarningRef.current = true;
        } else if (!hasNewRecords) {
            hasShownWarningRef.current = false;
        }
    }, [hasNewRecords, tW, addToast]);

    const missingRecordsCount = useMemo(() => {
        if (!selectedYear) return 0;
        const yearId = parseInt(selectedYear);
        const ranges = selectedAgeRange ? [selectedAgeRange] : ageRangeOptions.map(o => o.value);
        if (ranges.length === 0) return 0;
        
        const types = constructionType 
            ? constructionTypeOptions.filter(ct => ct.value === constructionType) 
            : constructionTypeOptions;
            
        let count = 0;
        types.forEach(ct => {
            const ctId = parseInt(ct.value);
            ranges.forEach(range => {
                const [from, to] = range.split("-").map(Number);
                const exists = allAgeFactors.some(af => 
                    af.id > 0 &&
                    af.constructionTypeId === ctId &&
                    (af.yearRangeCVId === yearId || af.yearRangeCVID === yearId) &&
                    af.ageFrom === from &&
                    af.ageTo === to
                );
                if (!exists) count++;
            });
        });
        return count;
    }, [selectedYear, selectedAgeRange, ageRangeOptions, constructionTypeOptions, allAgeFactors, constructionType]);

    const canGenerateAll = hasNewRecords || isAgeRangeAdded || missingRecordsCount > 0;

    const clearFilters = useCallback((): void => {
        setFactorValue("0.00");
        setConstructionType("");
        setSelectedYear("");
        setAgeFrom("");
        setAgeTo("");
        setSelectedAgeRange("");
        setIsAgeRangeAdded(false);
    }, []);

    const {
        isUpdating,
        handleUpdate,
        handleCancelRow,
    } = useAgeFactorCvRowOps({
        selectedYear,
        editableRows,
        setEditableRows,
        setSessionCreatedUids,
        addToast,
        getRowUid,
    });

    const {
        isBulkUpdating,
        isGeneratingAll,
        handleApplyFilter,
        handleBulkUpdate,
        handleGenerateAll,
    } = useAgeFactorCvBulkOps({
        data,
        editableRows,
        setEditableRows,
        selectedYear,
        constructionType,
        selectedAgeRange,
        ageFrom,
        ageTo,
        factorValue,
        constructionTypeOptions,
        ageRangeOptions,
        allAgeFactors,
        sessionCreatedUids,
        addToast,
        getRowUid,
        findRowByUid,
        clearFilters,
    });

    const handleCellChange = (rowId: string, columnId: string, value: number): void => {
        if (value < 0) {
            addToast('error', tW('common.messages.negativeValuesNotAllowed'));
            return;
        }
        if (value > 999999) {
            addToast('error', tW('common.messages.valueExceedsMax'));
            return;
        }

        setEditableRows((prev) => {
            const originalRow = findRowByUid(rowId);
            if (!originalRow) return prev;

            const existingEdit = prev[rowId];
            const updatedRow: AgeFactorCVMaster = {
                ...originalRow,
                ...(existingEdit || {}),
                [columnId]: value,
            };
            return {
                ...prev,
                [rowId]: updatedRow,
            };
        });
    };

    const handleAddAgeRange = (): void => {
        if (!ageFrom || !ageTo) {
            addToast('warning', t('messages.provideBothAges'));
            return;
        }
        if (parseInt(ageFrom) > parseInt(ageTo)) {
            addToast('error', t('messages.fromAgeGreaterError'));
            return;
        }
        const newRange = `${ageFrom}-${ageTo}`;
        if (ageRangeOptions.find(opt => opt.value === newRange)) {
            addToast('info', t('messages.ageRangeExists'));
            return;
        }
        setUserAddedAgeRanges(prev => [...prev, { label: `${ageFrom}-${ageTo}`, value: newRange }]);
        setSelectedAgeRange(newRange);
        addToast('success', t('messages.ageRangeAdded', { from: ageFrom, to: ageTo }));
        setIsAgeRangeAdded(true);
        setIsAddYearRangeModalOpen(false);
        setAgeFrom("");
        setAgeTo("");
    };

    const handleAgeRangeChange = (value: string): void => {
        setSelectedAgeRange(value);
        if (value) {
            const [from, to] = value.split("-");
            setAgeFrom(from);
            setAgeTo(to);
        } else {
            setAgeFrom("");
            setAgeTo("");
        }
    };

    const changePage = (page: number): void => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));
        const q = searchParams.get("q");
        if (q) params.set("q", q);
        if (selectedYear) params.set("selectedYearRange", selectedYear);
        if (constructionType) params.set("constructionType", constructionType);
        router.push(`/${locale}/property-tax/weightage-master/age-weightage?${params.toString()}`);
    };

    const changePageSize = (size: number): void => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1");
        params.set("pageSize", String(size));
        const q = searchParams.get("q");
        if (q) params.set("q", q);
        if (selectedYear) params.set("selectedYearRange", selectedYear);
        if (constructionType) params.set("constructionType", constructionType);
        router.push(`/${locale}/property-tax/weightage-master/age-weightage?${params.toString()}`);
    };

    const handleAssessmentYearChange = (value: string): void => {
        setSelectedYear(value);
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1");
        if (value) params.set("selectedYearRange", value);
        else params.delete("selectedYearRange");
        router.push(`/${locale}/property-tax/weightage-master/age-weightage?${params.toString()}`);
    };

    const handleConstructionTypeChange = (value: string): void => {
        setConstructionType(value);
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1");
        if (value) params.set("constructionType", value);
        else params.delete("constructionType");
        router.push(`/${locale}/property-tax/weightage-master/age-weightage?${params.toString()}`);
    };

    const handleClearAll = (): void => {
        clearFilters();
        router.push(`/${locale}/property-tax/weightage-master/age-weightage`);
        addToast('info', tW('common.messages.allClearedInfo'));
    };

    return {
        t,
        tW,
        selectedYear,
        editableRows,
        constructionType,
        selectedAgeRange,
        ageFrom,
        setAgeFrom,
        ageTo,
        setAgeTo,
        ageRangeOptions,
        factorValue,
        setFactorValue,
        isAddYearRangeModalOpen,
        setIsAddYearRangeModalOpen,
        toasts,
        isUpdating,
        isBulkUpdating,
        isGeneratingAll,
        hasNewRecords,
        newRecordsCount,
        canGenerateAll,
        getRowUid,
        addToast,
        removeToast,
        handleCellChange,
        handleUpdate,
        handleCancelRow,
        handleAddAgeRange,
        handleAgeRangeChange,
        handleAssessmentYearChange,
        handleConstructionTypeChange,
        handleApplyFilter,
        handleBulkUpdate,
        handleGenerateAll,
        handleClearAll,
        changePage,
        changePageSize,
    };
};
