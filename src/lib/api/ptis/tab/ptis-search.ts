import type {
  PropertySearchResult,
  PropertySuggestionResponse,
  PropertyListItem,
  PagedResult,
  Ward,
  PropwiseSuggestionItem,
  PropwiseSuggestionResponse,
} from '@/types/ptis.types';
import { fetchWithCertSupport, getErrorFormattedMessage, extractItems } from './base-api';

import { getPropertySocietyDetails } from '@/lib/api/property-society.service';

async function enrichSuggestionsWithSocietyDetails(
  items: PropwiseSuggestionItem[]
): Promise<PropwiseSuggestionItem[]> {
  return Promise.all(
    items.map(async (item) => {
      let societyDetailId = item.societyDetailId ?? null;
      let wingDetailId = item.wingDetailId ?? null;

      if ((!societyDetailId || societyDetailId <= 0) && item.propertyId > 0) {
        try {
          const socDetails = await getPropertySocietyDetails(item.propertyId);
          if (socDetails) {
            if (!societyDetailId && socDetails.societyDetailId && Number(socDetails.societyDetailId) > 0) {
              societyDetailId = Number(socDetails.societyDetailId);
            }
            if (!wingDetailId && socDetails.wingId && Number(socDetails.wingId) > 0) {
              wingDetailId = Number(socDetails.wingId);
            }
          }
        } catch {
          // non-blocking fallback
        }
      }

      return {
        ...item,
        societyDetailId,
        wingDetailId,
      };
    })
  );
}

