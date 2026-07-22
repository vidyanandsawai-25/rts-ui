import type React from 'react';
import type { MasterDataRecord } from "./master-data.types";

export interface InventoryCategoryItem {
  id: number;
  typeCode: string;
  typeName: string;
  displayOrder: number;
  depreciationRate: number;
  description: string | null;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
  markedForDeletion?: boolean | number;
}

export interface InventoryCategoryListResponse {
  items: InventoryCategoryItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface InventoryCategoryListParams {
  TypeCode?: string;
  TypeName?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
  MarkedForDeletion?: boolean;
  SortBy?: string;
  SortOrder?: 'asc' | 'desc';
}

export interface InventoryCategoryPayload {
  typeCode: string;
  typeName: string;
  description?: string;
  depreciationRate?: number;
  displayOrder: number;
  isActive?: boolean;
  createdBy?: number;
  updatedBy?: number;
}

export interface InventoryCategoryFormModel {
  id?: string;
  code: string;
  name: string;
  group: string;
  depreciationRate?: string;
  description: string;
  isActive: boolean;
}

export interface FormFieldsSectionProps {
  formData: InventoryCategoryFormModel;
  errors: Record<string, string>;
  showError: (field: string) => boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  t: (key: string) => string;
}

export interface InventoryCategoryMasterErrorContextType {
  hasError: boolean;
  setHasError: (value: boolean) => void;
}

export interface InventoryCategoryFormProps {
  initialData: InventoryCategoryFormModel | null;
}

export interface InventoryCategoryMasterProps {
  data: MasterDataRecord[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  search?: string;
}

export interface InventoryCategoryMasterLayoutContentProps {
  children: React.ReactNode;
}

export interface MandatoryFieldsNoticeProps {
  message: string;
}

export interface StatusToggleCardProps {
  isActive: boolean;
  onToggle: () => void;
  activeLabel: string;
  inactiveLabel: string;
  statusLabel: string;
}
