import type {
  AssetRegisterOption,
  AssetRegisterWardOption,
  AssetRegisterPageResult,
} from "@/types/asset/asset-register/municipal-asset-service.types";

export type AssetRegisterRow = {
  id: number | null;
  assetId: string;
  authorityName: string;
  organizationName: string;
  departmentName: string;
  assetCode: string;
  assetName: string;
  categoryName: string;
  assetTypeName: string;
  parentAssetName: string;
  address: string;
  wardName: string;
  zoneName: string;
  latitude: string;
  longitude: string;
  csn: string;
  hasLift: string;
  purchaseDate: string;
  marketValueDate: string;
  capitalValue: string;
  lastCVCalculationDate: string;
  currentBookValue: string;
  depreciation: string;
  netBookValue: string;
  lifeYears: string;
  depreciationRate: string;
  isRevenueGenerating: string;
  operationalControl: string;
  fieldValues: string;
  occupancyStatus: string;
  ownershipType: string;
  assetCondition: string;
  purchaseValue: string;
  marketValue: string;
  builtUpAreaSqMeter: string;
  carpetAreaSqMeter: string;
  landAreaSqMeter: string;
  createdDate: string;
  assetCategoryId: number | null;
  assetTypeId: number | null;
  assetDocumentId?: number | null;
  isSubUnit?: boolean;
  parentId?: number | null;
  totalSubUnits?: number;
};

export interface AssetRegisterViewProps {
  locale: string;
  categoryId?: number;
  categoryName: string | null;
  safeSearch: string;
  safeSearchField: string;
  AssetNo: string;
  AssetTypeId: string;
  ZoneId: string;
  WardId: string;
  DepartmentId: string;
  safePageSize: number;
  finalPage: number;
  totalPages: number;
  assetsResult: AssetRegisterPageResult;
  typesResult: AssetRegisterOption[];
  zonesResult: AssetRegisterOption[];
  wardsResult: AssetRegisterWardOption[];
  departmentsResult: AssetRegisterOption[];
  updatedDate: string;
  categoryOptions?: AssetRegisterOption[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AssetRegisterTableProps {
  assets: AssetRegisterRow[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  controls?: React.ReactNode;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AssetRegisterFiltersProps {
  search: string;
  searchField: string;
  AssetNo: string;
  AssetTypeId: string;
  ZoneId: string;
  WardId: string;
  DepartmentId: string;
  assetTypeOptions: { label: string; value: string }[];
  zoneOptions: { label: string; value: string }[];
  wardOptions: { label: string; value: string }[];
  owningDepartmentOptions: { label: string; value: string }[];
  categoryId?: number;
  categoryOptions?: { label: string; value: string }[];
  exportButton?: React.ReactNode;
}

export interface AssetRegisterExportButtonProps {
  categoryId?: number;
  search: string;
  searchField: string;
  AssetNo: string;
  AssetTypeId: string;
  ZoneId: string;
  WardId: string;
  DepartmentId: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
  categoryId?: number;
  categoryName: string;
  search: string;
  searchField: string;
  AssetNo: string;
  AssetTypeId: string;
  ZoneId: string;
  WardId: string;
  DepartmentId: string;
  assetTypeOptions: { label: string; value: string }[];
  zoneOptions: { label: string; value: string }[];
  wardOptions: { label: string; value: string }[];
  owningDepartmentOptions: { label: string; value: string }[];
  categoryOptions?: { label: string; value: string }[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
