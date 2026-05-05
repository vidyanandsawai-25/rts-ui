import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import type { 
  IBackendRateMaster, 
  IRateMaster, 
  IRateValue, 
  ISelectOption, 
  IZoneDescription, 
  RateCategory 
} from "@/types/RVRateMaster";

type MatrixRow = {
  id: number;
  zone?: string;
  zoneNo?: string;
  taxZoneId?: number;
  [key: string]: number | string | undefined;
};

interface UseRateMasterFormStateProps {
  mode: "edit" | "delete" | "add";
  id?: string | null;
  editData?: IRateMaster | null;
  bulkEditData?: IRateMaster[] | null;
  backendRates?: IBackendRateMaster[] | null;
  fetchedBackendRates: IBackendRateMaster[];
  filterValues?: {
    zone: string;
    year: string;
    useGroup: string;
  };
  selectedZone: string;
  selectedUseGroup: string;
  assessmentYear: string;
  setSelectedZone: (zone: string) => void;
  setSelectedUseGroup: (useGroup: string) => void;
  setAssessmentYear: (year: string) => void;
  rateFrequency: string;
  setRateFrequency: (freq: "Monthly" | "Yearly") => void;
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
  // rateFrequency, // unused
  setRateFrequency,
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
  const router = useRouter();

  // Show matrix state
  const shouldShowMatrix = (!!editData || !!bulkEditData || (mode === 'add' && !!filterValues?.zone && !!filterValues?.useGroup));
  const [showMatrix, setShowMatrix] = useState(shouldShowMatrix);

  // Pagination state for matrix grid
  const [matrixPageNumber, setMatrixPageNumber] = useState(paginatedZonesData?.pageNumber ?? 1);
  const [matrixPageSize, setMatrixPageSize] = useState(paginatedZonesData?.pageSize ?? 10);
  const [matrixTotalPages, setMatrixTotalPages] = useState(paginatedZonesData?.totalPages ?? Math.ceil(zoneDescriptions.length / 10));
  const [matrixTotalCount, setMatrixTotalCount] = useState(paginatedZonesData?.totalCount ?? zoneDescriptions.length);
  const [paginatedZoneDescriptions, setPaginatedZoneDescriptions] = useState(paginatedZonesData?.items ?? zoneDescriptions.slice(0, 10));

  // Track edits across all pages (keyed by zoneNo)
  const [allZoneEdits, setAllZoneEdits] = useState<Record<string, Record<string, number>>>({});
  const allZoneEditsInitializedRef = useRef(false);

  // State for tracking existing rates
  const [existingRateFound, setExistingRateFound] = useState(initialExistingRatesCheck ?? false);
  const [isCheckingRates, setIsCheckingRates] = useState(false);
  const allFiltersSelected = !!selectedZone && !!selectedUseGroup && !!assessmentYear;

  const [errors, setErrors] = useState({
    zone: "",
    useGroup: "",
    assessmentYear: "",
  });

  // Storage key for persisting matrix data
  const matrixStorageKey = `rateMatrix_${selectedZone}_${selectedUseGroup}_${id || 'add'}`;

  // Create a map of zoneNo to remark (description) for tooltips
  const zoneRemarksMap = useMemo(() => {
    const map = new Map<string, string>();
    const zones = paginatedZoneDescriptions.length > 0 ? paginatedZoneDescriptions : zoneDescriptions;
    zones.forEach(zone => {
      map.set(zone.zoneNo, zone.description || '');
    });
    return map;
  }, [paginatedZoneDescriptions, zoneDescriptions]);

