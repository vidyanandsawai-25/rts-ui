"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { FloorFactorCVMaster } from "@/types/floor-cv-weightageMaster.types";
import { useFloorCvRowOps } from "./useFloorCvRowOps";
import { useFloorCvBulkOps } from "./useFloorCvBulkOps";

export interface UseFloorCvWeightageProps {
    data: FloorFactorCVMaster[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
}

export function useFloorCvWeightage({
    data,
    pageNumber,
    pageSize,
    totalCount,
}: UseFloorCvWeightageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = useLocale();
    const tCommon = useTranslations("common");
    const t = useTranslations("floorFactorMaster");
    const tW = useTranslations("weightageMaster");

    const currentSelectedYear = searchParams.get("selectedYearRange") || "";
    const [selectedYear, setSelectedYear] = useState<string>(currentSelectedYear);
    const [editableRows, setEditableRows] = useState<Record<string, FloorFactorCVMaster>>({});

    // Filter states
    const [fromFloor, setFromFloor] = useState<string>("");
    const [toFloor, setToFloor] = useState<string>("");
    const [liftStatus, setLiftStatus] = useState<string>("both");
    const [factorValue, setFactorValue] = useState<string>("0.00");

    // Toast state
    const [toasts, setToasts] = useState<Array<{ id: string; type: "success" | "error" | "info" | "warning"; message: string }>>([]);

    // Loading states
    const [isUpdating, setIsUpdating] = useState(false);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);

    const newRecordsCount = data.filter((row) => row.id === 0).length;
    const hasNewRecords = newRecordsCount > 0;

    const currentSearchTerm = searchParams.get("q") || "";

    // Toast functions
    const addToast = useCallback((type: "success" | "error" | "info" | "warning", message: string) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, type, message }]);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const hasShownWarningRef = useRef(false);

    useEffect(() => {
        if (hasNewRecords && !hasShownWarningRef.current) {
            // Defer to avoid calling setState synchronously inside an effect body
            const timer = setTimeout(() => {
                addToast("warning", tW("common.messages.pendingRecordsWarning"));
            }, 0);
            hasShownWarningRef.current = true;
            return () => clearTimeout(timer);
        } else if (!hasNewRecords) {
            hasShownWarningRef.current = false;
        }
    }, [hasNewRecords, tW, addToast]);

    // Helper function to generate unique row identifier
    // Uses id-floorId-yearRangeCVID-fromYear-toYear combination to ensure uniqueness
    // This is critical for rows with id === 0 (new records) and handles undefined yearRangeCVID
    const getRowUid = (row: FloorFactorCVMaster): string => {
        return `${row.id}-${row.floorId}-${row.yearRangeCVID || "noYear"}-${row.fromYear}-${row.toYear}`;
    };

    // Helper function to find row by UID
    const findRowByUid = (uid: string): FloorFactorCVMaster | undefined => {
        return data.find((row) => getRowUid(row) === uid);
    };

    const refreshPage = () => router.refresh();

    // Lift status options
    const liftStatusOptions = [
        { label: t("liftStatusOptions.both"), value: "both" },
        { label: t("liftStatusOptions.withLift"), value: "withLift" },
        { label: t("liftStatusOptions.withoutLift"), value: "withoutLift" },
    ];

    // Helper function to clear all filters
    const clearFilters = () => {
        setFromFloor("");
        setToFloor("");
        setLiftStatus("both");
        setFactorValue("0.00");
    };

    // Row-level CRUD operations
    const { handleCellChange, handleUpdate, handleCancel } = useFloorCvRowOps({
        data,
        editableRows,
        setEditableRows,
        setIsUpdating,
        getRowUid,
        findRowByUid,
        addToast,
        refreshPage,
        clearFilters,
    });

    // Bulk operations
    const { handleApplyFilter, handleBulkUpdate, handleGenerateAll } = useFloorCvBulkOps({
        data,
        editableRows,
        setEditableRows,
        setIsBulkUpdating,
        setIsGeneratingAll,
        selectedYear,
        fromFloor,
        toFloor,
        liftStatus,
        factorValue,
        getRowUid,
        findRowByUid,
        addToast,
        refreshPage,
        clearFilters,
    });

    const buildFloorUrl = (params: {
        page?: number;
        pageSize?: number;
        year?: string;
        q?: string;
    }): string => {
        const urlParams = new URLSearchParams();
        urlParams.set("page", String(params.page ?? 1));
        urlParams.set("pageSize", String(params.pageSize ?? pageSize));
        
        const q = params.q ?? currentSearchTerm;
        if (q) urlParams.set("q", q);
        
        const year = params.year ?? selectedYear;
        if (year) urlParams.set("selectedYearRange", year);
        
        return `/${locale}/property-tax/weightage-master?${urlParams.toString()}`;
    };

    // Handle clear all changes and filters
    const handleClearAll = () => {
        setEditableRows({});
        clearFilters();
        setSelectedYear("");

        router.push(buildFloorUrl({ page: 1, year: "" }));
        addToast("info", tW("common.messages.allClearedInfo"));
    };

    /* ================= PAGINATION ================= */
    const changePage = (p: number): void => {
        router.push(buildFloorUrl({ page: p }));
    };

    const changePageSize = (size: number): void => {
        router.push(buildFloorUrl({ page: 1, pageSize: size }));
    };

    const handleAssessmentYearChange = (value: string) => {
        setSelectedYear(value);
        router.push(buildFloorUrl({ page: 1, year: value }));
    };

    // Derived states for button enable/disable logic
    // Apply button should be disabled unless all filter values are selected/valid
    // Assessment year MUST be selected before bulk factor can be applied
    // It stays enabled for open-ended ranges and only rejects explicitly invalid bounded ranges
    const isRangeInvalid =
        !!fromFloor &&
        !!toFloor &&
        parseInt(fromFloor) > parseInt(toFloor);
    const isApplyDisabled =
        !selectedYear ||
        !liftStatus ||
        parseFloat(factorValue) <= 0 ||
        isRangeInvalid;
    const isBulkUpdateDisabled = Object.keys(editableRows).length === 0 || isBulkUpdating;
    // const isSingleUpdateDisabled = isBulkUpdating || isUpdating;

    return {
        // Translations
        t,
        tW,
        tCommon,
        // State
        selectedYear,
        editableRows,
        fromFloor,
        setFromFloor,
        toFloor,
        setToFloor,
        liftStatus,
        setLiftStatus,
        factorValue,
        setFactorValue,
        toasts,
        isUpdating,
        isBulkUpdating,
        isGeneratingAll,
        newRecordsCount,
        hasNewRecords,
        totalCount,
        pageSize,
        pageNumber,
        // Derived
        isApplyDisabled,
        isBulkUpdateDisabled,
        liftStatusOptions,
        // Helpers
        getRowUid,
        addToast,
        removeToast,
        // Handlers
        handleCellChange,
        handleUpdate,
        handleCancel,
        handleApplyFilter,
        handleBulkUpdate,
        handleGenerateAll,
        handleClearAll,
        changePage,
        changePageSize,
        handleAssessmentYearChange,
    };
}
