export interface WaterConnection extends Record<string, unknown> {
  id: number;
  propertyId: number;
  connectionNo: string;
  meterNo: string | null;
  waterConnectionTypeId: number;
  type: string;
  waterConnectionSizeId: number;
  tapSize: string;
  waterConnectionStatusId: number | null;
  statusName: string | null;
  connectionStartDate: string;
  connectionStopDate: string | null;
  installDate: string | null;
  activatedDate: string | null;
  stoppedDate: string | null;
  applicableRate: number | null;
  applicableCharges: number | null;
  category: string;
  isActive: boolean;
}

export interface PropertyInfo {
  id: number;
  propertyNo: string;
  ownerName: string;
  customerId: string;
  customerType: 'Individual' | 'Organization';
  contact: string;
  email: string;
  address: string;
  zone: string;
  ward: string;
  buildingType: string;
}

export interface WaterConnectionFormModel {
  id?: number;
  propertyId: number;
  connectionNo: string;
  meterNo: string;
  waterConnectionTypeId: number | '';
  waterConnectionSizeId: number | '';
  waterConnectionStatusId?: number | null;
  installDate: string;
  isActive: boolean;
  applicableRate?: number | null;
}

export interface WaterConnectionTypeLookup {
  id: number;
  connectionTypeCode: string;
  connectionTypeName: string;
}

export interface WaterConnectionSizeLookup {
  id: number;
  connectionSize: number;
  connectionSizeUnit: string;
  displayLabel: string;
}

export interface WaterConnectionStatusLookup {
  id: number;
  statusName: string;
}

export interface WaterRateMasterLookup {
  id: number;
  waterConnectionTypeId: number;
  connectionTypeName?: string;
  waterConnectionSizeId: number;
  connectionSizeDisplay?: string;
  financeYearId: number;
  yearCode?: string | null;
  yearlyRate: number;
  isActive: boolean;
}

export interface WaterConnectionPageData {
  property: PropertyInfo;
  connections: WaterConnection[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  typeOptions: WaterConnectionTypeLookup[];
  sizeOptions: WaterConnectionSizeLookup[];
  statusOptions: WaterConnectionStatusLookup[];
  rateMasters: WaterRateMasterLookup[];
}

export interface PagedResponse<T> {
  data?: T[];
  items?: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
