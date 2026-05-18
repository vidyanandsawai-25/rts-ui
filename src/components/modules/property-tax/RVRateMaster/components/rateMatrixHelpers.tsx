import { MapPin } from "lucide-react";
import type { RateCategory } from "@/types/RVRateMaster";

type MatrixRow = {
  id: number;
  zone?: string;
  zoneNo?: string;
  taxZoneId?: number;
  [key: string]: number | string | undefined;
};

/**
 * Build matrix columns from rate categories
 */
export function buildMatrixColumns(
  rateCategories: RateCategory[],
  singleColorClassHeader: string,
  tCommon: ReturnType<typeof import("next-intl").useTranslations>
) {
  // Filter out zone columns
  const filteredCategories = rateCategories.filter(cat =>
    !["zoneno", "zonedescription", "zone_no", "zone description", "zone_description"]
      .includes(cat.constructionId?.toLowerCase?.())
  );

  return filteredCategories.map((cat) => {
    const code = (cat.constructionCode || cat.constructionId).trim().toUpperCase();
    return {
      id: cat.constructionCode || cat.constructionId,
      label: (
        <span className={`inline-block font-bold rounded-lg px-2 py-0.5 ${singleColorClassHeader}`}>
          {code} <span className="text-[10px] font-normal">{tCommon('rateUnit')}</span>
        </span>
      ),
      tooltip: cat.description || cat.constructionId,
      headerClassName: `${singleColorClassHeader} font-bold text-xs text-center rounded-lg`,
    };
  });
}

/**
 * Build matrix meta columns (zone column)
 */
export function buildMatrixMetaColumns(
  t: ReturnType<typeof import("next-intl").useTranslations>
) {
  return [
    {
      id: "zoneNo",
      label: (
        <span className="inline-flex items-center gap-0.5 text-[11px] md:text-[12px] font-bold text-blue-700 whitespace-nowrap">
          <MapPin size={11} />
          {t('columns.taxZoneNo')}
        </span>
      ),
      width: "70px"
    },
  ];
}

/**
 * Build matrix rows from data
 */
export function buildMatrixRows(
  matrixData: MatrixRow[],
  filteredCategories: RateCategory[],
  zoneRemarksMap: Map<string, string>
) {
  return matrixData.map((row) => {
    const cells: Record<string, string | number> = Object.fromEntries(
      filteredCategories.map(cat => {
        const key = cat.constructionCode || cat.constructionId;
        const value = row[key];
        return [key, typeof value === 'number' ? value : String(value ?? '')];
      })
    );
    return {
      id: String(row.id),
      cells,
      meta: {
        zoneNo: row.zoneNo ?? (row as unknown as { zone?: string }).zone ?? '',
        zoneNo_tooltip: zoneRemarksMap.get((row.zoneNo ?? (row as unknown as { zone?: string }).zone ?? '') as string) || '',
      },
    };
  });
}

/**
 * Build category color map
 */
export function buildCategoryColorMap(rateCategories: RateCategory[], singleColorClass: string) {
  const categoryColorMap: Record<string, string> = {};
  rateCategories.forEach((cat) => {
    if (cat && cat.constructionId) {
      const key = (cat.constructionCode || cat.constructionId).trim().toUpperCase();
      categoryColorMap[key] = singleColorClass;
    }
  });
  return categoryColorMap;
}

/**
 * Filter out zone columns from rate categories
 */
export function filterRateCategories(rateCategories: RateCategory[]) {
  return rateCategories.filter(cat =>
    !["zoneno", "zonedescription", "zone_no", "zone description", "zone_description"]
      .includes(cat.constructionId?.toLowerCase?.())
  );
}
