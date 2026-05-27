import { toast } from "sonner";
import { getDetailedRatesAction } from "@/app/[locale]/property-tax/rate-master/rvratemaster/action";
import type { ISelectOption, RateCategory } from "@/types/RVRateMaster";

/**
 * Escape CSV value for proper formatting
 */
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

interface RateData {
  rateSection?: string;
  taxZone?: string;
  typeOfUseGroup?: string;
  yearRangeRV?: string;
  constructionType?: string;
  constructionCode?: string;
  constructionTypeCode?: string;
  constructionTypeId?: number | string;
  rateSquareMeter?: number;
  rateSquareFeet?: number;
  rateRemark?: string;
}

interface GroupedGrid {
  yearRange: string;
  useGroup: string;
  taxZones: string[];
  constructionTypes: string[];
  rateData: Map<string, Map<string, number>>;
}

/**
 * Group rates by year range and use group, then organize into grid format
 */
function groupRatesIntoGrids(
  rates: RateData[],
  rateCategories: (string | RateCategory)[]
): GroupedGrid[] {
  // First, group by (yearRange, useGroup) combination
  const combinationMap = new Map<string, RateData[]>();
  
  rates.forEach(rate => {
    const key = `${rate.yearRangeRV || ''}|${rate.typeOfUseGroup || ''}`;
    if (!combinationMap.has(key)) {
      combinationMap.set(key, []);
    }
    combinationMap.get(key)!.push(rate);
  });

  // Build ordered construction type list and create mapping
  const orderedConstructionTypes: string[] = [];
  const constructionTypeMap = new Map<string, string>(); // Maps backend value to display code
  
  rateCategories.forEach(cat => {
    const displayCode = typeof cat === 'string' ? cat : (cat.constructionCode || cat.constructionId);
    orderedConstructionTypes.push(displayCode);
    
    // Map various identifiers to the display code
    if (typeof cat !== 'string') {
      if (cat.constructionId) constructionTypeMap.set(cat.constructionId, displayCode);
      if (cat.constructionCode) constructionTypeMap.set(cat.constructionCode, displayCode);
      if (cat.description) constructionTypeMap.set(cat.description, displayCode);
    }
    constructionTypeMap.set(displayCode, displayCode);
  });

  // Convert to grid format
  const grids: GroupedGrid[] = [];
  
  combinationMap.forEach((groupRates, key) => {
    const [yearRange, useGroup] = key.split('|');
    
    // Collect unique tax zones and construction types for this group
    const taxZonesSet = new Set<string>();
    const constructionTypesInData = new Set<string>();
    const rateDataMap = new Map<string, Map<string, number>>();
    
    groupRates.forEach(rate => {
      const taxZone = rate.taxZone || '';
      const backendConstructionType = rate.constructionType || 
                                     rate.constructionCode || 
                                     rate.constructionTypeCode || 
                                     (rate.constructionTypeId ? String(rate.constructionTypeId) : '');
      const rateValue = rate.rateSquareMeter || 0;
      
      // Map backend construction type to display code
      const displayConstructionType = constructionTypeMap.get(backendConstructionType) || backendConstructionType;
      
      if (taxZone) taxZonesSet.add(taxZone);
      if (displayConstructionType) constructionTypesInData.add(displayConstructionType);
      
      // Store rate: taxZone -> constructionType -> rate
      if (!rateDataMap.has(taxZone)) {
        rateDataMap.set(taxZone, new Map());
      }
      rateDataMap.get(taxZone)!.set(displayConstructionType, rateValue);
    });
    
    // Sort tax zones numerically
    const taxZones = Array.from(taxZonesSet).sort((a, b) => {
      const numA = parseInt(a) || 0;
      const numB = parseInt(b) || 0;
      return numA - numB;
    });
    
    // Use all construction types from rateCategories that have data, in order
    const constructionTypes = orderedConstructionTypes.filter(ct => 
      constructionTypesInData.has(ct)
    );
    
    // Debug logging
    console.log(`Grid for ${yearRange} - ${useGroup}:`, {
      constructionTypesInData: Array.from(constructionTypesInData),
      filteredConstructionTypes: constructionTypes,
      orderedConstructionTypes
    });
    
    grids.push({
      yearRange,
      useGroup,
      taxZones,
      constructionTypes,
      rateData: rateDataMap
    });
  });
  
  // Sort grids by year range and use group
  grids.sort((a, b) => {
    const yearCompare = a.yearRange.localeCompare(b.yearRange);
    return yearCompare !== 0 ? yearCompare : a.useGroup.localeCompare(b.useGroup);
  });
  
  return grids;
}

