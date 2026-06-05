import { useState, useRef } from "react";
import type { IBackendRateMaster, IRateMaster, ISelectOption, IZoneDescription, RateCategory } from "@/types/RVRateMaster";
import { useRatePagination } from "./useRatePagination";
import { useRateValidation } from "./useRateValidation";
import { useMatrixState } from "./useMatrixState";
import { useMatrixDataBuilder } from "./useMatrixDataBuilder";
import { useMatrixDataSync } from "./useMatrixDataSync";
import { useFormInitialization } from "./useFormInitialization";
import { useSessionStorageManager } from "./useSessionStorageManager";

interface UseRateMasterFormStateProps {
  mode: "edit" | "delete" | "add";
  id?: string | null;
  editData?: IRateMaster | null;
  bulkEditData?: IRateMaster[] | null;
  backendRates?: IBackendRateMaster[] | null;
  fetchedBackendRates: IBackendRateMaster[];
  filterValues?: {
    zone?: string;
    year?: string;
    useGroup?: string;
  };
  selectedZone: string;
  selectedUseGroup: string;
  assessmentYear: string;
  setSelectedZone: (zone: string) => void;
  setSelectedUseGroup: (useGroup: string) => void;
  setAssessmentYear: (year: string) => void;
  rateFrequency: string;
  setRateFrequency: (freq: "Monthly" | "Yearly") => void;
  rateUnit: "SqMeter" | "SqFeet";
  zoneDescriptions: IZoneDescription[];
  allZones: IZoneDescription[];
  rateCategories: RateCategory[];
  assessmentYears: ISelectOption[];
  zoneOptions: ISelectOption[];
  useGroupOptions: ISelectOption[];
  showCopyRateSection?: boolean;
  showMultipliersSection?: boolean;
  paginatedZonesData?: {
    items: IZoneDescription[];
    totalPages: number;
    totalCount: number;
    pageNumber: number;
    pageSize: number;
  };
  initialExistingRatesCheck?: boolean;
}

export function useRateMasterFormState({
  mode,
  id,
  editData,
  bulkEditData,
  backendRates,
  fetchedBackendRates,
  filterValues,
  selectedZone,
  selectedUseGroup,
  assessmentYear,
  setSelectedZone,
  setSelectedUseGroup,
  setAssessmentYear,
  setRateFrequency,
  rateUnit,
  zoneDescriptions,
  allZones,
  rateCategories,
  assessmentYears,
  zoneOptions,
  useGroupOptions,
  showCopyRateSection,
  showMultipliersSection,
  paginatedZonesData,
  initialExistingRatesCheck,
}: UseRateMasterFormStateProps) {
  const {
    matrixPageNumber,
    matrixPageSize,
    matrixTotalPages,
    matrixTotalCount,
    paginatedZoneDescriptions,
    handleMatrixPaginationChange,
  } = useRatePagination({ paginatedZonesData, zoneDescriptions });

  const {
    errors,
    setErrors,
    existingRateFound,
    setExistingRateFound,
    isCheckingRates,
    setIsCheckingRates,
    allFiltersSelected,
  } = useRateValidation({ selectedZone, selectedUseGroup, assessmentYear, initialExistingRatesCheck });

  const shouldShowMatrix = (!!editData || !!bulkEditData || (mode === 'add' && !!filterValues?.zone && !!filterValues?.useGroup));
  const [showMatrix, setShowMatrix] = useState(shouldShowMatrix);
  const [allZoneEdits, setAllZoneEdits] = useState<Record<string, Record<string, number>>>({});
  const allZoneEditsInitializedRef = useRef(false);
  const matrixStorageKey = `rateMatrix_${selectedZone}_${selectedUseGroup}_${id || 'add'}`;

  const defaultMatrixData = useMatrixDataBuilder({
    mode,
    id,
    editData,
    bulkEditData,
    paginatedZoneDescriptions,
    zoneDescriptions,
    rateCategories,
    matrixStorageKey,
    allZoneEdits,
  });

  const [matrixData, setMatrixData] = useState(defaultMatrixData);

  const {
    filledRatesCount,
    totalPossibleRates,
    completionPercentage,
    zoneRemarksMap,
    buildCompleteMatrixForSubmission,
  } = useMatrixState({
    allZones,
    rateCategories,
    paginatedZoneDescriptions,
    allZoneEdits,
  });

  useMatrixDataSync({
    mode,
    backendRates,
    fetchedBackendRates,
    selectedZone,
    selectedUseGroup,
    assessmentYear,
    rateUnit,
    paginatedZoneDescriptions,
    zoneDescriptions,
    rateCategories,
    defaultMatrixData,
    matrixData,
    setMatrixData,
    setShowMatrix,
    setRateFrequency,
    setAllZoneEdits,
    allZoneEditsInitializedRef,
  });

  useFormInitialization({
    mode,
    id,
    editData,
    bulkEditData,
    filterValues,
    backendRates,
    assessmentYears,
    zoneOptions,
    useGroupOptions,
    showCopyRateSection,
    showMultipliersSection,
    setSelectedZone,
    setSelectedUseGroup,
    setAssessmentYear,
    setShowMatrix,
  });

  useSessionStorageManager({
    matrixStorageKey,
    matrixData,
  });

  return {
    showMatrix,
    setShowMatrix,
    matrixData,
    setMatrixData,
    matrixPageNumber,
    matrixPageSize,
    matrixTotalPages,
    matrixTotalCount,
    paginatedZoneDescriptions,
    allZoneEdits,
    setAllZoneEdits,
    existingRateFound,
    setExistingRateFound,
    isCheckingRates,
    setIsCheckingRates,
    allFiltersSelected,
    errors,
    setErrors,
    zoneRemarksMap,
    filledRatesCount,
    totalPossibleRates,
    completionPercentage,
    matrixStorageKey,
    handleMatrixPaginationChange,
    buildCompleteMatrixForSubmission,
  };
}
