import type {
  PropertySearchResult,
  PropertySuggestionResponse,
  PropertyListItem,
  PagedResult,
  Ward,
} from '@/types/ptis.types';
import { MAX_PROPERTY_FETCH } from '@/types/ptis.types';
import { fetchWithCertSupport, getErrorFormattedMessage } from './base-api';

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

    if (!response.success || !response.data?.items)
      return { success: false, error: 'No properties found' };

    return {
      success: true,
      data: response.data.items
        .map((item) => ({
          propertyNo: (item.propertyNo || item.propertyId || '').toString(),
          partitionNo: (item.partitionNo || null)?.toString() || null,
        }))
        .slice(0, limit),
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
    const response = await fetchWithCertSupport<PagedResult<Record<string, unknown>>>(
      '/Ward?PageSize=1000&PageNumber=1'
    );

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
  async getPropertyListByWard(wardId: number): Promise<{
    success: boolean;
    data?: PropertyListItem[];
    error?: string;
  }> {
    const response = await fetchWithCertSupport<PagedResult<Record<string, unknown>>>(
      `/Property?WardId=${wardId}&PageSize=${MAX_PROPERTY_FETCH}&PageNumber=1`
    );

    if (!response.success || !response.data?.items) {
      return {
        success: false,
        error: getErrorFormattedMessage(
          response.error,
          'Failed to fetch properties for the selected ward'
        ),
      };
    }

    return {
      success: true,
      data: (response.data.items as Record<string, unknown>[])
        .filter((p) => p.isActive !== false)
        .map((p) => ({
          propertyId: (p.propertyId ?? p.id) as number,
          propertyNo: (p.propertyNo as string) || '',
          partitionNo: (p.partitionNo as string) || '',
          upicId: (p.upicId as string) || '',
          ownerName: (p.ownerName as string) || (p.ownerNameEnglish as string) || '',
          address: (p.address as string) || '',
          displayProperty: (p.displayProperty as string) || (p.propertyNo as string) || '',
        })),
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
    const response = await fetchWithCertSupport<PagedResult<Ward>>(
      '/Ward?PageSize=100&PageNumber=1'
    );

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
