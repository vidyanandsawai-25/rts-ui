import { useMemo } from "react";
import type { IRateMaster, IRateValue, IZoneDescription, RateCategory } from "@/types/RVRateMaster";
import type { MatrixRow } from "./useMatrixState";

interface MatrixDataBuilderProps {
  mode: "edit" | "delete" | "add";
  id?: string | null;
  editData?: IRateMaster | null;
  bulkEditData?: IRateMaster[] | null;
  paginatedZoneDescriptions: IZoneDescription[];
  zoneDescriptions: IZoneDescription[];
  rateCategories: RateCategory[];
  matrixStorageKey: string;
  allZoneEdits: Record<string, Record<string, number>>;
}

/**
 * Hook to build default matrix data from various sources
 */
export function useMatrixDataBuilder({
  mode,
  id,
  editData,
  bulkEditData,
  paginatedZoneDescriptions,
  zoneDescriptions,
  rateCategories,
  matrixStorageKey,
  allZoneEdits,
}: MatrixDataBuilderProps): MatrixRow[] {

  return useMemo(() => {
    const activeZones = paginatedZoneDescriptions || zoneDescriptions;

    // In add mode, always return undefined
    if (mode === 'add' && !id && !editData && !bulkEditData) {
      return activeZones.map((z, idx) => {
        const baseData = {
          id: idx + 1,
          zoneNo: z.zoneNo,
          taxZoneId: z.taxZoneId,
          ...rateCategories
            .filter(cat => cat.constructionId !== "zoneNo" && cat.constructionId !== "zoneDescription")
            .reduce((acc, cat) => ({ ...acc, [cat.constructionCode || cat.constructionId]: undefined }), {} as Record<string, number | undefined>),
        };
        const edits = allZoneEdits[z.zoneNo] || {};
        return { ...baseData, ...edits };
      });
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
        } catch (_e) {
          // Failed to parse stored matrix data
        }
      }
    }

    // Create from editData/bulkEditData
    return activeZones.map((z, idx) => {
      const rateValues: Record<string, number | undefined> = {};
      if (bulkEditData?.length) {
        bulkEditData.forEach((data: IRateMaster) => {
          if (data.zoneNo === z.zoneNo) {
            data.rates?.forEach((rate: IRateValue) => {
              rateValues[rate.rateCategory] = rate.ratePerSqMtr ?? undefined;
            });
          }
        });
      } else if (editData && editData.zoneNo === z.zoneNo) {
        editData.rates?.forEach((rate: IRateValue) => {
          rateValues[rate.rateCategory] = rate.ratePerSqMtr ?? undefined;
        });
      }
      const baseData = {
        id: idx + 1,
        zoneNo: z.zoneNo,
        taxZoneId: z.taxZoneId,
        ...rateCategories.reduce(
          (acc, cat) => {
            const key = cat.constructionCode || cat.constructionId;
            return { ...acc, [key]: rateValues[key] };
          },
          {} as Record<string, number | undefined>
        ),
      };
      const edits = allZoneEdits[z.zoneNo] || {};
      return { ...baseData, ...edits };
    });
  }, [mode, id, editData, bulkEditData, paginatedZoneDescriptions, zoneDescriptions, rateCategories, matrixStorageKey, allZoneEdits]);
}
