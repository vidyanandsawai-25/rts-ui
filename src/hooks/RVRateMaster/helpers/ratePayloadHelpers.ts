import type { IBackendRateMaster, RatePayload, RateCategory } from "@/types/RVRateMaster";

interface BuildPayloadConfig {
  selectedZone: string;
  selectedUseGroup: string;
  assessmentYear: string;
  rateFrequency: "Monthly" | "Yearly";
  rateUnit: "SqMeter" | "SqFeet";
  rateCategories: RateCategory[];
}

interface PayloadResult {
  updates: RatePayload[];
  inserts: RatePayload[];
}

/**
 * Find an existing rate in backend rates by zone, construction, use group, year, and section
 */
function findExistingRate(
  existingBackendRates: IBackendRateMaster[],
  taxZoneId: number,
  constructionId: string,
  useGroupForPayload: string,
  assessmentYear: string,
  selectedZone: string
): IBackendRateMaster | undefined {
  return existingBackendRates.find(r => {
    return (
      Number(r.taxZoneId) === taxZoneId &&
      Number(r.constructionTypeId) === Number(constructionId) &&
      Number(r.typeOfUseGroupId) === Number(useGroupForPayload) &&
      Number(r.yearRangeRVId ?? r.yearRangeId) === Number(assessmentYear) &&
      Number(r.rateSectionId) === Number(selectedZone)
    );
  });
}

/**
 * Build create/update payloads from matrix data
 */
export function buildPayloadFromMatrix(
  matrixData: Array<Record<string, unknown>>,
  existingBackendRates: IBackendRateMaster[],
  config: BuildPayloadConfig,
  targetUseGroup?: string
): PayloadResult {
  const { selectedZone, selectedUseGroup, assessmentYear, rateFrequency, rateUnit, rateCategories } = config;
  const updates: RatePayload[] = [];
  const inserts: RatePayload[] = [];
  const useGroupForPayload = targetUseGroup || selectedUseGroup;

  matrixData.forEach(row => {
    rateCategories.forEach(cat => {
      const constructionId = typeof cat === 'string' ? cat : cat.constructionId;
      if (!constructionId) return;
      
      const rowKey = typeof cat === 'string' ? cat : (cat.constructionCode || cat.constructionId);
      const val = row[rowKey];
      
      // Skip if value is invalid
      if (val === undefined || val === null || val === '' || isNaN(Number(val))) return;
      
      const zoneNoVal = String(row.zoneNo ?? row.zone ?? '');
      const taxZoneIdVal = row.taxZoneId || Number(zoneNoVal);
      const existing = findExistingRate(
        existingBackendRates,
        Number(taxZoneIdVal),
        constructionId,
        useGroupForPayload,
        assessmentYear,
        selectedZone
      );
      
      // For new rates (inserts), skip if value is 0 or negative
      // For existing rates (updates), allow 0 values, but always skip negatives
      if (Number(val) < 0) return;
      if (!existing && Number(val) === 0) return;
      
      // Calculate rate values based on selected rate unit
      // If SqMeter: entered value goes to rateSquareMeter, rateSquareFeet is calculated
      // If SqFeet: entered value goes to rateSquareFeet, rateSquareMeter is calculated
      const enteredValue = Number(val);
      const rateSquareMeterValue = rateUnit === 'SqMeter' 
        ? enteredValue 
        : Number((enteredValue / 10.7639).toFixed(2));
      const rateSquareFeetValue = rateUnit === 'SqFeet' 
        ? enteredValue 
        : Number((enteredValue * 10.7639).toFixed(2));
      
      const payload: RatePayload = {
        taxZoneId: Number(row.taxZoneId) || Number(zoneNoVal),
        constructionTypeId: Number(constructionId),
        typeOfUseGroupId: Number(useGroupForPayload),
        YearRangeRVId: Number(assessmentYear),
        rateSectionId: Number(selectedZone),
        rateSquareMeter: rateSquareMeterValue,
        rateSquareFeet: rateSquareFeetValue,
        rateRemark: rateFrequency === "Yearly" ? "YearWise Rate" : "MonthWise Rate",
        createdBy: 1,
        floorId: Number(row.floorID ?? 67),
        isActive: true,
      };
      
      const rowRates = (row as { rates?: Array<Record<string, unknown>> }).rates;
      const rateCellInRow = Array.isArray(rowRates) ? rowRates.find((r) => 
        r.rateCategory === rowKey || Number(r.constructionTypeId) === Number(constructionId)
      ) : undefined;
      const rateIdInRow = rateCellInRow?.id;
      const existingId = rateIdInRow || existing?.id;
      
      if (existingId) {
        // Compare with the appropriate original value based on rate unit
        const originalValue = rateUnit === 'SqMeter' 
          ? (existing?.rateSquareMeter ?? 0)
          : (existing?.rateSquareFeet ?? 0);
        if (enteredValue !== Number(originalValue)) {
          payload.Id = Number(existingId);
          updates.push(payload);
        }
      } else {
        inserts.push(payload);
      }
    });
  });

  return { updates, inserts };
}

/**
 * Apply multiplier to matrix data
 */
export function applyMultiplierToMatrix(
  matrixData: Array<Record<string, unknown>>,
  multiplier: number,
  rateCategories: RateCategory[]
): Array<Record<string, unknown>> {
  if (multiplier === 1.0 || multiplier <= 0) {
    return matrixData;
  }
  
  return matrixData.map(row => {
    const multipliedRow = { ...row };
    rateCategories.forEach(cat => {
      const key = cat.constructionCode || cat.constructionId;
      const originalValue = row[key] as number;
      multipliedRow[key] = originalValue > 0 ? Number((originalValue * multiplier).toFixed(2)) : 0;
    });
    return multipliedRow;
  });
}

/**
 * Build bulk update payload for API
 */
export function buildBulkUpdatePayload(updates: RatePayload[]): Array<{ id: number; data: Record<string, unknown> }> {
  return updates.map(rate => ({
    id: rate.Id!,
    data: {
      IsActive: rate.isActive,
      UpdatedBy: 1,
      TaxZoneId: rate.taxZoneId,
      FloorId: rate.floorId,
      ConstructionTypeId: rate.constructionTypeId,
      TypeOfUseGroupId: rate.typeOfUseGroupId,
      YearRangeRVId: rate.YearRangeRVId,
      RateSquareMeter: rate.rateSquareMeter,
      RateSquareFeet: rate.rateSquareFeet,
      RateSectionId: rate.rateSectionId,
      RateRemark: rate.rateRemark,
    }
  }));
}

/**
 * Build bulk create payload for API
 */
export function buildBulkCreatePayload(inserts: RatePayload[]): Array<{
  isActive: boolean;
  createdBy: number;
  taxZoneId: number;
  floorId: number;
  constructionTypeId: number;
  typeOfUseGroupId: number;
  yearRangeRVId: number;
  rateSquareMeter: number;
  rateSquareFeet: number;
  rateSectionId: number;
  rateRemark: string;
}> {
  return inserts.map(rate => ({
    isActive: rate.isActive,
    createdBy: 1,
    taxZoneId: rate.taxZoneId,
    floorId: rate.floorId,
    constructionTypeId: rate.constructionTypeId,
    typeOfUseGroupId: rate.typeOfUseGroupId,
    yearRangeRVId: rate.YearRangeRVId,
    rateSquareMeter: rate.rateSquareMeter,
    rateSquareFeet: rate.rateSquareFeet,
    rateSectionId: rate.rateSectionId,
    rateRemark: rate.rateRemark || "",
  }));
}
