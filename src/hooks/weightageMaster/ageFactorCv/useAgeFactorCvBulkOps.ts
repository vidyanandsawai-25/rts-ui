"use client";

import { useState, Dispatch, SetStateAction } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
    AgeFactorCVMaster,
    BulkAgeFactorCVMasterCreate,
    BulkAgeFactorCVMasterUpdate,
} from "@/types/ageFactorCv.types";
import type { Option } from "@/components/common/select";
import {
    bulkCreateAgeFactorCVMasterAction,
    bulkUpdateAgeFactorCVMasterAction
} from "@/app/[locale]/property-tax/weightage-master/age-weightage/action";
import { getUserIdFromCookie } from "@/lib/utils/cookie";

interface UseAgeFactorCvBulkOpsParams {
    data: AgeFactorCVMaster[];
    editableRows: Record<string, AgeFactorCVMaster>;
    setEditableRows: Dispatch<SetStateAction<Record<string, AgeFactorCVMaster>>>;
    selectedYear: string;
    constructionType: string;
    selectedAgeRange: string;
    ageFrom: string;
    ageTo: string;
    factorValue: string;
    constructionTypeOptions: Option[];
    ageRangeOptions: Option[];
    allAgeFactors: AgeFactorCVMaster[];
    sessionCreatedUids: Set<string>;
    addToast: (type: "success" | "error" | "info" | "warning", message: string) => void;
    getRowUid: (row: AgeFactorCVMaster) => string;
    findRowByUid: (uid: string) => AgeFactorCVMaster | undefined;
    clearFilters: () => void;
}

/**
 * Pure helper to build the payload for generating all missing age factor records.
 * Extracted for better testability and to reduce complexity in the hook.
 */
export const buildGenerateAllPayload = ({
    selectedYear,
    selectedAgeRange,
    ageRangeOptions,
    data,
    constructionType,
    constructionTypeOptions,
    allAgeFactors,
    editableRows,
    defaultFactor,
    userId,
    sessionCreatedUids,
    getRowUid,
}: {
    selectedYear: string;
    selectedAgeRange: string;
    ageRangeOptions: Option[];
    data: AgeFactorCVMaster[];
    constructionType: string;
    constructionTypeOptions: Option[];
    allAgeFactors: AgeFactorCVMaster[];
    editableRows: Record<string, AgeFactorCVMaster>;
    defaultFactor: number;
    userId: number;
    sessionCreatedUids: Set<string>;
    getRowUid: (row: AgeFactorCVMaster) => string;
}): BulkAgeFactorCVMasterCreate => {
    const ageFactors: BulkAgeFactorCVMasterCreate = [];

    const parseRangeValue = (rangeVal: string) => {
        const [ageFrom, ageTo] = rangeVal.split("-").map(Number);
        if (isNaN(ageFrom) || isNaN(ageTo)) {
            return null;
        }
        return { ageFrom, ageTo };
    };

    const hasExistingAgeFactor = (
        constructionTypeId: number,
        targetYearId: number,
        ageFrom: number,
        ageTo: number
    ) =>
        allAgeFactors.some(r =>
            r.id > 0 &&
            r.constructionTypeId === constructionTypeId &&
            (r.yearRangeCVId === targetYearId || r.yearRangeCVID === targetYearId) &&
            r.ageFrom === ageFrom &&
            r.ageTo === ageTo
        );

    const resolveFactorForGeneratedRow = (
        constructionTypeId: number,
        targetYearId: number,
        ageFrom: number,
        ageTo: number
    ) => {
        const reconstructedUid = `0-${constructionTypeId}-${targetYearId}-${ageFrom}-${ageTo}`;
        const edit = editableRows[reconstructedUid];

        if (edit?.factor !== undefined) {
            return edit.factor;
        }

        const pendingRow = data.find(r =>
            r.id === 0 &&
            r.constructionTypeId === constructionTypeId &&
            (r.yearRangeCVId === targetYearId || r.yearRangeCVID === targetYearId) &&
            r.ageFrom === ageFrom &&
            r.ageTo === ageTo &&
            !sessionCreatedUids.has(getRowUid(r))
        );

        return pendingRow?.factor ?? defaultFactor;
    };

    const buildGenerationPayloadForYear = (
        targetYearId: number
    ): BulkAgeFactorCVMasterCreate => {
        const generatedRows: BulkAgeFactorCVMasterCreate = [];

        const typesToProcess = constructionType
            ? constructionTypeOptions.filter(ct => ct.value === constructionType)
            : constructionTypeOptions;

        typesToProcess.forEach(constTypeOpt => {
            const constructionTypeId = parseInt(constTypeOpt.value);
            if (isNaN(constructionTypeId)) return;

            let rangesToProcess: string[] = [];
            if (selectedAgeRange) {
                rangesToProcess = [selectedAgeRange];
            } else if (ageRangeOptions.length > 0) {
                rangesToProcess = ageRangeOptions.map(o => o.value);
            } else {
                const pendingRanges = new Set<string>();
                data.forEach(row => {
                    if (row.ageFrom !== undefined && row.ageTo !== undefined) {
                        pendingRanges.add(`${row.ageFrom}-${row.ageTo}`);
                    }
                });
                rangesToProcess = Array.from(pendingRanges);
            }

            rangesToProcess.forEach(rangeVal => {
                const parsedRange = parseRangeValue(rangeVal);
                if (!parsedRange) return;
                const { ageFrom, ageTo } = parsedRange;

                if (hasExistingAgeFactor(constructionTypeId, targetYearId, ageFrom, ageTo)) {
                    return;
                }

                generatedRows.push({
                    isActive: true,
                    createdBy: userId,
                    constructionTypeId,
                    ageFrom,
                    ageTo,
                    factor: resolveFactorForGeneratedRow(
                        constructionTypeId,
                        targetYearId,
                        ageFrom,
                        ageTo
                    ),
                    yearRangeCVId: targetYearId
                });
            });
        });

        return generatedRows;
    };

    const yearsToProcess = selectedYear ? [selectedYear] : [];
    yearsToProcess.forEach(yearIdStr => {
        const yearId = parseInt(yearIdStr);
        if (isNaN(yearId)) return;
        ageFactors.push(...buildGenerationPayloadForYear(yearId));
    });

    return ageFactors;
};

