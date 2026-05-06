import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getRateMasterByFilters } from "@/app/[locale]/property-tax/rate-master/rvratemaster/action";
import { bulkCreateRateMasterAction, bulkUpdateRateMasterAction, deleteRateMasterAction } from "@/app/[locale]/property-tax/rate-master/rvratemaster/action";
import type { IBackendRateMaster, RatePayload, RateCategory } from "@/types/RVRateMaster";

interface UseRateMasterOperationsProps {
  mode: "add" | "edit" | "delete";
  id?: string;
  selectedZone: string;
  selectedUseGroup: string;
  assessmentYear: string;
  rateFrequency: "Monthly" | "Yearly";
  multipliers: Record<string, number>;
  rateCategories: RateCategory[];
  useGroupOptions: Array<{ label: string; value: string }>;
}

export function useRateMasterOperations({
  mode,
  id,
  selectedZone,
  selectedUseGroup,
  assessmentYear,
  rateFrequency,
  multipliers,
  rateCategories,
  useGroupOptions,
}: UseRateMasterOperationsProps) {
  const t = useTranslations("ptis_RVRateMaster");

  // Build payload from matrix data
  const buildPayloadFromMatrix = useCallback((
    matrixData: Array<Record<string, unknown>>,
    _currentMultiplier: number,
    existingBackendRates: IBackendRateMaster[] = [],
    targetUseGroup?: string // NEW: optional parameter for target use group (used for multipliers)
  ): { updates: RatePayload[], inserts: RatePayload[] } => {
    const updates: RatePayload[] = [];
    const inserts: RatePayload[] = [];

    // Use targetUseGroup if provided, otherwise fall back to selectedUseGroup
    const useGroupForPayload = targetUseGroup || selectedUseGroup;

    function findExistingRate(taxZoneId: number, constructionId: string) {
      return existingBackendRates.find(r => {
        const rTaxZoneId = r.taxZoneId;
        const rConstructionTypeId = r.constructionTypeId;
        const rTypeOfUseGroupId = r.typeOfUseGroupId;
        const rYearRangeRVId = r.yearRangeRVId ?? r.yearRangeId;
        const rRateSectionId = r.rateSectionId;
        
        return (
          Number(rTaxZoneId) === taxZoneId &&
          Number(rConstructionTypeId) === Number(constructionId) &&
          Number(rTypeOfUseGroupId) === Number(useGroupForPayload) && // Use the correct use group
          Number(rYearRangeRVId) === Number(assessmentYear) &&
          Number(rRateSectionId) === Number(selectedZone)
        );
      });
    }

    matrixData.forEach(row => {
      rateCategories.forEach(cat => {
        const constructionId = typeof cat === 'string' ? cat : cat.constructionId;
        if (!constructionId) return;
        
        const rowKey = typeof cat === 'string' ? cat : (cat.constructionCode || cat.constructionId);
        const val = row[rowKey];
        
        if (val === undefined || val === null || val === '' || isNaN(Number(val)) || Number(val) <= 0) return;
        
        const zoneNoVal = String(row.zoneNo ?? row.zone ?? '');
        const taxZoneIdVal = row.taxZoneId || Number(zoneNoVal);
        const existing = findExistingRate(Number(taxZoneIdVal), constructionId);
        
        const payload: RatePayload = {
          taxZoneId: Number(row.taxZoneId) || Number(zoneNoVal),
          constructionTypeId: Number(constructionId),
          typeOfUseGroupId: Number(useGroupForPayload), // Use the correct use group
          YearRangeRVId: Number(assessmentYear),
          rateSectionId: Number(selectedZone),
          rateSquareMeter: Number(val),
          rateSquareFeet: Number((Number(val) * 10.7639).toFixed(2)),
          rateRemark: rateFrequency === "Yearly" ? "YearWise Rate" : "MonthWise Rate",
          createdBy: 1,
          floorId: Number(row.floorID ?? 67),
          isActive: true,
        };
        
        const rowRates = (row as { rates?: Array<Record<string, unknown>> }).rates;
        const rateCellInRow = Array.isArray(rowRates) ? rowRates.find((r) => 
          r.rateCategory === rowKey || Number(r.constructionTypeId) === Number(constructionId)
        ) : undefined;
        const rateIdInRow = rateCellInRow?.id;
        const existingId = rateIdInRow || existing?.id;
        
        if (existingId) {
          // Only include in updates if value actually changed
          const originalValue = existing?.rateSquareMeter ?? 0;
          if (Number(val) !== Number(originalValue)) {
            payload.Id = Number(existingId);
            updates.push(payload);
          }
        } else {
          inserts.push(payload);
        }
      });
    });

    return { updates, inserts };
  }, [rateCategories, selectedUseGroup, assessmentYear, selectedZone, rateFrequency]);

  // Bulk create handler
  const handleBulkCreate = useCallback(async (completeMatrixData: Array<Record<string, unknown>>) => {
    if (!assessmentYear) {
      toast.error(t('messages.validationSelectAssessmentYear'));
      return { success: false };
    }

    const hasAtLeastOneRate = completeMatrixData.some(row => {
      return rateCategories.some(cat => {
        const key = cat.constructionCode || cat.constructionId;
        const value = row[key];
        const numValue = Number(value);
        return numValue > 0;
      });
    });

    if (!hasAtLeastOneRate) {
      toast.error(t('messages.validationEnterRateValue'));
      return { success: false };
    }

    // Check for existing rates
    const isAddMode = mode === "add" && !id;
    if (isAddMode) {
      try {
        const existingForSelection = await getRateMasterByFilters(
          String(selectedZone),
          String(selectedUseGroup),
          String(assessmentYear)
        );
        if (existingForSelection && existingForSelection.length > 0) {
          toast.error(t('messages.validationRatesAlreadyExist'));
          return { success: false };
        }
      } catch (_err) {
        // Continue with operation even if check fails
      }
    }

    const currentMultiplier = multipliers[selectedUseGroup] || 1.0;
    let finalMatrixData = completeMatrixData;
    if (currentMultiplier > 0 && currentMultiplier !== 1.0) {
      finalMatrixData = completeMatrixData.map(row => {
        const multipliedRow = { ...row };
        rateCategories.forEach(cat => {
          const key = cat.constructionCode || cat.constructionId;
          const originalValue = row[key] as number;
          multipliedRow[key] = originalValue > 0 ? Number((originalValue * currentMultiplier).toFixed(2)) : 0;
        });
        return multipliedRow;
      });
    }

    const activeMultipliers = Object.entries(multipliers).filter(
      ([useGroup, value]) => value > 0 && value !== 1.0 && useGroup !== selectedUseGroup
    );

    const allRateSubmissions = [
      { matrixData: finalMatrixData, useGroup: selectedUseGroup, multiplier: currentMultiplier, assessmentYear }
    ];

    activeMultipliers.forEach(([useGroup, multiplier]) => {
      const multipliedMatrixData = completeMatrixData.map(row => {
        const multipliedRow = { ...row };
        rateCategories.forEach(cat => {
          const key = cat.constructionCode || cat.constructionId;
          const originalValue = row[key] as number;
          multipliedRow[key] = originalValue > 0 ? Number((originalValue * multiplier).toFixed(2)) : 0;
        });
        return multipliedRow;
      });

      allRateSubmissions.push({ matrixData: multipliedMatrixData, useGroup, multiplier, assessmentYear });
    });

    let successCount = 0;
    const errorMessages: string[] = [];

    for (const submission of allRateSubmissions) {
      let backendRates: IBackendRateMaster[] = [];
      try {
        backendRates = await getRateMasterByFilters(
          String(selectedZone),
          String(submission.useGroup),
          String(assessmentYear)
        );
      } catch (_err) {
        backendRates = [];
      }

      // Pass submission.useGroup to buildPayloadFromMatrix so it uses the correct use group
      const { updates, inserts } = buildPayloadFromMatrix(
        submission.matrixData, 
        submission.multiplier, 
        backendRates,
        submission.useGroup // Pass the target use group
      );

      let updateSucceeded = true;
      if (updates.length > 0) {
        const bulkUpdatePayload = updates.map(rate => ({
          id: rate.Id!,
          data: {
            IsActive: rate.isActive,
            UpdatedBy: 1,
            TaxZoneId: rate.taxZoneId,
            FloorId: rate.floorId,
            ConstructionTypeId: rate.constructionTypeId,
            TypeOfUseGroupId: rate.typeOfUseGroupId,
            YearRangeRVId: rate.YearRangeRVId,
            RateSquareMeter: rate.rateSquareMeter,
            RateSquareFeet: rate.rateSquareFeet,
            RateSectionId: rate.rateSectionId,
            RateRemark: rate.rateRemark,
          }
        }));
        try {
          const updateResult = await bulkUpdateRateMasterAction(bulkUpdatePayload);
          if (!updateResult.success) {
            updateSucceeded = false;
            const useGroupLabel = useGroupOptions.find(u => u.value === submission.useGroup)?.label || submission.useGroup;
            errorMessages.push(`${useGroupLabel} (Update): ${updateResult.message || 'Failed to update rates'}`);
          }
        } catch (error) {
          updateSucceeded = false;
          errorMessages.push(error instanceof Error ? error.message : 'Server action failed');
        }
      }

      let createSucceeded = true;
      if (inserts.length > 0) {
        const createPayload = inserts.map(rate => ({
          isActive: rate.isActive,
          createdBy: 1,
          taxZoneId: rate.taxZoneId,
          floorId: rate.floorId,
          constructionTypeId: rate.constructionTypeId,
          typeOfUseGroupId: rate.typeOfUseGroupId,
          yearRangeRVId: rate.YearRangeRVId,
          rateSquareMeter: rate.rateSquareMeter,
          rateSquareFeet: rate.rateSquareFeet,
          rateSectionId: rate.rateSectionId,
          rateRemark: rate.rateRemark,
        }));
        try {
          const createResult = await bulkCreateRateMasterAction(createPayload);
          if (!createResult.success) {
            createSucceeded = false;
            const useGroupLabel = useGroupOptions.find(u => u.value === submission.useGroup)?.label || submission.useGroup;
            errorMessages.push(`${useGroupLabel} (Create): ${createResult.message || 'Failed to create new rates'}`);
          }
        } catch (error) {
          createSucceeded = false;
          errorMessages.push(error instanceof Error ? error.message : 'Server action failed');
        }
      }

      if ((updates.length > 0 || inserts.length > 0) && updateSucceeded && createSucceeded) {
        successCount++;
      }
    }

    if (successCount === allRateSubmissions.length) {
      const useGroupLabels = allRateSubmissions.map(s => 
        useGroupOptions.find(u => u.value === s.useGroup)?.label || s.useGroup
      ).join(', ');
      toast.success(t('messages.ratesAddedSuccess', { groups: useGroupLabels }));
      return { success: true };
    } else if (successCount > 0) {
      toast.warning(t('messages.ratesAddedPartial', { count: successCount, errors: errorMessages.join('; ') }));
      return { success: true };
    } else {
      toast.error(t('messages.ratesAddedFailed', { errors: errorMessages.join('; ') }));
      return { success: false };
    }
  }, [assessmentYear, selectedZone, selectedUseGroup, multipliers, rateCategories, mode, id, t, buildPayloadFromMatrix, useGroupOptions]);

  // Bulk update handler
  const handleBulkUpdate = useCallback(async (completeMatrixData: Array<Record<string, unknown>>) => {
    if (!assessmentYear) {
      toast.error(t('messages.validationSelectAssessmentYear'));
      return { success: false };
    }

    const currentMultiplier = multipliers[selectedUseGroup] || 1.0;
    let finalMatrixData = completeMatrixData.map(row => {
      const parsedRow = { ...row };
      rateCategories.forEach(cat => {
        const key = String(typeof cat === 'string' ? cat : (cat.constructionCode || cat.constructionId)).trim();
        const val = row[key];
        parsedRow[key] = val === '' || val === null || val === undefined ? 0 : Number(val);
      });
      return parsedRow;
    });

    if (currentMultiplier > 0 && currentMultiplier !== 1.0) {
      finalMatrixData = finalMatrixData.map(row => {
        const multipliedRow = { ...row };
        rateCategories.forEach(cat => {
          const key = String(typeof cat === 'string' ? cat : (cat.constructionCode || cat.constructionId)).trim();
          const originalValue = row[key] as number;
          multipliedRow[key] = originalValue > 0 ? Number((originalValue * currentMultiplier).toFixed(2)) : 0;
        });
        return multipliedRow;
      });
    }

    const activeMultipliers = Object.entries(multipliers).filter(
      ([useGroup, value]) => value > 0 && value !== 1.0 && useGroup !== selectedUseGroup
    );

    let latestBackendRates: IBackendRateMaster[] = [];
    try {
      latestBackendRates = await getRateMasterByFilters(
        String(selectedZone),
        String(selectedUseGroup),
        String(assessmentYear)
      );
    } catch (_err) {
      toast.error(t('messages.validationFetchUpdateFailed'));
      return { success: false };
    }

    const allRateSubmissions = [
      { matrixData: finalMatrixData, useGroup: selectedUseGroup, multiplier: currentMultiplier, backendRates: latestBackendRates }
    ];

    for (const [useGroup, multiplier] of activeMultipliers) {
      const multipliedMatrixData = completeMatrixData.map(row => {
        const multipliedRow = { ...row };
        rateCategories.forEach(cat => {
          const key = cat.constructionCode || cat.constructionId;
          const originalValue = row[key] as number;
          multipliedRow[key] = originalValue > 0 ? Number((originalValue * multiplier).toFixed(2)) : 0;
        });
        return multipliedRow;
      });

      let multipliedBackendRates: IBackendRateMaster[] = [];
      try {
        multipliedBackendRates = await getRateMasterByFilters(selectedZone, useGroup, assessmentYear);
      } catch (_err) {
        // Continue with empty backend rates for this multiplied use group
      }

      allRateSubmissions.push({ matrixData: multipliedMatrixData, useGroup, multiplier, backendRates: multipliedBackendRates });
    }

    let successCount = 0;
    const errorMessages: string[] = [];

    for (const submission of allRateSubmissions) {
      // Pass submission.useGroup to buildPayloadFromMatrix so it uses the correct use group
      const { updates, inserts } = buildPayloadFromMatrix(
        submission.matrixData, 
        submission.multiplier, 
        submission.backendRates,
        submission.useGroup // Pass the target use group
      );

      let updateSucceeded = true;
      if (updates.length > 0) {
        const bulkUpdatePayload = updates.map(rate => ({
          id: rate.Id!,
          data: {
            IsActive: rate.isActive,
            UpdatedBy: 1,
            TaxZoneId: rate.taxZoneId,
            FloorId: rate.floorId,
            ConstructionTypeId: rate.constructionTypeId,
            TypeOfUseGroupId: rate.typeOfUseGroupId,
            YearRangeRVId: rate.YearRangeRVId,
            RateSquareMeter: rate.rateSquareMeter,
            RateSquareFeet: rate.rateSquareFeet,
            RateSectionId: rate.rateSectionId,
            RateRemark: rate.rateRemark,
          }
        }));
        const updateResult = await bulkUpdateRateMasterAction(bulkUpdatePayload);
        if (!updateResult.success) {
          updateSucceeded = false;
          const useGroupLabel = useGroupOptions.find(u => u.value === submission.useGroup)?.label || submission.useGroup;
          errorMessages.push(`${useGroupLabel} (Update): ${updateResult.message || 'Failed to update rates'}`);
        }
      }

      let createSucceeded = true;
      if (inserts.length > 0) {
        const createPayload = inserts.map(rate => ({
          isActive: rate.isActive,
          createdBy: 1,
          taxZoneId: rate.taxZoneId,
          floorId: rate.floorId,
          constructionTypeId: rate.constructionTypeId,
          typeOfUseGroupId: rate.typeOfUseGroupId,
          yearRangeRVId: rate.YearRangeRVId,
          rateSquareMeter: rate.rateSquareMeter,
          rateSquareFeet: rate.rateSquareFeet,
          rateSectionId: rate.rateSectionId,
          rateRemark: rate.rateRemark,
        }));
        const createResult = await bulkCreateRateMasterAction(createPayload);
        if (!createResult.success) {
          createSucceeded = false;
          const useGroupLabel = useGroupOptions.find(u => u.value === submission.useGroup)?.label || submission.useGroup;
          errorMessages.push(`${useGroupLabel} (Create): ${createResult.message || 'Failed to create new rates'}`);
        }
      }

      if ((updates.length > 0 || inserts.length > 0) && updateSucceeded && createSucceeded) {
        successCount++;
      }
    }

    if (successCount === allRateSubmissions.length) {
      const useGroupLabels = allRateSubmissions.map(s => 
        useGroupOptions.find(u => u.value === s.useGroup)?.label || s.useGroup
      ).join(', ');
      toast.success(t('messages.ratesUpdatedSuccess', { groups: useGroupLabels }));
      return { success: true };
    } else if (successCount > 0) {
      toast.warning(t('messages.ratesUpdatedPartial', { count: successCount, errors: errorMessages.join('; ') }));
      return { success: true };
    } else {
      toast.error(t('messages.ratesUpdatedFailed', { errors: errorMessages.join('; ') }));
      return { success: false };
    }
  }, [assessmentYear, selectedZone, selectedUseGroup, multipliers, rateCategories, t, buildPayloadFromMatrix, useGroupOptions]);

  // Delete handler
  const handleDelete = useCallback(async (latestBackendRates: IBackendRateMaster[]) => {
    if (!latestBackendRates || latestBackendRates.length === 0) {
      toast.error(t('messages.noRatesToDelete'));
      return { success: false };
    }

    // Count configured (non-zero) rates across all backend rates
    const configuredRatesCount = latestBackendRates.reduce((count, rate) => {
      // Count each backend row with a non-zero rateSquareMeter
      return count + (Number(rate.rateSquareMeter) > 0 ? 1 : 0);
    }, 0);

    const result = await deleteRateMasterAction(latestBackendRates);
    if (result.success) {
      const deletedCount = 'count' in result && typeof result.count === 'number' ? result.count : configuredRatesCount;
      toast.success(t('messages.ratesDeletedSuccess', { count: deletedCount }));
      return { success: true };
    } else {
      toast.error(result.message || t('messages.ratesDeleteFailed'));
      return { success: false };
    }
  }, [t]);

  return {
    handleBulkCreate,
    handleBulkUpdate,
    handleDelete,
  };
}
