import { IRateMaster, IZoneDescription, RateCategory, IBackendRateMaster } from "@/types/RVRateMaster";
import { PagedResponse } from "@/types/RVRateMaster";
import { apiClient } from "@/services/api.service";
import { ApiError } from "@/lib/utils/api";
import { getTranslations } from 'next-intl/server';

/**
 * Get rate master table columns configuration
 */
export async function getRateMasterColumns(constructionTypes: RateCategory[]) {
  return [
    { id: "zoneNo", label: "Zone No" },
    { id: "zoneDescription", label: "Zone Description" },
    ...constructionTypes.map(type => ({
      id: (type.constructionCode || type.constructionId).toLowerCase(),
      label: `${type.constructionCode || type.constructionId} (₹/Sq.mtr)`,
      title: type.description
    }))
  ];
}

/**
 * Get all rate master data from backend (unpaged)
 */
export async function getRateMasterTableData(
  constructionTypes: RateCategory[],
  zoneDescriptions: IZoneDescription[]
): Promise<IRateMaster[]> {
  try {
    const response = await apiClient.get<PagedResponse<IBackendRateMaster>>(`/Rate?PageSize=-1`);
    if (!response.success) {
      const t = await getTranslations('ptis_RVRateMaster');
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || t('rvRateMasterErrors.fetchRateMasterDataFailed'),
        'Get rate master data failed'
      );
    }
    if (!response.data) {
      const t = await getTranslations('ptis_RVRateMaster');
      throw new ApiError(
        500,
        t('rvRateMasterErrors.noDataReceived'),
        'Invalid response format'
      );
    }

    const data = response.data;
    const backendData: IBackendRateMaster[] = data.items || [];
    const taxZoneIdToNo = new Map(zoneDescriptions.map(z => [z.taxZoneId, z.zoneNo]));
    const groupedData = new Map<string, IRateMaster>();

    backendData.forEach(item => {
      try {
        const taxZoneNo = taxZoneIdToNo.get(item.taxZoneId) || item.taxZoneNo || String(item.taxZoneId);
        const typeOfUseGroupId = String(item.typeOfUseGroupId);
        const rateSectionNo = item.rateSectionNo || String(item.rateSectionId);
        const yearRangeRVId = String(item.yearRangeRVId || item.yearRangeId);
        const key = `${taxZoneNo}-${typeOfUseGroupId}-${rateSectionNo}-${yearRangeRVId}-${item.year}`;

        if (!groupedData.has(key)) {
          groupedData.set(key, {
            id: String(item.id),
            rateSection: rateSectionNo,
            zoneNo: taxZoneNo,
            assessmentYear: yearRangeRVId,
            useGroup: typeOfUseGroupId,
            rates: constructionTypes.map(ct => ({
              rateCategory: ct.constructionCode || ct.constructionId,
              ratePerSqMtr: null
            }))
          });
        }

        const rateMaster = groupedData.get(key)!;
        const constructionTypeId = Number(item.constructionTypeId);
        const construction = constructionTypes.find(ct => Number(ct.constructionId) === constructionTypeId);
        
        if (construction) {
          const constructionCode = construction.constructionCode || construction.constructionId;
          const rateIndex = rateMaster.rates.findIndex(r => r.rateCategory === constructionCode);
          if (rateIndex !== -1) {
            rateMaster.rates[rateIndex].ratePerSqMtr = item.rateSquareMeter;
            rateMaster.rates[rateIndex].id = item.id;
          }
        }
      } catch (_err) {
        // Logging should be handled in action.ts
      }
    });

    return Array.from(groupedData.values());
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const t = await getTranslations('rvRateMasterErrors');
    throw new ApiError(500, error instanceof Error ? error.message : t('errorsResponse.unknownError'), 'Get rate master data failed');
  }
}

/**
 * Get rate master record by ID
 */
export async function getRateMasterById(
  id: string,
  constructionTypes: RateCategory[],
  zoneDescriptions: IZoneDescription[]
): Promise<IRateMaster | null> {
  try {
    const allData = await getRateMasterTableData(constructionTypes, zoneDescriptions);
    return allData.find((item) => item.id === id) || null;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const t = await getTranslations('rvRateMasterErrors');
    throw new ApiError(500, error instanceof Error ? error.message : t('errorsResponse.unknownError'), `Get rate master ${id} failed`);
  }
}
