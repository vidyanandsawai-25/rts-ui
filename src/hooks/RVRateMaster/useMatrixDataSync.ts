import { useEffect } from "react";
import type { IBackendRateMaster, IZoneDescription, RateCategory } from "@/types/RVRateMaster";
import type { MatrixRow } from "./useMatrixState";

interface MatrixDataSyncProps {
  mode: "edit" | "delete" | "add";
  backendRates?: IBackendRateMaster[] | null;
  fetchedBackendRates: IBackendRateMaster[];
  selectedZone: string;
  selectedUseGroup: string;
  assessmentYear: string;
  rateUnit: "SqMeter" | "SqFeet";
  paginatedZoneDescriptions: IZoneDescription[];
  zoneDescriptions: IZoneDescription[];
  rateCategories: RateCategory[];
  defaultMatrixData: MatrixRow[];
  matrixData: MatrixRow[];
  setMatrixData: (data: MatrixRow[]) => void;
  setShowMatrix: (show: boolean) => void;
  setRateFrequency: (freq: "Monthly" | "Yearly") => void;
  setAllZoneEdits: (edits: Record<string, Record<string, number>>) => void;
  allZoneEditsInitializedRef: React.MutableRefObject<boolean>;
}

/**
 * Hook to sync matrix data with backend rates and handle data transformations
 */
export function useMatrixDataSync({
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
}: MatrixDataSyncProps) {
  
  // Sync matrixData with defaultMatrixData when pagination changes
  useEffect(() => {
    if (defaultMatrixData.length > 0) {
      setMatrixData(defaultMatrixData);
    }
  }, [defaultMatrixData, setMatrixData]);

  // Process backendRates prop to populate matrix data (edit/delete mode)
  useEffect(() => {
    const isEditMode = mode === 'edit' || mode === 'delete';
    if (!isEditMode) return;
    
    if (!selectedZone || !selectedUseGroup || !assessmentYear) {
      setMatrixData(defaultMatrixData);
      setShowMatrix(false);
      return;
    }
    
    const ratesToUse = (backendRates?.length) ? backendRates : fetchedBackendRates;
    setShowMatrix(true);
    
    if (ratesToUse?.length) {
      const hasMonthly = ratesToUse.some(r => r.rateRemark === "MonthWise Rate");
      const hasYearWise = ratesToUse.some(r => r.rateRemark === "YearWise Rate");
      setRateFrequency(hasMonthly && !hasYearWise ? "Monthly" : "Yearly");

      const activeZones = paginatedZoneDescriptions.length > 0 ? paginatedZoneDescriptions : zoneDescriptions;
      const updatedMatrix = activeZones.map((z, idx) => {
        const zoneRates = ratesToUse.filter(row => row.taxZoneId === z.taxZoneId || String(row.taxZoneId) === z.zoneNo);
        const rateValues: Record<string, number> = {};
        zoneRates.forEach(rate => {
          const constructionKey = String(rate.constructionTypeId);
          // Use rate value based on selected rate unit
          const rateValue = rateUnit === 'SqFeet' ? rate.rateSquareFeet : rate.rateSquareMeter;
          if (rateValue !== undefined) {
            rateValues[constructionKey] = rateValue;
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
  }, [fetchedBackendRates, backendRates, selectedZone, selectedUseGroup, assessmentYear, rateUnit, mode, paginatedZoneDescriptions, zoneDescriptions, rateCategories, defaultMatrixData, setMatrixData, setShowMatrix, setRateFrequency]);

  // Reset initialization flag when filters change
  useEffect(() => {
    allZoneEditsInitializedRef.current = false;
    setAllZoneEdits({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZone, selectedUseGroup, assessmentYear, backendRates, setAllZoneEdits]);

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
            if (value > 0) zoneEdits[key] = value;
          });
          if (Object.keys(zoneEdits).length > 0) initialEdits[zoneNo] = zoneEdits;
        }
      });
      setAllZoneEdits(initialEdits);
      allZoneEditsInitializedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matrixData, mode, rateCategories, setAllZoneEdits]);
}
