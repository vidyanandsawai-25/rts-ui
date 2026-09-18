import { WingData, WingWiseDetailsItems } from '@/types/property-tax/apartment';

export const WING_THEME_COLORS = [
  'bg-emerald-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-orange-500',
  'bg-blue-500',
] as const;


export function mapWingData(
  data: WingWiseDetailsItems | null | undefined,
): WingData[] {
  return data?.wings?.map((wing, index) => {
    const revDetails = wing?.revenueImpactDetails?.[0];
    const prevRv = revDetails?.previousRV ?? wing?.oldDemand ?? 0;
    const revisedRv = revDetails?.revisedRV ?? wing?.currentDemand ?? 0;
    const revDiff = revDetails?.differenceRV ?? wing?.revenueImpact ?? 0;
    const revAffectedUnits = revDetails?.affectedUnits ?? wing?.propertyCount ?? 0;

    return {
      id: wing?.wingNo || index.toString(),
      wingId: wing?.wingId,
      wingMasterId: wing?.wingMasterId,
      wingDetailId: wing?.wingDetailId,
      societyId: wing?.societyId ?? data?.societyId ?? null,
      wingNo: wing?.wingNo,
      letter: wing?.wingName?.trim()?.charAt(0),
      name: wing?.wingName || (wing?.wingNo),
      rating: wing?.collectionPercentage || 0,
      blockName: wing?.wingNo ? `${wing.wingNo}` : '',
      stats: {
        floors: wing?.floorRange || '0',
        props: wing?.propertyCount || 0,
        area: wing?.totalArea || 0,
        collectedPct: wing?.collectionPercentage || 0,
      },
      areaUnit: data?.rateMasterAreaUnit || undefined,
      types:
        wing?.propertyTypes?.map((pt) => ({
          type: (pt?.propertyTypeName as 'Residential' | 'Commercial' | 'Amenity') || 'Residential',
          units: pt?.propertyCount || 0,
          area: pt?.totalArea || 0,
          old: pt?.oldDemand ?? 0,
          cur: pt?.currentDemand ?? 0,
          retro: pt?.retroDemand ?? 0,
          total: pt?.totalDemand ?? 0,
          rev: pt?.totalRevenue ?? 0,
        })) || [],
      exemption: {
        amount: wing?.exemptionAppliedAmount ?? 0,
        count: wing?.exemptedPropertyCount || 0,
      },
      overallTax: {
        from: wing?.oldDemand ?? 0,
        to: wing?.totalDemand ?? wing?.currentDemand ?? 0,
      },
      revenueImpact: {
        amount: revDiff,
        pct: wing?.revenueImpactPercentage || 0,
        isPositive: String(revDiff).indexOf('-') === -1,
        previousRv: prevRv,
        revisedRv: revisedRv,
        affectedUnits: revAffectedUnits,
      },
      colorClass: WING_THEME_COLORS[index % WING_THEME_COLORS.length],
    };
  }) ?? [];
}
