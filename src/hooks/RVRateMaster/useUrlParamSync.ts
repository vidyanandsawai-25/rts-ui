import { useEffect } from "react";

interface UrlParamSyncProps {
  selectedZone: string;
  selectedUseGroup: string;
  assessmentYear: string;
  copySectionsExpanded: boolean;
  showMultipliersInline: boolean;
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
}: UrlParamSyncProps) {
  
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedZone && selectedUseGroup && assessmentYear) {
      const params = new URLSearchParams(window.location.search);
      params.set('zone', selectedZone);
      params.set('useGroup', selectedUseGroup);
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
  }, [selectedZone, selectedUseGroup, assessmentYear, copySectionsExpanded, showMultipliersInline]);
}
