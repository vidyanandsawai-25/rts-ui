import type { WaterRateMasterLookup } from "@/types/waterconnection.types";

export function findApplicableRate(
  typeId: number | '',
  sizeId: number | '',
  rateMasters: WaterRateMasterLookup[]
): { rate: number | null; notFound: boolean } {
  if (!typeId || !sizeId) return { rate: null, notFound: false };

  const matches = rateMasters.filter(
    (r) =>
      r.waterConnectionTypeId === Number(typeId) &&
      r.waterConnectionSizeId === Number(sizeId) &&
      r.isActive === true
  );

  if (!matches.length) return { rate: null, notFound: true };

  // Pick the entry with the most recent finance year
  const best = matches.reduce((prev, cur) =>
    cur.financeYearId > prev.financeYearId ? cur : prev
  );

  return { rate: best.yearlyRate, notFound: false };
}
