import { apiClient } from '@/services/api.service';
import type {
  ApiCategoryItem,
  ApiDepartmentItem,
  ApiTypeItem,
  AssetRegisterApiRecord,
  Ward,
  Zone,
} from '@/types/asset/asset-register/municipal-asset-service.types';
import type { PropertyPhotoGalleryDto } from '@/types/asset/asset-register/media.types';
import type { ApiResponse } from '@/types/common.types';

type PagedApiResponse<T> = {
  items?: T[];
  totalCount?: number;
  totalPurchaseValue?: number;
  totalMarketValue?: number;
  totalDepreciation?: number;
  netBookValue?: number;
  totalCapitalValue?: number;
  activeAssetsCount?: number;
};

type WrappedItemsResponse<T> = {
  success?: boolean;
  message?: string;
  items?: T;
  errors?: unknown;
  correlationId?: string | null;
};

export type AssetRegisterSubUnitItem = {
  id: number;
  assetNo?: string;
  assetName?: string;
  status?: string;
  occupancy?: string;
  builtUpAreaSqMeter?: number | null;
  carpetAreaSqMeter?: number | null;
  capitalValue?: number | null;
  lastCVDate?: string | null;
  assetLife?: number | null;
  names?: {
    category?: string | null;
    type?: string | null;
    useType?: string | null;
    subUseType?: string | null;
    zone?: string | null;
    ward?: string | null;
    mouja?: string | null;
  };
};

function unwrapItems<T>(data: { items?: T[] } | undefined): T[] {
  return Array.isArray(data?.items) ? data.items : [];
}

function getDocumentViewUrl(documentGuid: string): string {
  return `/api/documents/${encodeURIComponent(documentGuid)}/view`;
}

export const municipalAssetRegisterServerService = {
  async getAssetRegisterPage(
    params: {
      pageNumber?: number;
      pageSize?: number;
      assetCategoryId?: number | null;
      assetTypeId?: string | number | null;
      zoneId?: number | null;
      wardId?: number | null;
      owningDepartmentId?: number | null;
      searchTerm?: string;
      assetNo?: string;
      assetName?: string;
      address?: string;
      sortBy?: string;
      sortOrder?: string;
      isActive?: boolean;
    } = {}
  ): Promise<ApiResponse<PagedApiResponse<AssetRegisterApiRecord>>> {
    const query = new URLSearchParams();
    query.set('PageNumber', String(params.pageNumber ?? 1));
    query.set('PageSize', String(params.pageSize ?? 10));
    query.set('IsActive', String(params.isActive ?? true));

    if (params.assetCategoryId) query.set('AssetCategoryId', String(params.assetCategoryId));
    if (params.assetTypeId) {
      const types = String(params.assetTypeId).split(',');
      types.forEach(t => {
        if (t.trim()) {
          query.append('AssetTypeId', t.trim());
        }
      });
    }
    if (params.zoneId) query.set('ZoneId', String(params.zoneId));
    if (params.wardId) query.set('WardId', String(params.wardId));
    if (params.owningDepartmentId) query.set('DepartmentId', String(params.owningDepartmentId));
    if (params.searchTerm?.trim()) query.set('SearchTerm', params.searchTerm.trim());
    if (params.assetNo?.trim()) query.set('AssetNo', params.assetNo.trim());
    if (params.assetName?.trim()) query.set('AssetName', params.assetName.trim());
    if (params.address?.trim()) query.set('Address', params.address.trim());
    if (params.sortBy) query.set('SortBy', params.sortBy);
    if (params.sortOrder) query.set('SortOrder', params.sortOrder);

    return apiClient.get<PagedApiResponse<AssetRegisterApiRecord>>(`/AssetMaster?${query.toString()}`);
  },

  async getAssetCategories(): Promise<ApiResponse<ApiCategoryItem[]>> {
    const response = await apiClient.get<{ items?: ApiCategoryItem[] }>('/AssetCategory?IsActive=true&PageSize=-1');
    if (!response.success) {
      return { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
    }

    return {
      success: true,
      statusCode: response.statusCode,
      data: unwrapItems(response.data),
      message: response.message,
    };
  },

  async getAssetTypesByCategory(categoryId?: number | null): Promise<ApiResponse<ApiTypeItem[]>> {
    const query = new URLSearchParams();
    query.set('IsActive', 'true');
    query.set('PageSize', '-1');
    if (categoryId) query.set('AssetCategoryId', String(categoryId));

    const response = await apiClient.get<{ items?: ApiTypeItem[] }>(`/AssetType?${query.toString()}`);
    if (!response.success) {
      return { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
    }

    return {
      success: true,
      statusCode: response.statusCode,
      data: unwrapItems(response.data),
      message: response.message,
    };
  },

  async getZones(): Promise<ApiResponse<Zone[]>> {
    const response = await apiClient.get<{ items?: Zone[] }>('/Zone?PageSize=-1');
    if (!response.success) {
      return { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
    }

    return {
      success: true,
      statusCode: response.statusCode,
      data: unwrapItems(response.data),
      message: response.message,
    };
  },

  async getWardsByZone(zoneId?: number | string | null): Promise<ApiResponse<Ward[]>> {
    const query = new URLSearchParams();
    query.set('PageSize', '-1');
    if (zoneId != null && zoneId !== '' && zoneId !== 'all') {
      query.set('ZoneId', String(zoneId));
    }

    const response = await apiClient.get<{ items?: Ward[] }>(`/Ward?${query.toString()}`);
    if (!response.success) {
      return { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
    }

    return {
      success: true,
      statusCode: response.statusCode,
      data: unwrapItems(response.data),
      message: response.message,
    };
  },

  async getOwningDepartments(): Promise<ApiResponse<ApiDepartmentItem[]>> {
    const response = await apiClient.get<{ items?: ApiDepartmentItem[] }>('/OwningDepartment?IsActive=true&PageSize=-1');
    if (!response.success) {
      return { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
    }

    return {
      success: true,
      statusCode: response.statusCode,
      data: unwrapItems(response.data),
      message: response.message,
    };
  },

  async getGroupedAssetPhotos(assetId: number): Promise<ApiResponse<PropertyPhotoGalleryDto>> {
    const response = await apiClient.get<WrappedItemsResponse<PropertyPhotoGalleryDto>>(
      `/asset-photos/asset/${assetId}/grouped`
    );

    if (response.success && response.data?.items) {
      const gallery = response.data.items;
      return {
        success: response.data.success ?? true,
        statusCode: response.statusCode,
        data: {
          ...gallery,
          propertyId: gallery.propertyId ?? assetId,
        },
        message: response.data.message || response.message,
      };
    }

    return {
      success: false,
      statusCode: response.statusCode,
      error: response.error || response.data?.message || 'Failed to fetch grouped asset photos',
      message: response.message,
    };
  },

  async getSubUnitsByAsset(assetId: number): Promise<ApiResponse<AssetRegisterSubUnitItem[]>> {
    const response = await apiClient.get<WrappedItemsResponse<AssetRegisterSubUnitItem[]>>(
      `/ManageSubUnits/by-asset/${assetId}`
    );

    if (response.success) {
      return {
        success: response.data?.success ?? true,
        statusCode: response.statusCode,
        data: Array.isArray(response.data?.items) ? response.data.items : [],
        message: response.data?.message || response.message,
      };
    }

    return {
      success: false,
      statusCode: response.statusCode,
      error: response.error || 'Failed to fetch sub-units',
      message: response.message,
    };
  },

  getDocumentViewUrl,
};
