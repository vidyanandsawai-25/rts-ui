"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { UseFactorCVMaster, UseType } from "@/types/useCategoryCvFactor.types";
import { useCategoryCvRowOps } from "./useCategoryCvRowOps";
import { useCategoryCvBulkOps } from "./useCategoryCvBulkOps";
import { useCategoryCvState } from "./useCategoryCvState";
import { useCategoryCvPagination } from "./useCategoryCvPagination";

export interface UseCategoryCvProps {
    data: UseFactorCVMaster[];
    pageSize: number;
    pageNumber: number;
    typeOfUsePageSize: number;
    typeOfUsePageNumber: number;
}

/**
 * Main hook for the Use Category CV Master module.
 * Orchestrates state, pagination, and various business operations (row and bulk).
 */
export function useCategoryCv({
    data,
    pageSize,
    pageNumber,
    typeOfUsePageSize,
    typeOfUsePageNumber,
}: UseCategoryCvProps) {
    const t = useTranslations("useCategoryFactorMaster");
    const tW = useTranslations("weightageMaster");
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = useLocale();

    const currentSelectedYear = searchParams.get("selectedYearRange") || "";
    const currentTypeOfUse = searchParams.get("typeOfUseId") || "";

    // 1. Core State management
    const state = useCategoryCvState(currentSelectedYear, currentTypeOfUse);
    const { 
        selectedYear, setSelectedYear,
        editableRows, setEditableRows,
        selectedTypeId, setSelectedTypeId,
        typeOfUseId, setTypeOfUseId,
        factorValue, setFactorValue,
        isUpdating, setIsUpdating,
        isBulkUpdating, setIsBulkUpdating,
        isGeneratingAll, setIsGeneratingAll,
        toasts, addToast, removeToast,
        hasShownWarningRef
    } = state;

    // 2. Pagination and Navigation
    const pagination = useCategoryCvPagination(pageNumber, pageSize, typeOfUsePageNumber, typeOfUsePageSize);
    const { buildUrl, ...paginationHandlers } = pagination;

    const newRecordsCount = data.filter(row => row.id === 0).length;
    const hasNewRecords = newRecordsCount > 0;

    const getRowUid = useCallback((row: UseFactorCVMaster): string => 
        `${row.id}-${row.typeOfUseId}-${row.subTypeOfUseId}-${row.yearRangeCVId || 'noYear'}`, []);

    const findRowByUid = (uid: string): UseFactorCVMaster | undefined => {
        return data.find(row => getRowUid(row) === uid);
    };

    // Auto-warning for pending records
    useEffect(() => {
        if (hasNewRecords && !hasShownWarningRef.current) {
            hasShownWarningRef.current = true;
            setTimeout(() => {
                addToast('warning', tW('common.messages.pendingRecordsWarning'));
            }, 0);
        } else if (!hasNewRecords) {
            hasShownWarningRef.current = false;
        }
    }, [hasNewRecords, tW, addToast, hasShownWarningRef]);

    const refreshPage = (): void => router.refresh();

    // Specific change handlers
    const handleAssessmentYearChange = (value: string): void => {
        setSelectedYear(value);
        router.push(buildUrl({ page: 1, selectedYearRange: value }));
    };

    const handleTypeOfUseChange = (value: string): void => {
        setTypeOfUseId(value);
        setSelectedTypeId(Number(value));
        router.push(buildUrl({ page: 1, typeOfUseId: value }));
    };

    const handleTypeRowClick = (row: UseType): void => {
        setSelectedTypeId(row.id);
        setTypeOfUseId(String(row.id));
        router.push(buildUrl({ page: 1, typeOfUseId: String(row.id) }));
    };

    const handleClearAll = (): void => {
        setEditableRows({});
        setFactorValue("0.00");
        setTypeOfUseId("");
        setSelectedTypeId(null);
        setSelectedYear("");
        router.push(`/${locale}/property-tax/weightage-master/sub-type-weightage?page=1&pageSize=${pageSize}&leftPage=1&leftPageSize=${typeOfUsePageSize}`);
        addToast('info', tW('common.messages.allClearedInfo'));
    };

    // 3. Row-level Operations
    const rowOps = useCategoryCvRowOps({
        editableRows,
        setEditableRows,
        setIsUpdating,
        getRowUid,
        findRowByUid,
        addToast,
        refreshPage,
        tW,
    });

    // 4. Bulk Operations
    const bulkOps = useCategoryCvBulkOps({
        data,
        editableRows,
        setEditableRows,
        setIsBulkUpdating,
        setIsGeneratingAll,
        factorValue,
        getRowUid,
        findRowByUid,
        addToast,
        refreshPage,
        tW,
    });

    const parsedFactorValue = parseFloat(factorValue);
    const isApplyDisabled = Number.isNaN(parsedFactorValue) || parsedFactorValue < 0 || data.length === 0;
    const isBulkUpdateDisabled = Object.keys(editableRows).length === 0 || isBulkUpdating;

    return {
        t, tW,
        selectedYear, typeOfUseId, factorValue, setFactorValue,
        editableRows, selectedTypeId,
        isUpdating, isBulkUpdating, isGeneratingAll,
        newRecordsCount, hasNewRecords,
        toasts,
        isApplyDisabled, isBulkUpdateDisabled,
        addToast, removeToast,
        getRowUid, ...rowOps,
        handleAssessmentYearChange, handleTypeOfUseChange, handleTypeRowClick,
        ...bulkOps, handleClearAll,
        ...paginationHandlers
    };
}
