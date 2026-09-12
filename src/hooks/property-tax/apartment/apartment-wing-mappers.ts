import { WingData, WingWiseDetailsItems } from '@/types/property-tax/apartment';

export const WING_THEME_COLORS = [
  'bg-emerald-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-orange-500',
  'bg-blue-500',
] as const;

export interface WingTranslations {
  wingLabel: string;
  blockLabel: string;
}

export function mapWingData(
  data: WingWiseDetailsItems | null | undefined,
  translations: WingTranslations
): WingData[] {
  return data?.wings?.map((wing, index) => ({
    id: wing?.wingNo || index.toString(),
    wingId: wing?.wingId,
    wingMasterId: wing?.wingMasterId,
    wingDetailId: wing?.wingDetailId,
    societyId: wing?.societyId ?? data?.societyId ?? null,
    wingNo: wing?.wingNo,
    letter: wing?.wingNo?.charAt(0) || translations?.wingLabel.charAt(0) || 'W',
    name: wing?.wingName || `${translations?.wingLabel} ${wing?.wingNo}`,
    rating: wing?.collectionPercentage || 0,
    blockName: `${translations?.blockLabel} ${wing?.wingNo}`,
    stats: {
      floors: wing?.floorRange || '0',
      props: wing?.propertyCount || 0,
      area: wing?.totalArea || 0,
      collectedPct: wing?.collectionPercentage || 0,
    },
    types:
      wing?.propertyTypes?.map((pt) => ({
        type: (pt?.propertyTypeName as 'Residential' | 'Commercial' | 'Amenity') || 'Residential',
        units: pt?.propertyCount || 0,
        area: pt?.totalArea || 0,
        old: Number(pt?.oldDemand) || 0,
        cur: Number(pt?.currentDemand) || 0,
        retro: Number(pt?.retroDemand) || 0,
        total: Number(pt?.totalDemand) || 0,
        rev: Number(pt?.totalRevenue) || 0,
      })) || [],
    exemption: {
      amount: Number(wing?.exemptionAppliedAmount) || 0,
      count: wing?.exemptedPropertyCount || 0,
    },
    overallTax: {
      from: Number(wing?.oldDemand) || 0,
      to: Number(wing?.currentDemand) || 0,
    },
    revenueImpact: {
      amount: Number(wing?.revenueImpact) || 0,
      pct: wing?.revenueImpactPercentage || 0,
      isPositive: (Number(wing?.revenueImpact) || 0) >= 0,
      previousRv: Number(wing?.oldDemand) || 0,
      revisedRv: Number(wing?.currentDemand) || 0,
      affectedUnits: wing?.propertyCount || 0,
    },
    colorClass: WING_THEME_COLORS[index % WING_THEME_COLORS.length],
  })) ?? [];
}
