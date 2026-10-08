import { parseApiBoolean } from "@/lib/api/utils";
import type { TariffWorkbench } from "@/types/water-bill/tariff-workbench/tariffWorkbench.types";

export function normalizeTariffWorkbench(data: unknown): TariffWorkbench {
  if (!data || typeof data !== "object") {
    return {
      id: 0,
      tariffCode: "",
      tariffName: "",
      financialYearId: 0,
      connectionTypeId: null,
      connectionCategoryId: null,
      billingMethod: "",
      effectiveFrom: "",
      effectiveTo: null,
      versionNo: 0,
      status: "",
      description: null,
      isActive: false,
    };
  }

  const obj = data as Record<string, unknown>;
  const idVal = obj.id ?? obj.Id ?? obj.tariffId ?? obj.TariffId ?? obj.tariffMasterId ?? obj.TariffMasterId;
  const numId = Number(idVal);
  const id = Number.isFinite(numId) ? numId : 0;

  const tariffCode = String(obj.tariffCode ?? obj.TariffCode ?? obj.code ?? obj.Code ?? "").trim();
  const tariffName = String(obj.tariffName ?? obj.TariffName ?? obj.name ?? obj.Name ?? "").trim();
  const financialYearId = Number(obj.financialYearId ?? obj.FinancialYearId ?? obj.yearId ?? obj.YearId) || 0;
  const rawYear = obj.year ?? obj.Year ?? obj.yearCode ?? obj.YearCode ?? obj.financialYearCode ?? obj.FinancialYearCode;
  const year = rawYear !== undefined && rawYear !== null ? String(rawYear).trim() : undefined;
  const rawYearCode = obj.yearCode ?? obj.YearCode ?? obj.year ?? obj.Year ?? obj.financialYearCode ?? obj.FinancialYearCode;
  const yearCode = rawYearCode !== undefined && rawYearCode !== null ? String(rawYearCode).trim() : undefined;
  const financialYearCode = year || yearCode;

  const connTypeId = obj.connectionTypeId ?? obj.ConnectionTypeId;
  const connectionTypeId = connTypeId !== null && connTypeId !== undefined ? Number(connTypeId) : null;
  const connectionTypeName = ((obj.connectionTypeName ?? obj.ConnectionTypeName) as string | undefined)?.trim();

  const connCatId = obj.connectionCategoryId ?? obj.ConnectionCategoryId;
  const connectionCategoryId = connCatId !== null && connCatId !== undefined ? Number(connCatId) : null;
  const connectionCategoryName = ((obj.connectionCategoryName ?? obj.ConnectionCategoryName) as string | undefined)?.trim();

  const tapSizeIdVal = obj.tapSizeId ?? obj.TapSizeId;
  const tapSizeId = tapSizeIdVal !== null && tapSizeIdVal !== undefined ? Number(tapSizeIdVal) : null;
  const tapSizeName = ((obj.tapSizeName ?? obj.TapSizeName) as string | undefined)?.trim();

  const billingMethod = String(obj.billingMethod ?? obj.BillingMethod ?? "").trim();
  const effectiveFromRaw = String(obj.effectiveFrom ?? obj.EffectiveFrom ?? "").trim();
  const effectiveFrom = effectiveFromRaw ? effectiveFromRaw.split("T")[0] : "";

  const effectiveToRaw = (obj.effectiveTo ?? obj.EffectiveTo) ? String(obj.effectiveTo ?? obj.EffectiveTo).trim() : null;
  const effectiveTo = effectiveToRaw ? effectiveToRaw.split("T")[0] : null;

  const versionNoRaw = obj.versionNo ?? obj.VersionNo;
  const versionNo = versionNoRaw !== undefined && versionNoRaw !== null ? Number(versionNoRaw) : undefined;
  const status = obj.status ?? obj.Status ? String(obj.status ?? obj.Status).trim() : undefined;
  const description = (obj.description ?? obj.Description) ? String(obj.description ?? obj.Description).trim() : null;

  const isActiveVal = obj.isActive ?? obj.IsActive ?? obj.active ?? obj.Active ?? obj.status ?? obj.Status;
  const isActive = parseApiBoolean(isActiveVal, false);

  return {
    id,
    tariffCode,
    tariffName,
    year,
    financialYearId,
    financialYearCode,
    yearId: financialYearId,
    yearCode,
    connectionTypeId,
    connectionTypeName,
    connectionCategoryId,
    connectionCategoryName,
    tapSizeId,
    tapSizeName,
    billingMethod: billingMethod || undefined,
    effectiveFrom,
    effectiveTo,
    versionNo,
    status,
    description,
    isActive,
  };
}