  // Create default matrix dynamically using server-side zoneDescriptions
  const defaultMatrixData: MatrixRow[] = useMemo(() => {
    const activeZones = paginatedZoneDescriptions || zoneDescriptions;
    
    // In add mode, always return zeros
    if (mode === 'add' && !id && !editData && !bulkEditData) {
      const result = activeZones.map((z, idx) => {
        const baseData = {
          id: idx + 1,
          zoneNo: z.zoneNo,
          taxZoneId: z.taxZoneId,
          ...rateCategories
            .filter(cat => cat.constructionId !== "zoneNo" && cat.constructionId !== "zoneDescription")
            .reduce((acc, cat) => ({ ...acc, [cat.constructionCode || cat.constructionId]: 0 }), {} as Record<string, number>),
        };
        const edits = allZoneEdits[z.zoneNo] || {};
        const finalRow = { ...baseData, ...edits };
        return finalRow;
      });
      return result;
    }

    // Edit mode: check sessionStorage first
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(matrixStorageKey);
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            return (parsedData as MatrixRow[]).map((row, idx: number) => {
              const baseRow = {
                ...row,
                zoneNo: row.zoneNo ?? (row as unknown as { zone?: string }).zone ?? activeZones[idx]?.zoneNo ?? '',
              };
              const edits = allZoneEdits[baseRow.zoneNo as string] || {};
              return { ...baseRow, ...edits };
            });
          }
        } catch (e) {
          console.error('Failed to parse stored matrix data:', e);
        }
      }
    }

    // If no stored data, create from editData/bulkEditData
    return activeZones.map((z, idx) => {
      const rateValues: Record<string, number> = {};
      if (bulkEditData && bulkEditData.length > 0) {
        bulkEditData.forEach((data: IRateMaster) => {
          if (data.zoneNo === z.zoneNo) {
            data.rates?.forEach((rate: IRateValue) => {
              rateValues[rate.rateCategory] = rate.ratePerSqMtr ?? 0;
            });
          }
        });
      } else if (editData && editData.zoneNo === z.zoneNo) {
        editData.rates?.forEach((rate: IRateValue) => {
          rateValues[rate.rateCategory] = rate.ratePerSqMtr ?? 0;
        });
      }
      const baseData = {
        id: idx + 1,
        zoneNo: z.zoneNo,
        taxZoneId: z.taxZoneId,
        ...rateCategories.reduce(
          (acc, cat) => {
            const key = cat.constructionCode || cat.constructionId;
            return { ...acc, [key]: rateValues[key] ?? 0 };
          },
          {} as Record<string, number>
        ),
      };
      const edits = allZoneEdits[z.zoneNo] || {};
      return { ...baseData, ...edits };
    });
  }, [mode, id, editData, bulkEditData, paginatedZoneDescriptions, zoneDescriptions, rateCategories, matrixStorageKey, allZoneEdits]);

  const [matrixData, setMatrixData] = useState(defaultMatrixData);

  // Calculate the number of filled rates across ALL zones (not just current page)
  const filledRatesCount = useMemo(() => {
    let count = 0;
    allZones.forEach((zone) => {
      const zoneEdits = allZoneEdits[zone.zoneNo];
      if (zoneEdits) {
        rateCategories.forEach((cat) => {
          const key = cat.constructionCode || cat.constructionId;
          const value = zoneEdits[key];
          if (value && value > 0) {
            count++;
          }
        });
      }
    });
    return count;
  }, [allZones, allZoneEdits, rateCategories]);

  // Calculate total possible rates across ALL zones (not just current page)
  const totalPossibleRates = allZones.length * rateCategories.length;

  // Calculate completion percentage
  const completionPercentage = totalPossibleRates > 0 
    ? Math.round((filledRatesCount / totalPossibleRates) * 100) 
    : 0;

  // Sync matrixData with defaultMatrixData when pagination changes or when allZoneEdits updates
  useEffect(() => {
    if (defaultMatrixData.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional state sync from derived data
      setMatrixData(defaultMatrixData);
    }
  }, [defaultMatrixData]);

  // On mount and when options change, set dropdowns from URL query params (only in add mode)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (mode === 'edit' || mode === 'delete') return;
    
    const params = new URLSearchParams(window.location.search);
    const zone = params.get("zone");
    const useGroup = params.get("useGroup");
    const assessmentYear = params.get("assessmentYear");
    if (zone) setSelectedZone(zone);
    if (useGroup) setSelectedUseGroup(useGroup);
    if (assessmentYear) setAssessmentYear(assessmentYear);
  }, [mode, setSelectedZone, setSelectedUseGroup, setAssessmentYear]);

  // Sync state with filterValues or URL query params when they change or on mount
  useEffect(() => {
    let urlAssessmentYear = "";
    let urlZone = "";
    let urlUseGroup = "";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      urlAssessmentYear = params.get("assessmentYear") || "";
      urlZone = params.get("zone") || "";
      urlUseGroup = params.get("useGroup") || "";
    }
    
    if (mode === 'edit' || mode === 'delete') {
      if (urlZone) {
        setSelectedZone(urlZone);
      } else if (filterValues?.zone) {
        setSelectedZone(filterValues.zone);
      } else if (zoneOptions && zoneOptions.length > 0) {
        setSelectedZone(zoneOptions[0].value);
      }

      if (urlUseGroup) {
        setSelectedUseGroup(urlUseGroup);
      } else if (filterValues?.useGroup) {
        setSelectedUseGroup(filterValues.useGroup);
      } else if (useGroupOptions && useGroupOptions.length > 0) {
        setSelectedUseGroup(useGroupOptions[0].value);
      }

      if (urlAssessmentYear) {
        setAssessmentYear(urlAssessmentYear);
      } else if (filterValues?.year) {
        const foundAssessment = assessmentYears?.find(y => String(y.value) === String(filterValues.year));
        setAssessmentYear(foundAssessment ? foundAssessment.value : filterValues.year);
      } else if (assessmentYears && assessmentYears.length > 0) {
        setAssessmentYear(assessmentYears[0].value);
      }
    } else {
      if (urlZone) {
        setSelectedZone(urlZone);
      } else if (filterValues?.zone) {
        setSelectedZone(filterValues.zone);
      }
      
      if (urlUseGroup) {
        setSelectedUseGroup(urlUseGroup);
      } else if (filterValues?.useGroup) {
        setSelectedUseGroup(filterValues.useGroup);
      }
      
      if (urlAssessmentYear) {
        setAssessmentYear(urlAssessmentYear);
      } else if (filterValues?.year) {
        const foundAssessment = assessmentYears?.find(y => String(y.value) === String(filterValues.year));
        setAssessmentYear(foundAssessment ? foundAssessment.value : filterValues.year);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setSelectedZone, setSelectedUseGroup, setAssessmentYear are stable setState functions
  }, [filterValues, assessmentYears, zoneOptions, useGroupOptions, mode]);

  // Process backendRates prop (fetched server-side) to populate matrix data (edit/delete mode)
  useEffect(() => {
    const isEditMode = mode === 'edit' || mode === 'delete';
    if (!isEditMode) return;
    
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!selectedZone || !selectedUseGroup || !assessmentYear) {
      setMatrixData(defaultMatrixData);
      setShowMatrix(false);
      return;
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    
    // Prefer backendRates prop (from SSR) over fetchedBackendRates state
    // backendRates prop is always fresh from server, fetchedBackendRates may be stale
    const ratesToUse = (backendRates && backendRates.length > 0) ? backendRates : fetchedBackendRates;
    console.log(`✅ useRateMasterFormState: Processing rates for zone=${selectedZone}, useGroup=${selectedUseGroup}, year=${assessmentYear}, ratesCount=${ratesToUse.length}`);
    setShowMatrix(true);
    
    if (ratesToUse && Array.isArray(ratesToUse) && ratesToUse.length > 0) {
      const hasMonthly = ratesToUse.some((r: IBackendRateMaster) => r.rateRemark === "MonthWise Rate");
      const hasYearWise = ratesToUse.some((r: IBackendRateMaster) => r.rateRemark === "YearWise Rate");
      if (hasMonthly && !hasYearWise) {
        setRateFrequency("Monthly");
      } else {
        setRateFrequency("Yearly");
      }

      const activeZones = paginatedZoneDescriptions.length > 0 ? paginatedZoneDescriptions : zoneDescriptions;
      const updatedMatrix = activeZones.map((z, idx) => {
        const zoneRates = ratesToUse.filter((row: IBackendRateMaster) => {
          const taxZoneId = row.taxZoneId ?? row.TaxZoneId;
          return taxZoneId === z.taxZoneId || String(taxZoneId) === z.zoneNo;
        });
        const rateValues: { [key: string]: number } = {};
        zoneRates.forEach((rate: IBackendRateMaster) => {
          const constructionTypeId = rate.constructionTypeId ?? rate.ConstructionTypeId;
          const constructionKey = String(constructionTypeId);
          const rateSqM = rate.rateSquareMeter ?? rate.RateSquareMeter;
          if (rateSqM !== undefined) {
            rateValues[constructionKey] = rateSqM;
          }
        });
        
        return {
          id: idx + 1,
          zoneNo: z.zoneNo,
          taxZoneId: z.taxZoneId,
          ...rateCategories.reduce(
            (acc, cat) => {
              const columnKey = cat.constructionCode || cat.constructionId;
              const rateValue = rateValues[cat.constructionId] ?? 0;
              return { ...acc, [columnKey]: rateValue };
            },
            {}
          ),
        };
      });
      setMatrixData(updatedMatrix);
    } else {
      const activeZones = paginatedZoneDescriptions.length > 0 ? paginatedZoneDescriptions : zoneDescriptions;
      const zeroMatrix = activeZones.map((z, idx) => ({
        id: idx + 1,
        zoneNo: z.zoneNo,
        taxZoneId: z.taxZoneId,
        ...rateCategories.reduce((acc, cat) => ({ ...acc, [cat.constructionCode || cat.constructionId]: 0 }), {}),
      }));
      setMatrixData(zeroMatrix);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setRateFrequency and setMatrixData are stable setState functions
  }, [fetchedBackendRates, backendRates, selectedZone, selectedUseGroup, assessmentYear, mode, paginatedZoneDescriptions, zoneDescriptions, rateCategories, defaultMatrixData]);

  // Initialize allZoneEdits with existing matrixData in edit mode
  useEffect(() => {
    const isEditMode = mode === 'edit' || mode === 'delete';
    if (!isEditMode || matrixData.length === 0 || allZoneEditsInitializedRef.current) return;

    const hasNonZeroValues = matrixData.some(row =>
      rateCategories.some(cat => {
        const key = cat.constructionCode || cat.constructionId;
        return Number(row[key]) > 0;
      })
    );

    if (hasNonZeroValues) {
      const initialEdits: Record<string, Record<string, number>> = {};
      matrixData.forEach(row => {
        const zoneNo = row.zoneNo as string;
        if (zoneNo) {
          const zoneEdits: Record<string, number> = {};
          rateCategories.forEach(cat => {
            const key = cat.constructionCode || cat.constructionId;
            const value = Number(row[key]);
            if (value > 0) {
              zoneEdits[key] = value;
            }
          });
          if (Object.keys(zoneEdits).length > 0) {
            initialEdits[zoneNo] = zoneEdits;
          }
        }
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional state update from backend data
      setAllZoneEdits(initialEdits);
      allZoneEditsInitializedRef.current = true;
    }
  }, [matrixData, mode, rateCategories]);

  // Reset initialization flag when filters change or new backend data arrives
  useEffect(() => {
    allZoneEditsInitializedRef.current = false;
    // Also clear allZoneEdits when backendRates prop changes (new filter selection)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional state reset when filters change
    setAllZoneEdits({});
  }, [selectedZone, selectedUseGroup, assessmentYear, backendRates]);

  // Show multipliers section when prop is true
  useEffect(() => {
    if (showMultipliersSection) {
      const hasFilterValues = !!filterValues?.zone && !!filterValues?.useGroup;
      const isEditMode = !!id || !!editData || !!bulkEditData;
      
      if (isEditMode || hasFilterValues) {
        setShowMatrix(true); // eslint-disable-line react-hooks/set-state-in-effect
      }
    }
  }, [showMultipliersSection, id, editData, bulkEditData, filterValues?.zone, filterValues?.useGroup]);

  // Show copy section when prop is true
  useEffect(() => {
    if (showCopyRateSection) {
      const hasFilterValues = !!filterValues?.zone && !!filterValues?.useGroup;
      const isEditMode = !!id || !!editData || !!bulkEditData;
      
      /* eslint-disable react-hooks/set-state-in-effect */
      if (isEditMode && (editData || bulkEditData)) {
        setShowMatrix(true);
      } else if (hasFilterValues) {
        setShowMatrix(true);
      }
      /* eslint-enable react-hooks/set-state-in-effect */

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlAssessmentYear = params.get('assessmentYear') || '';
        if (urlAssessmentYear) {
          setAssessmentYear(urlAssessmentYear);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setAssessmentYear is a stable setState function
  }, [showCopyRateSection, id, editData, bulkEditData, assessmentYears, filterValues?.zone, filterValues?.useGroup]);

  // Populate assessmentYear from backend data on edit
  useEffect(() => {
    if (backendRates && backendRates.length > 0) {
      const yearRangeRVId = backendRates[0].yearRangeRVId || backendRates[0].yearRangeId;

      if (yearRangeRVId && assessmentYears && assessmentYears.length > 0) {
        const ayOption = assessmentYears.find(opt => String(opt.value) === String(yearRangeRVId));
        if (ayOption) setAssessmentYear(ayOption.value);
      }
    } else if (editData && editData.assessmentYear) {
      setAssessmentYear(editData.assessmentYear);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setAssessmentYear is a stable setState function
  }, [editData, backendRates, assessmentYears]);

  // Save matrix data to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && matrixData.length > 0) {
      sessionStorage.setItem(matrixStorageKey, JSON.stringify(matrixData));
    }
  }, [matrixData, matrixStorageKey]);

  // Clear sessionStorage when drawer closes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(matrixStorageKey);
      }
    };
  }, [matrixStorageKey]);

  // Sync paginated zone data from server-provided props when they change
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (paginatedZonesData) {
      setPaginatedZoneDescriptions(paginatedZonesData.items);
      setMatrixTotalPages(paginatedZonesData.totalPages);
      setMatrixTotalCount(paginatedZonesData.totalCount);
      setMatrixPageNumber(paginatedZonesData.pageNumber);
      setMatrixPageSize(paginatedZonesData.pageSize);
    }
  }, [paginatedZonesData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Handle pagination changes via URL navigation
  const handleMatrixPaginationChange = (newPageNumber: number, newPageSize: number) => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    params.set('matrixPage', String(newPageNumber));
    params.set('matrixPageSize', String(newPageSize));
    
    setMatrixPageNumber(newPageNumber);
    setMatrixPageSize(newPageSize);
    
    const pathname = window.location.pathname;
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl);
  };

  // Helper function to build complete matrix for submission
  const buildCompleteMatrixForSubmission = async (): Promise<MatrixRow[]> => {
    if (!allZones || allZones.length === 0) {
      return [];
    }
    
    const result = allZones.map((z, idx) => {
      const baseData: MatrixRow = {
        id: idx + 1,
        zoneNo: z.zoneNo,
        taxZoneId: z.taxZoneId,
        ...rateCategories
          .filter(cat => cat.constructionId !== "zoneNo" && cat.constructionId !== "zoneDescription")
          .reduce((acc, cat) => ({ ...acc, [cat.constructionCode || cat.constructionId]: 0 }), {} as Record<string, number>),
      };
      const edits = allZoneEdits[z.zoneNo] || {};
      return { ...baseData, ...edits };
    });
    
    return result;
  };

  return {
    // State
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
    // Handlers
    handleMatrixPaginationChange,
    buildCompleteMatrixForSubmission,
  };
}

// Export MatrixRow type for use in components
export type { MatrixRow };