export const useAgeFactorCvBulkOps = ({
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
}: UseAgeFactorCvBulkOpsParams) => {
    const t = useTranslations('ageFactorMaster');
    const tW = useTranslations('weightageMaster');
    const locale = useLocale();
    const router = useRouter();
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);

    const handleApplyFilter = (): void => {
        const factor = parseFloat(factorValue);
        if (isNaN(factor) || factor <= 0) {
            addToast('warning', t('messages.invalidFactorValue'));
            return;
        }

        const updatedRows: Record<string, AgeFactorCVMaster> = {};
        let updatedCount = 0;

        data.forEach((row) => {
            const rowUid = getRowUid(row);

            const matchesConstruction = !constructionType || row.constructionTypeId === parseInt(constructionType);

            let matchesAge = true;
            if (selectedAgeRange) {
                const [minAge, maxAge] = selectedAgeRange.split("-").map(Number);
                matchesAge = row.ageFrom >= minAge && row.ageTo <= maxAge;
            } else if (ageFrom || ageTo) {
                matchesAge = (!ageFrom || row.ageFrom >= parseInt(ageFrom)) &&
                    (!ageTo || row.ageTo <= parseInt(ageTo));
            }

            const rowYearId = row.yearRangeCVId || row.yearRangeCVID || 0;
            const matchesYear = !selectedYear || Number(rowYearId) === parseInt(selectedYear);

            if (matchesConstruction && matchesAge && matchesYear) {
                updatedRows[rowUid] = {
                    ...row,
                    ...editableRows[rowUid],
                    factor: factor,
                };
                updatedCount++;
            }
        });

        if (updatedCount > 0) {
            setEditableRows(prev => ({ ...prev, ...updatedRows }));
            addToast('success', tW('common.messages.factorApplied', { factor, count: updatedCount }));
        } else {
            addToast('warning', t('messages.noRecordsMatch'));
        }
    };

    const handleBulkUpdate = async (): Promise<void> => {
        const updatedEntries = Object.entries(editableRows);
        if (updatedEntries.length === 0) return;

        setIsBulkUpdating(true);
        try {
            const userId = getUserIdFromCookie() || 1;
            const creates: BulkAgeFactorCVMasterCreate = [];
            const updates: BulkAgeFactorCVMasterUpdate = [];

            for (const [uid, updatedData] of updatedEntries) {
                const originalRow = findRowByUid(uid);
                if (!originalRow) continue;

                const originalYearId = Number(originalRow.yearRangeCVId || originalRow.yearRangeCVID || 0);
                const yearId = parseInt(selectedYear) || originalYearId;

                if (originalRow.id === 0) {
                    creates.push({
                        isActive: true,
                        createdBy: userId,
                        constructionTypeId: originalRow.constructionTypeId,
                        ageFrom: originalRow.ageFrom,
                        ageTo: originalRow.ageTo,
                        factor: updatedData.factor,
                        yearRangeCVId: yearId
                    });
                } else if (originalRow.factor !== updatedData.factor) {
                    updates.push({
                        id: originalRow.id,
                        data: {
                            ageFactorId: originalRow.id,
                            constructionTypeId: originalRow.constructionTypeId,
                            ageFrom: originalRow.ageFrom,
                            ageTo: originalRow.ageTo,
                            factor: updatedData.factor,
                            yearRangeCVId: yearId,
                            isActive: originalRow.isActive,
                            updatedBy: userId
                        }
                    });
                }
            }

            if (creates.length > 0) {
                const payload: BulkAgeFactorCVMasterCreate = creates;
                await bulkCreateAgeFactorCVMasterAction(payload);
            }
            if (updates.length > 0) {
                const payload: BulkAgeFactorCVMasterUpdate = updates;
                await bulkUpdateAgeFactorCVMasterAction(payload);
            }

            addToast('success', t('messages.bulkOperationSuccess'));
            setEditableRows({});
            clearFilters();
            router.push(`/${locale}/property-tax/weightage-master/age-weightage`);
        } catch (_error) {
            addToast('error', t('messages.bulkOperationFailed'));
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const handleGenerateAll = async (): Promise<void> => {
        if (!selectedYear) {
            addToast('warning', t('messages.assessmentYearMissing'));
            return;
        }

        if (constructionTypeOptions.length === 0) {
            addToast('warning', t('messages.noConstructionTypes'));
            return;
        }

        setIsGeneratingAll(true);
        try {
            const userId = getUserIdFromCookie() || 1;
            const defaultFactor = parseFloat(factorValue) || 0.00;
            
            const ageFactors = buildGenerateAllPayload({
                selectedYear,
                selectedAgeRange,
                ageRangeOptions,
                data,
                constructionType,
                constructionTypeOptions,
                allAgeFactors,
                editableRows,
                defaultFactor,
                userId,
                sessionCreatedUids,
                getRowUid,
            });

            if (ageFactors.length === 0) {
                addToast('info', t('messages.allRecordsExist'));
                setIsGeneratingAll(false);
                return;
            }

            const payload: BulkAgeFactorCVMasterCreate = ageFactors;
            const result = await bulkCreateAgeFactorCVMasterAction(payload);
            
            if (result.success) {
                addToast('success', t('messages.recordsGeneratedSuccess', { count: ageFactors.length }));
                setEditableRows({});
                clearFilters();
                router.push(`/${locale}/property-tax/weightage-master/age-weightage`);
            } else {
                addToast('error', result.message || t('messages.generationFailed'));
            }
        } catch (_error) {
            addToast('error', t('messages.errorGeneratingRecords'));
        } finally {
            setIsGeneratingAll(false);
        }
    };

    return {
        isBulkUpdating,
        isGeneratingAll,
        handleApplyFilter,
        handleBulkUpdate,
        handleGenerateAll,
    };
};
