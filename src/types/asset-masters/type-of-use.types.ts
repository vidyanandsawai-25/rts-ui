export interface TypeOfUseGroupFormModel {
  id?: number;
  typeOfUseGroupCode: string;
  groupName: string;
  groupIcon: string;
  isActive: boolean;
  createdBy?: number;
  updatedBy?: number;
}

export interface TypeOfUseGroup {
  [key: string]: unknown;
  id: number;
  typeOfUseGroupCode: string;
  groupName: string;
  groupIcon: string;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

// ==========================================
// ASSET TYPE OF USE TYPES
// ==========================================

export interface AssetTypeOfUseFormModel {
  id?: number;
  isActive: boolean;
  assetCategoryId: number;
  assetTypeId: number;
  typeOfUseGroupId: number;
  typeOfUseCode: string;
  description: string;
  type: string; // R, C, I, N
  searchSequence: number;
  createdBy?: number;
  updatedBy?: number;
}

export interface AssetTypeOfUse {
  [key: string]: unknown;
  id: number;
  isActive: boolean;
  assetCategoryId: number;
  assetTypeId: number;
  typeOfUseGroupId: number;
  typeOfUseCode: string;
  description: string;
  type: string;
  searchSequence: number;
  createdDate?: string;
  updatedDate?: string | null;
  // Join properties returned by API
  assetCategoryName?: string;
  assetTypeName?: string;
  typeOfUseGroupName?: string;
}

// ==========================================
// ASSET SUB-TYPE OF USE TYPES
// ==========================================

export interface AssetSubTypeOfUseFormModel {
  id?: number;
  isActive: boolean;
  typeOfUseId: number;
  description: string; // Sub-Type Name
  searchSequence: number;
  createdBy?: number;
  updatedBy?: number;
}

export interface AssetSubTypeOfUse {
  [key: string]: unknown;
  id: number;
  isActive: boolean;
  typeOfUseId: number;
  description: string;
  searchSequence: number;
  createdDate?: string;
  updatedDate?: string | null;
  // Join properties returned by API
  typeOfUseCode?: string;
  typeOfUseDescription?: string;
}

