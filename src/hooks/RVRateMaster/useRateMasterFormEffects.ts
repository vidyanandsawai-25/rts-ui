import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { RateCategory } from "@/types/RVRateMaster";

type MatrixRow = {
  id: number;
  zone?: string;
  zoneNo?: string;
  taxZoneId?: number;
  [key: string]: number | string | undefined;
};

interface RateMasterFormEffectsProps {
  isOpenPlot: boolean;
  filterValues?: Record<string, unknown>;
  finalZoneOptions: unknown[];
  finalUseGroupOptions: unknown[];
  finalAssessmentYears: unknown[];
  loadZoneOptions: () => void;
  loadUseGroupOptions: () => void;
  loadAssessmentYears: () => void;
  showMatrix: boolean;
  matrixData: MatrixRow[];
  setMatrixData: React.Dispatch<React.SetStateAction<MatrixRow[]>>;
  localRateCategories: RateCategory[];
  selectedZone: string;
  selectedUseGroup: string;
  assessmentYear: string;
  isEditMode: boolean;
  existingRateFound: boolean;
  t: ReturnType<typeof import("next-intl").useTranslations>;
}

export function useRateMasterFormEffects({
  isOpenPlot,
  filterValues,
  finalZoneOptions,
  finalUseGroupOptions,
  finalAssessmentYears,
  loadZoneOptions,
  loadUseGroupOptions,
  loadAssessmentYears,
  showMatrix,
  matrixData,
  setMatrixData,
  localRateCategories,
  selectedZone,
  selectedUseGroup,
  assessmentYear,
  isEditMode,
  existingRateFound,
  t,
}: RateMasterFormEffectsProps) {
  // 1. Trigger lazy loading on mount if filterValues are present (for page reload)
  useEffect(() => {
    if (filterValues?.zone && finalZoneOptions.length === 0) {
      loadZoneOptions();
    }
    if (!isOpenPlot && filterValues?.useGroup && finalUseGroupOptions.length === 0) {
      loadUseGroupOptions();
    }
    if (filterValues?.year && finalAssessmentYears.length === 0) {
      loadAssessmentYears();
    }
  }, [filterValues, finalZoneOptions.length, finalUseGroupOptions.length, finalAssessmentYears.length, loadZoneOptions, loadUseGroupOptions, loadAssessmentYears, isOpenPlot]);

  // 2. Synchronize matrixData columns dynamically when localRateCategories is reconfigured
  useEffect(() => {
    if (showMatrix && matrixData.length > 0) {
      setMatrixData(prev => prev.map(row => {
        const newRow = { ...row };
        const validIds = new Set(localRateCategories.map(c => c.constructionId));

        // Remove columns not present in localRateCategories
        Object.keys(newRow).forEach(key => {
          if (key !== 'id' && key !== 'zone' && key !== 'zoneNo' && key !== 'taxZoneId' && !validIds.has(key)) {
            delete newRow[key];
          }
        });

        // Add newly configured columns with default value of 0
        localRateCategories.forEach(cat => {
          if (newRow[cat.constructionId] === undefined) {
            newRow[cat.constructionId] = 0;
          }
        });
        return newRow;
      }));
    }
  }, [localRateCategories, showMatrix, setMatrixData, matrixData.length]);

  // 3. Show toast alerts when filters match existing rates (only in add mode)
  const hasShownToastRef = useRef(false);

  // Reset toast shown flag when filters change
  useEffect(() => {
    hasShownToastRef.current = false;
  }, [selectedZone, selectedUseGroup, assessmentYear]);

  useEffect(() => {
    if (isOpenPlot) return; // bypass for open plot
    if (!isEditMode && existingRateFound && !hasShownToastRef.current) {
      toast.error(t('messages.validationRatesAlreadyExist'));
      hasShownToastRef.current = true;
    }
    if (!existingRateFound) {
      hasShownToastRef.current = false;
    }
  }, [existingRateFound, isEditMode, t, selectedZone, selectedUseGroup, assessmentYear, isOpenPlot]);
}
