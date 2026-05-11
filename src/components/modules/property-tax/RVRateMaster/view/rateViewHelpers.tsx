import type { RateCategory, MatrixColumn, IRateMaster, IRateValue } from "@/types/RVRateMaster";

/**
 * Filter table data based on selected filters
 */
export function filterTableData(
  rateMasterData: IRateMaster[],
  selectedZone: string,
  selectedYear: string,
  selectedUseGroup: string | undefined,
  isPaginationEnabled: boolean
): IRateMaster[] {
  if (isPaginationEnabled) {
    return rateMasterData;
  }
  return rateMasterData.filter((row) => {
    // Use rateSection if present, fallback to zoneSection for zone filtering
    if (selectedZone !== "ALL" && (row.rateSection ?? row.zoneSection) !== selectedZone) return false;
    if (selectedYear !== "ALL" && row.assessmentYear !== selectedYear) return false;
    if (selectedUseGroup !== "ALL" && row.useGroup !== selectedUseGroup) return false;
    return true;
  });
}

/**
 * Count configured rates in filtered data
 */
export function countConfiguredRates(filteredData: IRateMaster[]): number {
  return filteredData.reduce((count, row) => {
    const filledRates = row.rates?.filter((r: IRateValue) => r.ratePerSqMtr != null && r.ratePerSqMtr > 0).length || 0;
    return count + filledRates;
  }, 0);
}

/**
 * Build category color map
 */
export function buildCategoryColorMap(
  rateCategories: (string | RateCategory)[],
  singleColorClass: string
): Record<string, string> {
  const map: Record<string, string> = {};
  rateCategories.forEach((cat) => {
    const catCode = typeof cat === 'string' ? cat : (cat.constructionCode || cat.constructionId);
    map[catCode.toUpperCase()] = singleColorClass;
  });
  return map;
}

/**
 * Build matrix columns from rate categories
 */
export function buildRateColumns(
  rateCategories: (string | RateCategory)[],
  singleColorClassHeader: string,
  tCommon: ReturnType<typeof import("next-intl").useTranslations>
): MatrixColumn[] {
  const seenCodes = new Set<string>();
  return rateCategories
    .map((cat) => {
      const catCode = typeof cat === 'string' ? cat : (cat.constructionCode || cat.constructionId);
      const description = typeof cat !== 'string' ? cat.description : undefined;
      const normalizedCode = catCode.trim().toUpperCase();
      if (seenCodes.has(normalizedCode)) return null;
      seenCodes.add(normalizedCode);
      return {
        id: catCode,
        label: (
          <span className={`inline-block font-bold rounded-lg px-2 py-0.5 ${singleColorClassHeader}`}>
            {normalizedCode} <span className="text-[10px] font-normal">{tCommon('rateUnit')}</span>
          </span>
        ) as React.ReactNode,
        tooltip: description,
        headerClassName: `${singleColorClassHeader} font-bold text-xs text-center rounded-lg`
      } as MatrixColumn;
    })
    .filter((col): col is MatrixColumn => col !== null);
}
