export interface FloorFactorCVMaster {
  floorFactorId: number;
  floorId: number;
  factorWithLift: number;
  factorWithoutLift: number;
  yearRangeCVId: number;   // used in payloads
  yearRangeCVID?: number;  // returned by API (uppercase D alias)
  floorCode?: string;
  floorDescription?: string;
  fromYear?: number;
  toYear?: number;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string | null;
}

export interface FloorFactorCVMasterUpdate {
  isActive: boolean;
  updatedBy: number;
  floorId: number;
  factorWithLift: number;
  factorWithoutLift: number;
  yearRangeCVId: number;
}

export interface FloorFactorCVMasterCreate {
  isActive: boolean;
  createdBy: number;
  floorId: number;
  factorWithLift: number;
  factorWithoutLift: number;
  yearRangeCVId: number;
}

export interface FloorFactorCVBulkCreateItem {
  isActive: boolean;
  createdBy: number;
  floorId: number;
  factorWithLift: number;
  factorWithoutLift: number;
  yearRangeCVId: number;
}

export interface BulkFloorFactorCVMasterCreate {
  floorFactors: FloorFactorCVBulkCreateItem[];
}

export interface FloorFactorCVBulkUpdateItem {
  floorFactorId: number;
  floorId: number;
  factorWithLift: number;
  factorWithoutLift: number;
  yearRangeCVId: number;
}

export interface BulkFloorFactorCVMasterUpdate {
  floorFactors: FloorFactorCVBulkUpdateItem[];
}

export interface FloorFactorCVMasterQueryParams {
  floorFactorId?: number;
  floorId?: number;
  yearRangeCVId?: number;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
  filterLogic?: number;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}


export interface NatureFactorCVMaster {
  natureFactorId: number;
  constructionTypeId: number;
  factor: number;
  yearRangeCVId: number;
  constructionCode?: string;
  constructionDescription?: string;
  fromYear?: number;
  toYear?: number;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string | null;
  [key: string]: string | number | boolean | null | undefined;
}

export interface NatureFactorCVMasterUpdate {
  isActive: boolean;
  updatedBy: number;
  constructionTypeId: number;
  factor: number;
  yearRangeCVId: number;
}

export interface NatureFactorCVMasterCreate {
  isActive: boolean;
  createdBy: number;
  constructionTypeId: number;
  factor: number;
  yearRangeCVId: number;
}

export interface NatureFactorCVMasterQueryParams {
  natureFactorId?: number;
  constructionTypeId?: number;
  yearRangeCVId?: number;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
  filterLogic?: number;
}

export interface NatureFactorCVBulkCreateItem {
  isActive: boolean;
  createdBy: number;
  constructionTypeId: number;
  factor: number;
  yearRangeCVId: number;
}

export interface BulkNatureFactorCVMasterCreate {
  natureFactors: NatureFactorCVBulkCreateItem[];
}

export interface NatureFactorCVBulkUpdateItem {
  natureFactorId: number;
  constructionTypeId: number;
  factor: number;
  yearRangeCVId: number;
}

export interface BulkNatureFactorCVMasterUpdate {
  natureFactors: NatureFactorCVBulkUpdateItem[];
}

export interface UseFactorCVMaster {
  useFactorId: number;
  typeOfUseId: number;
  subTypeOfUseId: number;
  factor: number;
  yearRangeCVId: number;
  typeOfUseCode?: string;
  typeOfUseDescription?: string;
  type?: string;
  typeOfUseGroupId?: number;
  subTypeOfUseDescription?: string;
  fromYear?: number;
  toYear?: number;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string | null;
  [key: string]: string | number | boolean | null | undefined;
}

export interface UseFactorCVMasterUpdate {
  isActive: boolean;
  updatedBy: number;
  typeOfUseId: number;
  subTypeOfUseId: number;
  factor: number;
  yearRangeCVId: number;
}

export interface UseFactorCVMasterCreate {
  isActive: boolean;
  createdBy: number;
  typeOfUseId: number;
  subTypeOfUseId: number;
  factor: number;
  yearRangeCVId: number;
}

export interface UseFactorCVMasterQueryParams {
  useFactorId?: number;
  typeOfUseId?: number;
  subTypeOfUseId?: number;
  yearRangeCVId?: number;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
  filterLogic?: number;
}

export interface UseFactorCVBulkCreateItem {
  isActive: boolean;
  createdBy: number;
  typeOfUseId: number;
  subTypeOfUseId: number;
  factor: number;
  yearRangeCVId: number;
}

export interface BulkUseFactorCVMasterCreate {
  useFactors: UseFactorCVBulkCreateItem[];
}

export interface UseFactorCVBulkUpdateItem {
  useFactorId: number;
  typeOfUseId: number;
  subTypeOfUseId: number;
  factor: number;
  yearRangeCVId: number;
}

export interface BulkUseFactorCVMasterUpdate {
  useFactors: UseFactorCVBulkUpdateItem[];
}

// ---------------------------------------------
// TypeOfUse Query Parameters
// ---------------------------------------------

export interface TypeOfUseQueryParams {
  typeOfUseId?: number;
  typeOfUseCode?: string;
  type?: string;
  typeOfUseGroupId?: number;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
  filterLogic?: number;
}

export interface TypeOfUseResponse {
  typeOfUseId: number;
  typeOfUseCode: string;
  description: string;
  type?: string;
  typeOfUseGroupId?: number;
  searchKey?: string;
  searchSequence?: number;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string | null;
  [key: string]: unknown; // Index signature for dynamic property access
}

// ---------------------------------------------
// Age Factor CV Master
// ---------------------------------------------

export interface AgeFactorCVMaster {
  ageFactorId: number;
  constructionTypeId: number;
  ageFrom: number;
  ageTo: number;
  factor: number;
  yearRangeCVId: number;
  constructionCode?: string;
  constructionDescription?: string;
  fromYear?: number;
  toYear?: number;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string | null;
  [key: string]: string | number | boolean | null | undefined;
}

export interface AgeFactorCVMasterUpdate {
  isActive: boolean;
  updatedBy: number;
  constructionTypeId: number;
  ageFrom: number;
  ageTo: number;
  factor: number;
  yearRangeCVId: number;
}

export interface AgeFactorCVMasterCreate {
  isActive: boolean;
  createdBy: number;
  constructionTypeId: number;
  ageFrom: number;
  ageTo: number;
  factor: number;
  yearRangeCVId: number;
}

export interface AgeFactorCVMasterQueryParams {
  ageFactorId?: number;
  constructionTypeId?: number;
  yearRangeCVId?: number;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
  filterLogic?: number;
}

export interface AgeFactorCVBulkCreateItem {
  isActive: boolean;
  createdBy: number;
  constructionTypeId: number;
  ageFrom: number;
  ageTo: number;
  factor: number;
  yearRangeCVId: number;
}

export interface BulkAgeFactorCVMasterCreate {
  ageFactors: AgeFactorCVBulkCreateItem[];
}

export interface AgeFactorCVBulkUpdateItem {
  ageFactorId: number;
  constructionTypeId: number;
  ageFrom: number;
  ageTo: number;
  factor: number;
  yearRangeCVId: number;
  isActive: boolean;
}

export interface BulkAgeFactorCVMasterUpdate {
  ageFactors: AgeFactorCVBulkUpdateItem[];
}

