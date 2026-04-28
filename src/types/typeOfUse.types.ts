export type UseStatus = "Active" | "Inactive";

export type UseGroupIconKey =
  | "home"
  | "building"
  | "factory"
  | "school"
  | "leaf"
  | "map";

// ✅ Matches API response exactly: /TypeOfUseGroup
export interface UseGroup {
  typeOfUseGroupId: number;
  typeOfUseGroupCode: string;
  groupName: string;
  groupIcon: string;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string | null;
  // UI-only computed field
  status?: UseStatus;
}

// ✅ Matches API response exactly: /TypeOfUse  
export interface UseType {
  typeOfUseId: number;
  typeOfUseCode: string;
  description: string;
  type: string;
  typeOfUseGroupId: number;
  searchKey: string;
  searchSequence: number;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string | null;
  // UI-only computed field
  status?: UseStatus;
  [key: string]: unknown; // Index signature for MasterTable compatibility
}

// ✅ Matches API response exactly: /SubTypeOfUse
export interface UseSubType {
  subTypeOfUseId: number;
  description: string;
  typeOfUseId: number;
  searchKey: string;
  searchSequence: number;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string | null;
  // UI-only computed field
  status?: UseStatus;
}

export interface TypeOfUseMasterData {
  groups: UseGroup[];
  types: UseType[];
  subTypes: UseSubType[];
}


