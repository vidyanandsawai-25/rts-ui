import type React from 'react';
export type InventoryCondition = {
  [key: string]: unknown;
  id: number;
  inventoryItemCategoryId: number;
  conditionName: string;
  conditionFactor: number;
  displayOrder?: number;
  description: string | null;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string | null;
  markedForDeletion?: boolean | number;
};

export type ConditionType = "Asset" | "Inventory";

export type InventoryConditionFormModel = {
  id?: number | null;
  inventoryItemCategoryId: number;
  conditionType: ConditionType | "";
  conditionName: string;
  conditionFactor: number | string;
  description: string;
  isActive: boolean;
  updatedBy?: number;
}

export interface InventoryConditionCategory {
  id: number;
  categoryName: string;
}

export interface AssetConditionCategory {
  id: number;
  categoryName: string;
}

export interface InventoryConditionProps {
  data: InventoryCondition[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  categories: InventoryConditionCategory[];
}

export interface InventoryConditionMasterErrorContextType {
  hasError: boolean;
  setHasError: (value: boolean) => void;
}

export interface InventoryConditionFormFieldsSectionProps {
  formData: InventoryConditionFormModel;
  errors: Record<string, string>;
  showError: (field: string) => boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  t: (key: string) => string;
  categoryOptions: { label: string; value: string }[];
  isLoadingCategories?: boolean;
}

export interface InventoryConditionFormProps {
  id?: number;
  initialData?: InventoryConditionFormModel | null;
  inventoryCategories?: InventoryConditionCategory[];
  assetCategories?: AssetConditionCategory[];
}
