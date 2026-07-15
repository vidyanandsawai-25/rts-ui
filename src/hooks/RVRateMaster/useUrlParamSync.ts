import { useEffect } from "react";
import type { RateCategory } from "@/types/RVRateMaster";

interface UrlParamSyncProps {
  selectedZone: string;
  selectedUseGroup: string;
  assessmentYear: string;
  copySectionsExpanded: boolean;
  showMultipliersInline: boolean;
  isOpenPlot?: boolean;
  rateCategories?: RateCategory[];
}

/**
 * Hook to sync form state with URL parameters
 */
export function useUrlParamSync({
  selectedZone,
  selectedUseGroup,
  assessmentYear,
  copySectionsExpanded,
  showMultipliersInline,
  isOpenPlot = false,
  rateCategories,
}: UrlParamSyncProps) {
  
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedZone && selectedUseGroup && assessmentYear) {
      const params = new URLSearchParams(window.location.search);
      params.set('zone', selectedZone);
      
      if (isOpenPlot && rateCategories && rateCategories.length > 0) {
        const useGroupIds = rateCategories
          .map(c => c.typeOfUseGroupId)
          .filter((id): id is number => id !== undefined && id !== null && id > 0);
        const uniqueIds = Array.from(new Set(useGroupIds)).sort((a, b) => a - b);
        if (uniqueIds.length > 0) {
          params.set('useGroup', uniqueIds.join(','));
        } else {
          params.set('useGroup', 'ALL');
        }
      } else {
        params.set('useGroup', selectedUseGroup);
      }
      
      params.set('assessmentYear', assessmentYear);
      if (copySectionsExpanded) {
        params.set('showCopyRates', 'true');
      } else {
        params.delete('showCopyRates');
      }
      if (showMultipliersInline) {
        params.set('showMultipliers', 'true');
      } else {
        params.delete('showMultipliers');
      }
      const currentPath = window.location.pathname;
      const newUrl = `${currentPath}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [selectedZone, selectedUseGroup, assessmentYear, copySectionsExpanded, showMultipliersInline, isOpenPlot, rateCategories]);
}
