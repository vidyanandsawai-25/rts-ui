// Used for TypeOfUseModal UI
export interface TypeOfUseItem {
  id: string;
  description: string;
}
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
export interface UseType extends Record<string, unknown> {
  typeOfUseId: number;
  typeOfUseCode: string;
  description: string;
  type: string;
  typeOfUseGroupId: number;
  searchSequence: number;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string | null;
  // UI-only computed field
  status?: UseStatus;
}
 
// ✅ Matches API response exactly: /SubTypeOfUse
export interface UseSubType {
  subTypeOfUseId: number;
  description: string;
  typeOfUseId: number;
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