import type {
  AssetRegisterRow,
  AssetRegisterApiRecord,
  AssetRegisterPageResult,
} from "@/types/municipal-asset/register.types";


export interface AssetRegisterOption {
  id: number;
  label: string;
}

export interface AssetRegisterWardOption extends AssetRegisterOption {
  zoneId: number | null;
}

/**
 * Dashboard statistics types
 */
export interface AssetTypeStatsDto {
  assetTypeId: number;
  assetTypeName: string;
  assetCount: number;
}

export interface AssetCategoryStatsDto {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
  registeredAssets: number;
  totalCategoryItem: number;
  totalValue?: number | null;
  assetTypeStats: AssetTypeStatsDto[];
}

export interface AssetDashboardStatsDto {
  totalAssets: number;
  totalCategories: number;
  categoryStats: AssetCategoryStatsDto[];
}

/**
 * Paginated response from /AssetMaster
 */
export interface PagedAssetMasterResponse {
  items: AssetRegisterApiRecord[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
  totalPurchaseValue?: number;
  totalMarketValue?: number;
  totalDepreciation?: number;
  netBookValue?: number;
  totalCapitalValue?: number;
  activeAssetsCount?: number;
}

/**
 * Component Props for Asset Register UI
 */
export interface AssetRegisterViewProps {
  locale: string;
  categoryId: number;
  categoryName: string | null;
  safeSearch: string;
  safeAssetTypeId: string;
  safeZoneId: string;
  finalWardId: string;
  safeOwningDepartmentId: string;
  safePageSize: number;
  finalPage: number;
  totalPages: number;
  assetsResult: AssetRegisterPageResult;
  typesResult: AssetRegisterOption[];
  zonesResult: AssetRegisterOption[];
  wardsResult: AssetRegisterWardOption[];
  departmentsResult: AssetRegisterOption[];
  updatedDate: string;
}

export interface AssetRegisterTableProps {
  assets: AssetRegisterRow[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface AssetRegisterFiltersProps {
  search: string;
  assetTypeId: string;
  zoneId: string;
  wardId: string;
  owningDepartmentId: string;
  assetTypeOptions: { label: string; value: string }[];
  zoneOptions: { label: string; value: string }[];
  wardOptions: { label: string; value: string }[];
  owningDepartmentOptions: { label: string; value: string }[];
}

export interface AssetRegisterExportButtonProps {
  categoryId: number;
  categoryName: string;
  search: string;
  assetTypeId: string;
  zoneId: string;
  wardId: string;
  totalCount: number;
  pageSize: number;
  assets: AssetRegisterApiRecord[];
}

export interface AssetRegisterHeaderSummaryProps {
  registerSubtitle: string;
  updatedDate: string;
  totalCount: number;
  totalPurchaseValue: number;
  totalMarketValue: number;
  totalDepreciation: number;
  netBookValue: number;
  totalCapitalValue: number;
  activeAssetsCount: number;
  translate: (key: string) => string;
}

export interface AssetRegisterControlsProps {
  categoryId: number;
  categoryName: string;
  search: string;
  assetTypeId: string;
  zoneId: string;
  wardId: string;
  owningDepartmentId: string;
  totalCount: number;
  pageSize: number;
  assets: AssetRegisterApiRecord[];
  assetTypeOptions: { label: string; value: string }[];
  zoneOptions: { label: string; value: string }[];
  wardOptions: { label: string; value: string }[];
  owningDepartmentOptions: { label: string; value: string }[];
}

export interface GroupedAssetPhotos {
  photoTypes?: Array<{
    photos?: Array<{
      photoId?: number;
      propertyPhotoId?: number;
      assetId?: number;
      propertyId?: number;
      photoTypeId?: number;
      photoTypeCode?: string;
      photoTypeName?: string;
      displayOrder?: number;
      remarks?: string;
      viewUrl?: string;
      documentGuid?: string;
    }>;
  }>;
}


export type PagedApiResponse<T> = {
  items?: T[];
  totalCount?: number;
  totalPurchaseValue?: number;
  totalMarketValue?: number;
  totalDepreciation?: number;
  netBookValue?: number;
  totalCapitalValue?: number;
  activeAssetsCount?: number;
};

export type WrappedItemsResponse<T> = {
  success?: boolean;
  message?: string;
  items?: T;
  errors?: unknown;
  correlationId?: string | null;
};

export interface AssetRegisterSubUnitItem {
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
    mouja?: string | null;
    zone?: string | null;
    ward?: string | null;
  };
}

export type AssetRegisterSearchField = 'all' | 'assetId' | 'assetName' | 'address';

export type ExpandedSubUnit = AssetRegisterSubUnitItem & { isSubUnit?: boolean; parentId?: number };

export interface UseAssetPhotoPanelParams {
  isPanelVisible: boolean;
  togglePanel: () => void;
}
