import type { IBackendRateMaster, IZoneDescription, RateCategory, IRateMaster } from "@/types/RVRateMaster";

/**
 * Build URLSearchParams for rate API queries
 */
export function buildRateQueryParams(
  pageNumber: number,
  pageSize: number,
  filters?: {
    rateSection?: string;
    useGroup?: string;
    assessmentYear?: string;
    taxZoneIds?: number[];
  }
): URLSearchParams {
  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });

  if (!filters) return params;

  const { rateSection, useGroup, assessmentYear, taxZoneIds } = filters;

  if (rateSection && rateSection !== "ALL" && rateSection !== "undefined" && !isNaN(Number(rateSection))) {
    params.append('RateSectionId', rateSection);
  }
  if (useGroup && useGroup !== "ALL" && useGroup !== "undefined" && !isNaN(Number(useGroup))) {
    params.append('TypeOfUseGroupId', useGroup);
  }
  if (assessmentYear && assessmentYear !== "ALL" && assessmentYear !== "undefined" && !isNaN(Number(assessmentYear))) {
    params.append('YearRangeRVId', assessmentYear);
  }
  if (taxZoneIds && taxZoneIds.length > 0) {
    params.append('TaxZoneIds', taxZoneIds.join(','));
  }

  return params;
}

/**
 * Extract value from string or object with value property
 */
export function extractValue(val?: string | { value: string }): string {
  if (!val) return '';
  if (typeof val === 'object' && val && 'value' in val) return val.value || '';
  return typeof val === 'string' ? val : '';
}

/**
 * Transform backend rate data to grouped IRateMaster format
 */
export function transformBackendRatesToMatrix(
  backendData: IBackendRateMaster[],
  constructionTypes: RateCategory[],
  zoneDescriptions: IZoneDescription[]
): IRateMaster[] {
  const taxZoneIdToNo = new Map(zoneDescriptions.map(z => [z.taxZoneId, String(z.zoneNo).trim()]));
  const groupedData = new Map<string, IRateMaster>();

  backendData.forEach((item) => {
    try {
      const taxZoneId = item.taxZoneId;
      const taxZoneNo = String(taxZoneIdToNo.get(taxZoneId) || item.taxZoneNo || taxZoneId).trim();
      const typeOfUseGroupId = String(item.typeOfUseGroupId);
      const rateSectionId = item.rateSectionId;
      const rateSectionNo = item.rateSectionNo || String(rateSectionId);
      const yearRangeRVId = item.yearRangeRVId ?? item.yearRangeId;
      const key = taxZoneNo;

      if (!groupedData.has(key)) {
        const initialRates = constructionTypes.map(ct => ({
          rateCategory: ct.constructionCode || ct.constructionId,
          ratePerSqMtr: null
        }));

        groupedData.set(key, {
          id: String(item.id),
          rateSection: rateSectionNo,
          zoneNo: taxZoneNo,
          useGroup: typeOfUseGroupId,
          assessmentYear: `${yearRangeRVId}`,
          rates: initialRates,
        });
      }

      const group = groupedData.get(key);
      if (group) {
        const constructionTypeId = Number(item.constructionTypeId);
        const construction = constructionTypes.find(ct => Number(ct.constructionId) === constructionTypeId);

        if (construction) {
          const constructionCode = construction.constructionCode || construction.constructionId;
          const rateIndex = group.rates.findIndex(r => r.rateCategory === constructionCode);

          if (rateIndex !== -1) {
            const existingRate = group.rates[rateIndex].ratePerSqMtr;
            const newRate = item.rateSquareMeter;
            group.rates[rateIndex].ratePerSqMtr = existingRate && existingRate !== 0 ? existingRate : newRate;
            group.rates[rateIndex].id = item.id;
          }
        }
      }
    } catch (_err) {
      // Skip invalid items
    }
  });

  return Array.from(groupedData.values());
}

/**
 * Filter matrix data by rate section
 */
export function filterByRateSection(
  data: IRateMaster[],
  rateSectionStr: string
): IRateMaster[] {
  if (!rateSectionStr || rateSectionStr === "ALL" || rateSectionStr === "undefined") {
    return data;
  }

  const firstSection = data[0]?.rateSection;
  if (!isNaN(Number(rateSectionStr)) && rateSectionStr.trim() !== "" && !isNaN(Number(firstSection))) {
    const selectedRateSectionId = Number(rateSectionStr);
    return data.filter(row => Number(row.rateSection) === selectedRateSectionId);
  }
  
  return data.filter(row => String(row.rateSection) === String(rateSectionStr));
}

/**
 * Filter matrix data by tax zone IDs
 */
export function filterByTaxZoneIds(
  data: IRateMaster[],
  taxZoneIds: number[] | undefined,
  zoneDescriptions: IZoneDescription[]
): IRateMaster[] {
  if (!taxZoneIds || taxZoneIds.length === 0) {
    return data;
  }

  const zoneNoSet = new Set(taxZoneIds.map(id => {
    const zoneNo = zoneDescriptions.find(z => z.taxZoneId === id)?.zoneNo;
    return zoneNo || String(id);
  }));

  return data.filter(row => 
    zoneNoSet.has(row.zoneNo) || zoneNoSet.has(row.rateSection || '')
  );
}
