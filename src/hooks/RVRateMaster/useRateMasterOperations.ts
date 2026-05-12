import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getRateMasterByFilters, deleteRateMasterAction } from "@/app/[locale]/property-tax/rate-master/rvratemaster/action";
import type { IBackendRateMaster, RateCategory } from "@/types/RVRateMaster";
import { 
  buildRateSubmissions, 
  fetchBackendRatesForSubmission, 
  processRateSubmissions 
} from "./helpers/rateBulkOperations";
import {
  validateMatrixHasRates,
  parseMatrixData,
  formatUseGroupLabels,
  getOperationResult
} from "./helpers/rateOperationValidation";
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

  const getUseGroupLabel = useCallback((useGroup: string) => 
    useGroupOptions.find(u => u.value === useGroup)?.label || useGroup,
    [useGroupOptions]
  );

  // Bulk create handler
  const handleBulkCreate = useCallback(async (completeMatrixData: Array<Record<string, unknown>>) => {
    if (!assessmentYear) {
      toast.error(t('messages.validationSelectAssessmentYear'));
      return { success: false };
    }

    if (!validateMatrixHasRates(completeMatrixData, rateCategories)) {
      toast.error(t('messages.validationEnterRateValue'));
      return { success: false };
    }

    // Check for existing rates in add mode
    if (mode === "add" && !id) {
      try {
        const existingForSelection = await getRateMasterByFilters(selectedZone, selectedUseGroup, assessmentYear);
        if (existingForSelection?.length) {
          toast.error(t('messages.validationRatesAlreadyExist'));
          return { success: false };
        }
      } catch (_err) {
        // Continue even if check fails
      }
    }

    const config = { selectedZone, selectedUseGroup, assessmentYear, rateFrequency, rateCategories };
    const allRateSubmissions = buildRateSubmissions(completeMatrixData, selectedUseGroup, multipliers, rateCategories);

    // Fetch backend rates for each submission
    for (const submission of allRateSubmissions) {
      submission.backendRates = await fetchBackendRatesForSubmission(selectedZone, submission.useGroup, assessmentYear);
    }

    // Process all submissions and show results
    const { successCount, errorMessages } = await processRateSubmissions(allRateSubmissions, config, getUseGroupLabel);
    const result = getOperationResult(successCount, allRateSubmissions.length);
    const useGroupLabels = formatUseGroupLabels(allRateSubmissions, getUseGroupLabel);

    if (result.allSuccess) {
      toast.success(t('messages.ratesAddedSuccess', { groups: useGroupLabels }));
      return { success: true };
    } else if (result.partialSuccess) {
      toast.warning(t('messages.ratesAddedPartial', { count: successCount, errors: errorMessages.join('; ') }));
      return { success: true };
    } else {
      toast.error(t('messages.ratesAddedFailed', { errors: errorMessages.join('; ') }));
      return { success: false };
    }
  }, [assessmentYear, selectedZone, selectedUseGroup, multipliers, rateCategories, mode, id, t, rateFrequency, getUseGroupLabel]);

  // Bulk update handler
  const handleBulkUpdate = useCallback(async (completeMatrixData: Array<Record<string, unknown>>) => {
    if (!assessmentYear) {
      toast.error(t('messages.validationSelectAssessmentYear'));
      return { success: false };
    }

    const config = { selectedZone, selectedUseGroup, assessmentYear, rateFrequency, rateCategories };
    const parsedMatrixData = parseMatrixData(completeMatrixData, rateCategories);
    const allRateSubmissions = buildRateSubmissions(parsedMatrixData, selectedUseGroup, multipliers, rateCategories);

    // Fetch backend rates for primary submission
    const primaryBackendRates = await fetchBackendRatesForSubmission(selectedZone, selectedUseGroup, assessmentYear);
    if (primaryBackendRates.length === 0) {
      toast.error(t('messages.validationFetchUpdateFailed'));
      return { success: false };
    }
    allRateSubmissions[0].backendRates = primaryBackendRates;

    // Fetch backend rates for other submissions
    for (let i = 1; i < allRateSubmissions.length; i++) {
      allRateSubmissions[i].backendRates = await fetchBackendRatesForSubmission(
        selectedZone,
        allRateSubmissions[i].useGroup,
        assessmentYear
      );
    }

    // Process all submissions and show results
    const { successCount, errorMessages } = await processRateSubmissions(allRateSubmissions, config, getUseGroupLabel);
    const result = getOperationResult(successCount, allRateSubmissions.length);
    const useGroupLabels = formatUseGroupLabels(allRateSubmissions, getUseGroupLabel);

    if (result.allSuccess) {
      toast.success(t('messages.ratesUpdatedSuccess', { groups: useGroupLabels }));
      return { success: true };
    } else if (result.partialSuccess) {
      toast.warning(t('messages.ratesUpdatedPartial', { count: successCount, errors: errorMessages.join('; ') }));
      return { success: true };
    } else {
      toast.error(t('messages.ratesUpdatedFailed', { errors: errorMessages.join('; ') }));
      return { success: false };
    }
  }, [assessmentYear, selectedZone, selectedUseGroup, multipliers, rateCategories, t, rateFrequency, getUseGroupLabel]);

  // Delete handler
  const handleDelete = useCallback(async (latestBackendRates: IBackendRateMaster[]) => {
    if (!latestBackendRates?.length) {
      toast.error(t('messages.noRatesToDelete'));
      return { success: false };
    }

    const configuredRatesCount = latestBackendRates.reduce(
      (count, rate) => count + (Number(rate.rateSquareMeter) > 0 ? 1 : 0),
      0
    );

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