/**
 * Convert grids to CSV format with each grid stacked vertically
 */
function gridsToCSV(
  grids: GroupedGrid[], 
  rateSection: string,
  t: ReturnType<typeof import("next-intl").useTranslations>
): string {
  const csvLines: string[] = [];
  
  grids.forEach((grid, index) => {
    // Add blank line separator between grids (except before first grid)
    if (index > 0) {
      csvLines.push('');
      csvLines.push('');
    }
    
    // Add column headers: Rate Section, Assessment Year Range, Use Group, Tax Zone No, then all construction types
    const headerRow = [
      escapeCsvValue(t('downloadHeaders.rateSection')),
      escapeCsvValue(t('downloadHeaders.assessmentYearRange')),
      escapeCsvValue(t('downloadHeaders.useGroup')),
      escapeCsvValue(t('downloadHeaders.taxZoneNo')),
      ...grid.constructionTypes.map(ct => {
        const label = `${ct} (${t('downloadHeaders.rateSqMtr')})`;
        return escapeCsvValue(label);
      })
    ];
    csvLines.push(headerRow.join(','));
    
    // Add data rows for each tax zone
    grid.taxZones.forEach(taxZone => {
      const row = [
        escapeCsvValue(rateSection),
        escapeCsvValue(grid.yearRange),
        escapeCsvValue(grid.useGroup),
        escapeCsvValue(taxZone)
      ];
      
      // Add rate for each construction type
      grid.constructionTypes.forEach(constructionType => {
        const rate = grid.rateData.get(taxZone)?.get(constructionType) || 0;
        row.push(escapeCsvValue(rate));
      });
      
      csvLines.push(row.join(','));
    });
  });
  
  return csvLines.join('\r\n');
}

/**
 * Download detailed rates as CSV file in grid format
 */
export async function downloadDetailedRates(
  selectedZone: string,
  zones: ISelectOption[],
  t: ReturnType<typeof import("next-intl").useTranslations>,
  rateCategories: (string | RateCategory)[]
) {
  if (!selectedZone || selectedZone === 'ALL') {
    toast.error(t('messages.selectRateSection'));
    return;
  }

  try {
    toast.loading(t('messages.downloadingRates'));
    const detailedRatesResponse = await getDetailedRatesAction(
      selectedZone, undefined, undefined, 1, -1
    );
    const allRates = ((detailedRatesResponse as { items?: unknown[] })?.items || []) as RateData[];

    if (!allRates || allRates.length === 0) {
      toast.dismiss();
      toast.error(t('messages.noRatesAvailable'));
      return;
    }

    // Debug: Log first rate to see structure
    if (allRates.length > 0) {
      console.log('Sample rate data:', allRates[0]);
      console.log('Rate categories:', rateCategories);
    }

    // Get rate section name for header
    const zoneName = zones.find(z => z.value === selectedZone)?.label || selectedZone;
    
    // Group rates into grids with proper ordering
    const grids = groupRatesIntoGrids(allRates, rateCategories);
    
    // Convert grids to CSV with translations
    const csvContent = gridsToCSV(grids, zoneName, t);

    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fileName = `Rate_Master_${zoneName}_AllUseGroups_AllYears_Grid_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.dismiss();
    toast.success(t('messages.ratesDownloaded'));
  } catch (_error) {
    toast.dismiss();
    toast.error(t('messages.downloadFailed'));
  }
}
