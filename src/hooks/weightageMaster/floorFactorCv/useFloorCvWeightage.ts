"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { FloorFactorCVMaster } from "@/types/floor-cv-weightageMaster.types";
import { useFloorCvRowOps } from "./useFloorCvRowOps";
import { useFloorCvBulkOps } from "./useFloorCvBulkOps";
import { useFloorCvToasts } from "./useFloorCvToasts";
import { useFloorCvSessionTracking } from "./useFloorCvSessionTracking";

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
    const { toasts, addToast, removeToast } = useFloorCvToasts();
    
    const {
        editableRows,
        setEditableRows,
        sessionCreatedUids,
        setSessionCreatedUids,
        getRowUid,
        findRowByUid,
    } = useFloorCvSessionTracking({ data });

    // Filter states
    const [fromFloor, setFromFloor] = useState<string>("");
    const [toFloor, setToFloor] = useState<string>("");
    const [liftStatus, setLiftStatus] = useState<string>("both");
    const [factorValue, setFactorValue] = useState<string>("0.00");

    const newRecords = data.filter(row => row.id === 0 && !sessionCreatedUids.has(getRowUid(row)));
    const hasNewRecords = newRecords.length > 0;
    const newRecordsCount = newRecords.length;

    // Loading states
    const [isUpdating, setIsUpdating] = useState(false);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);

    const currentSearchTerm = searchParams.get("q") || "";

    const hasShownWarningRef = useRef(false);

    useEffect(() => {
        if (hasNewRecords && !hasShownWarningRef.current) {
            addToast("warning", tW("common.messages.pendingRecordsWarning"));
            hasShownWarningRef.current = true;
        } else if (!hasNewRecords) {
            hasShownWarningRef.current = false;
        }
    }, [hasNewRecords, tW, addToast]);

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
        setSessionCreatedUids,
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
        sessionCreatedUids,
        setSessionCreatedUids,
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
        parseFloat(factorValue) < 0 ||
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