export const ptisSearchService = {
  async searchProperties(filters: {
    wardNo?: string;
    wardId?: number;
    propertyNo?: string;
    upicId?: string;
    partitionNo?: string;
  }): Promise<{ success: boolean; data?: PropertySearchResult[]; error?: string }> {
    // Fail closed: an unscoped property search can match the wrong record
    // when property numbers repeat across wards.
    if (!filters.wardId && !filters.wardNo && !filters.upicId) {
      return {
        success: false,
        error: 'Ward information is required to search properties',
      };
    }

    const params = new URLSearchParams();

    // Prefer the numeric WardId; fall back to WardNo when wardId resolution failed.
    if (filters.wardId) {
      params.append('WardId', filters.wardId.toString());
    } else if (filters.wardNo) {
      params.append('WardNo', filters.wardNo);
    }

    // Canonicalize parameters to PascalCase as per backend standard
    if (filters.propertyNo) params.append('PropertyNo', filters.propertyNo);
    if (filters.partitionNo) params.append('PartitionNo', filters.partitionNo);
    if (filters.upicId) params.append('UpicId', filters.upicId);

    params.append('PageSize', '100');
    params.append('PageNumber', '1');

    const response = await fetchWithCertSupport<PagedResult<PropertySearchResult>>(
      `/Property?${params.toString()}`
    );

    if (!response.success || !response.data?.items) {
      return {
        success: false,
        error: getErrorFormattedMessage(response.error, 'No properties found matching criteria'),
      };
    }

    return { success: true, data: response.data.items };
  },

  async getPropertySuggestions(
    wardNo?: string,
    wardId?: number,
    searchText?: string,
    limit = 10
  ): Promise<{
    success: boolean;
    data?: PropertySuggestionResponse[];
    error?: string;
  }> {
    if (!wardNo && !wardId) return { success: false, error: 'Ward is required' };

    const params = new URLSearchParams();
    if (wardId) params.append('WardId', wardId.toString());
    if (searchText) {
      params.append('SearchText', searchText);
      params.append('PropertyNo', searchText);
    }
    params.append('PageSize', limit.toString());

    const response = await fetchWithCertSupport<PagedResult<PropertySearchResult>>(
      `/Property?${params.toString()}`
    );

    if (!response.success)
      return { success: false, error: getErrorFormattedMessage(response.error, 'No properties found') };

    const items = response.data?.items || [];
    return {
      success: true,
      data: items
        .map((item) => ({
          propertyNo: (item.propertyNo || item.propertyId || '').toString(),
          partitionNo: (item.partitionNo || null)?.toString() || null,
        }))
        .slice(0, limit),
    };
  },

  async getPropertySuggestionsByPropwise(
    wardId: number,
    propertyNo?: string,
    partitionNo?: string,
    maxResults = 100
  ): Promise<{
    success: boolean;
    data?: PropwiseSuggestionItem[];
    error?: string;
  }> {
    const params = new URLSearchParams();
    params.append('WardId', wardId.toString());
    if (propertyNo) params.append('PropertyNo', propertyNo);
    if (partitionNo) params.append('PartitionNo', partitionNo);
    params.append('MaxResults', maxResults.toString());

    let response = await fetchWithCertSupport<PropwiseSuggestionResponse | PropwiseSuggestionItem[]>(
      `/Property/propwisesearch/suggestions?${params.toString()}`
    );

    if (!response.success || !response.data) {
      response = await fetchWithCertSupport<PropwiseSuggestionResponse | PropwiseSuggestionItem[]>(
        `/ApartmentQC/search/suggestions?${params.toString()}`
      );
    }

    if (!response.success) {
      return {
        success: false,
        error: getErrorFormattedMessage(response.error, 'No suggestions found'),
      };
    }

    const rawItems = extractItems<Record<string, unknown>>(response.data);

    const extractId = (val: unknown): number | null => {
      if (typeof val === 'number' && Number.isFinite(val) && val > 0) return val;
      if (typeof val === 'string' && val.trim() !== '') {
        const n = parseInt(val, 10);
        if (Number.isFinite(n) && n > 0) return n;
      }
      return null;
    };

    const mappedItems: PropwiseSuggestionItem[] = rawItems.map((obj) => {
      const propertyId = Number(obj.propertyId ?? obj.PropertyId ?? 0);
      const propNo = String(obj.propertyNo ?? obj.PropertyNo ?? '');
      const partNo = obj.partitionNo != null ? String(obj.partitionNo) : obj.PartitionNo != null ? String(obj.PartitionNo) : null;

      const societyDetailId =
        extractId(obj.societyDetailId) ??
        extractId(obj.SocietyDetailId) ??
        extractId(obj.societydetailid) ??
        extractId(obj.societyId) ??
        extractId(obj.SocietyId) ??
        extractId(obj.societyid) ??
        extractId(obj.societyMasterId) ??
        null;

      const wingDetailId =
        extractId(obj.wingDetailId) ??
        extractId(obj.WingDetailId) ??
        extractId(obj.wingdetailid) ??
        extractId(obj.wingId) ??
        extractId(obj.WingId) ??
        extractId(obj.wingid) ??
        null;

      return {
        propertyId,
        zoneId: obj.zoneId != null ? Number(obj.zoneId) : obj.ZoneId != null ? Number(obj.ZoneId) : undefined,
        zoneNo: obj.zoneNo != null ? String(obj.zoneNo) : obj.ZoneNo != null ? String(obj.ZoneNo) : undefined,
        wardId: obj.wardId != null ? Number(obj.wardId) : obj.WardId != null ? Number(obj.WardId) : wardId,
        wardNo: obj.wardNo != null ? String(obj.wardNo) : obj.WardNo != null ? String(obj.WardNo) : undefined,
        propertyNo: propNo,
        partitionNo: partNo,
        upicId: obj.upicId != null ? String(obj.upicId) : obj.UpicId != null ? String(obj.UpicId) : undefined,
        displayLabel: obj.displayLabel != null ? String(obj.displayLabel) : obj.DisplayLabel != null ? String(obj.DisplayLabel) : (obj.displayProperty != null ? String(obj.displayProperty) : `${propNo}${partNo ? `-${partNo}` : ''}`),
        category: obj.category != null ? Number(obj.category) : obj.Category != null ? Number(obj.Category) : undefined,
        categoryLabel: obj.categoryLabel != null ? String(obj.categoryLabel) : obj.CategoryLabel != null ? String(obj.CategoryLabel) : undefined,
        societyDetailId,
        societyName: obj.societyName != null ? String(obj.societyName) : obj.SocietyName != null ? String(obj.SocietyName) : null,
        wings: Array.isArray(obj.wings) ? (obj.wings as PropwiseSuggestionItem['wings']) : Array.isArray(obj.Wings) ? (obj.Wings as PropwiseSuggestionItem['wings']) : null,
        wingDetailId,
      };
    });

    const enrichedItems = await enrichSuggestionsWithSocietyDetails(mappedItems);

    return {
      success: true,
      data: enrichedItems,
    };
  },

  async getPropertySuggestionsPage(
    wardId: number,
    propertyNo?: string,
    partitionNo?: string,
    pageNumber = 1,
    pageSize = 100
  ): Promise<{
    success: boolean;
    data?: PagedResult<PropwiseSuggestionItem>;
    error?: string;
  }> {
    const params = new URLSearchParams({
      WardId: wardId.toString(),
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString(),
    });
    if (propertyNo) params.append('PropertyNo', propertyNo);
    if (partitionNo) params.append('PartitionNo', partitionNo);

    const response = await fetchWithCertSupport<PagedResult<PropertySearchResult>>(
      `/Property?${params.toString()}`
    );

    if (!response.success || !response.data?.items) {
      return {
        success: false,
        error: getErrorFormattedMessage(response.error, 'No properties found'),
      };
    }

    const responsePageNumber = response.data.pageNumber || pageNumber;
    const responsePageSize = response.data.pageSize || pageSize;
    const totalCount = response.data.totalCount ?? response.data.items.length;
    const totalPages = response.data.totalPages
      ?? (responsePageSize > 0 ? Math.ceil(totalCount / responsePageSize) : 1);
    const hasNext = response.data.hasNext ?? responsePageNumber < totalPages;

    const extractId = (val: unknown): number | null => {
      if (typeof val === 'number' && Number.isFinite(val) && val > 0) return val;
      if (typeof val === 'string' && val.trim() !== '') {
        const n = parseInt(val, 10);
        if (Number.isFinite(n) && n > 0) return n;
      }
      return null;
    };

    const mappedItems: PropwiseSuggestionItem[] = response.data.items
      .map((item): PropwiseSuggestionItem => {
        const rawObj = item as unknown as Record<string, unknown>;
        const societyDetailId =
          extractId(item.societyDetailId) ??
          extractId(rawObj.SocietyDetailId) ??
          extractId(rawObj.societydetailid) ??
          extractId(rawObj.societyId) ??
          extractId(rawObj.SocietyId) ??
          null;

        const wingDetailId =
          extractId(rawObj.wingDetailId) ??
          extractId(rawObj.WingDetailId) ??
          extractId(rawObj.wingdetailid) ??
          extractId(rawObj.wingId) ??
          extractId(rawObj.WingId) ??
          null;

        return {
          propertyId: Number(item.propertyId ?? item.id ?? 0),
          propertyNo: String(item.propertyNo ?? ''),
          partitionNo: item.partitionNo != null ? String(item.partitionNo) : null,
          wardId: item.wardId != null ? Number(item.wardId) : wardId,
          wardNo: item.wardNo != null ? String(item.wardNo) : undefined,
          upicId: item.upicId != null ? String(item.upicId) : undefined,
          displayLabel: item.displayProperty != null
            ? String(item.displayProperty)
            : String(item.propertyNo ?? ''),
          category: item.categoryId ?? (rawObj.category as number | undefined),
          categoryLabel: item.categoryName ?? (rawObj.categoryLabel as string | undefined),
          societyDetailId,
          wingDetailId,
        };
      })
      .filter((item) => item.propertyId > 0 && item.propertyNo.trim() !== '');

    const enrichedItems = await enrichSuggestionsWithSocietyDetails(mappedItems);

    return {
      success: true,
      data: {
        items: enrichedItems,
        totalCount,
        pageNumber: responsePageNumber,
        pageSize: responsePageSize,
        totalPages,
        hasPrevious: response.data.hasPrevious ?? responsePageNumber > 1,
        hasNext,
      },
    };
  },

  /**
   * Fetches the complete list of active wards.
   */
  async getWardList(): Promise<{
    success: boolean;
    data?: Array<{ wardId: number; wardNo: string; zoneId: number; description: string }>;
    error?: string;
  }> {
    const response =
      await fetchWithCertSupport<PagedResult<Record<string, unknown>>>('/Ward?PageSize=-1');

    if (!response.success || !response.data?.items) {
      return {
        success: false,
        error: getErrorFormattedMessage(response.error, 'Failed to fetch wards'),
      };
    }

    return {
      success: true,
      data: (response.data.items as Record<string, unknown>[])
        .filter((w) => w.isActive !== false)
        .map((w) => ({
          wardId: (w.wardId ?? w.wardID ?? w.id) as number,
          wardNo: (w.wardNo ?? w.wardno) as string,
          zoneId: w.zoneId as number,
          description: w.description as string,
        })),
    };
  },

  /**
   * Fetches all properties belonging to a specific ward.
   */
  async getPropertyListByWard(
    wardId: number,
    limit?: number
  ): Promise<{
    success: boolean;
    data?: PropertyListItem[];
    error?: string;
  }> {
    let allItems: Record<string, unknown>[] = [];
    let pageNumber = 1;
    let requestedPageSize = limit ? Math.min(limit, 1000) : 1000;
    let hasNext = true;

    while (hasNext) {
      const url = `/Property?WardId=${wardId}&PageSize=${requestedPageSize}&PageNumber=${pageNumber}`;
      const response = await fetchWithCertSupport<PagedResult<Record<string, unknown>>>(url);

      if (!response.success || !response.data?.items) {
        if (pageNumber === 1) {
          return {
            success: false,
            error: getErrorFormattedMessage(
              response.error,
              'Failed to fetch properties for the selected ward'
            ),
          };
        }
        break;
      }

      const items = response.data.items as Record<string, unknown>[];
      allItems = allItems.concat(items);

      if (limit && allItems.length >= limit) {
        break;
      }

      const actualPageSize = response.data.pageSize || items.length;

      if (actualPageSize > 0 && actualPageSize < requestedPageSize) {
        requestedPageSize = actualPageSize;
      }

      const totalCount = response.data.totalCount ?? 0;
      hasNext =
        response.data.hasNext === true || (items.length > 0 && allItems.length < totalCount);

      if (requestedPageSize > 0) {
        pageNumber = Math.floor(allItems.length / requestedPageSize) + 1;
      } else {
        pageNumber++;
      }

      if (pageNumber > 200 || items.length === 0) {
        break;
      }
    }

    const finalData = allItems
      .filter(
        (p) =>
          p.isActive !== false &&
          p.propertyNo !== null &&
          p.propertyNo !== undefined &&
          String(p.propertyNo).trim() !== '' &&
          String(p.propertyNo).toLowerCase() !== 'null' &&
          String(p.propertyNo).toLowerCase() !== 'undefined'
      )
      .map((p) => ({
        propertyId: (p.propertyId ?? p.id) as number,
        propertyNo: (p.propertyNo as string) || '',
        partitionNo: (p.partitionNo as string) || '',
        upicId: (p.upicId as string) || '',
        ownerName: (p.ownerName as string) || (p.ownerNameEnglish as string) || '',
        address: (p.address as string) || '',
        displayProperty: (p.displayProperty as string) || (p.propertyNo as string) || '',
      }));

    return {
      success: true,
      data: finalData,
    };
  },

  /**
   * Fetches ward suggestions based on search text.
   */
  async getWardSuggestions(
    searchText?: string,
    limit = 10
  ): Promise<{
    success: boolean;
    data?: Array<{ wardNo: string; wardId: string }>;
    error?: string;
  }> {
    const response = await fetchWithCertSupport<PagedResult<Ward>>('/Ward?PageSize=-1');

    if (!response.success || !response.data?.items) {
      return { success: false, error: getErrorFormattedMessage(response.error, 'Wards not found') };
    }

    let wards = response.data.items;
    if (searchText) {
      const lower = searchText.toLowerCase();
      wards = wards.filter(
        (w) =>
          (w.wardNo ?? '').toLowerCase().includes(lower) ||
          (w.description ?? '').toLowerCase().includes(lower)
      );
    }

    return {
      success: true,
      data: wards.slice(0, limit).map((w) => ({
        wardNo: (w.wardNo || '').toString(),
        wardId: (w.wardID || w.wardId || '').toString(),
      })),
    };
  },

  /**
   * Fetches a single ward by its number.
   */
  async getWardByNo(wardNo: string): Promise<{ success: boolean; data?: Ward; error?: string }> {
    const response = await fetchWithCertSupport<PagedResult<Ward>>(
      `/Ward?WardNo=${encodeURIComponent(wardNo)}`
    );
    if (response.success && response.data?.items?.length)
      return { success: true, data: response.data.items[0] };

    return { success: false, error: 'Ward not found' };
  },

  /**
   * Fetches partition suggestions for a specific property.
   */
  async getPartitionSuggestions(
    wardNo?: string,
    wardId?: number,
    propertyNo?: string,
    searchText?: string,
    limit = 10
  ): Promise<{
    success: boolean;
    data?: PropertySuggestionResponse[];
    error?: string;
  }> {
    if (!propertyNo || (!wardNo && !wardId))
      return { success: false, error: 'Ward and Property No are required' };

    const params = new URLSearchParams({
      PropertyNo: propertyNo,
      PageSize: limit.toString(),
    });
    if (wardId) params.append('WardId', wardId.toString());
    if (searchText) params.append('PartitionNo', searchText);

    const response = await fetchWithCertSupport<PagedResult<PropertySearchResult>>(
      `/Property?${params.toString()}`
    );

    if (!response.success || !response.data?.items)
      return { success: false, error: 'No partitions found' };

    return {
      success: true,
      data: response.data.items
        .filter((item) => item.propertyNo === propertyNo && item.partitionNo)
        .map((item) => ({
          propertyNo: (item.propertyNo as string).toString(),
          partitionNo: (item.partitionNo as string).toString(),
        }))
        .slice(0, limit),
    };
  },
};
