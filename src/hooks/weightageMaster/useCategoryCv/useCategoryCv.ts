"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { UseFactorCVMaster, UseType } from "@/types/useCategoryCvFactor.types";
import { useCategoryCvRowOps } from "./useCategoryCvRowOps";
import { useCategoryCvBulkOps } from "./useCategoryCvBulkOps";

export interface UseCategoryCvProps {
    data: UseFactorCVMaster[];
    pageSize: number;
    pageNumber: number;
    typeOfUsePageSize: number;
    typeOfUsePageNumber: number;
}

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

    const [selectedYear, setSelectedYear] = useState<string>(currentSelectedYear);
    const [editableRows, setEditableRows] = useState<Record<string, UseFactorCVMaster>>({});
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(currentTypeOfUse ? Number(currentTypeOfUse) : null);
    const [typeOfUseId, setTypeOfUseId] = useState<string>(currentTypeOfUse);
    const [factorValue, setFactorValue] = useState<string>("0.00");

    const [isUpdating, setIsUpdating] = useState(false);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);

    const newRecordsCount = data.filter(row => row.id === 0).length;
    const hasNewRecords = newRecordsCount > 0;

    const [toasts, setToasts] = useState<Array<{ id: string; type: "success" | "error" | "info" | "warning"; message: string }>>([]);

    const getRowUid = useCallback((row: UseFactorCVMaster): string => 
        `${row.id}-${row.typeOfUseId}-${row.subTypeOfUseId}-${row.yearRangeCVId || 'noYear'}`, []);

    const findRowByUid = (uid: string): UseFactorCVMaster | undefined => {
        return data.find(row => getRowUid(row) === uid);
    };

    const addToast = useCallback((type: "success" | "error" | "info" | "warning", message: string): void => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, type, message }]);
    }, []);

    const removeToast = (id: string): void => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const hasShownWarningRef = useRef(false);

    useEffect(() => {
        if (hasNewRecords && !hasShownWarningRef.current) {
            hasShownWarningRef.current = true;
            setTimeout(() => {
                addToast('warning', tW('common.messages.pendingRecordsWarning'));
            }, 0);
        } else if (!hasNewRecords) {
            hasShownWarningRef.current = false;
        }
    }, [hasNewRecords, tW, addToast]);

    const refreshPage = (): void => router.refresh();

    // Utility to build URL with persistent and new params
    const buildUrl = (paramsObj: Record<string, string | number | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());
        
        // Default values if not in searchParams
        if (!params.has("page")) params.set("page", String(pageNumber));
        if (!params.has("pageSize")) params.set("pageSize", String(pageSize));
        if (!params.has("leftPage")) params.set("leftPage", String(typeOfUsePageNumber));
        if (!params.has("leftPageSize")) params.set("leftPageSize", String(typeOfUsePageSize));

        Object.entries(paramsObj).forEach(([key, value]) => {
            if (value === undefined || value === "") {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });

        return `/${locale}/property-tax/weightage-master/sub-type-weightage?${params.toString()}`;
    };

    const changePage = (page: number): void => {
        router.push(buildUrl({ page }));
    };

    const changePageSize = (size: number): void => {
        router.push(buildUrl({ page: 1, pageSize: size }));
    };

    const changeLeftPage = (page: number): void => {
        router.push(buildUrl({ leftPage: page }));
    };

    const changeLeftPageSize = (size: number): void => {
        router.push(buildUrl({ leftPage: 1, leftPageSize: size }));
    };

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

    // Operations
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
        changePage, changePageSize, changeLeftPage, changeLeftPageSize
    };
}
