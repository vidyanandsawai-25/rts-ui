import { PagedResponse } from "../common.types";

export interface BulkUpdateMaster {
  id: number;
  updateCode: string;
  updateName: string;
  updateNameMarathi: string;
  iconName: string;
  targetTable: string;
  isActive: boolean;
  displaySequence: number;
  apiRoute: string;
  description?: string;
  category?: string | null;
}

export interface BulkUpdateFieldConfig {
  id: number;
  bulkUpdateMasterId: number;
  fieldName: string;
  displayName: string;
  displayNameMarathi: string;
  controlType: 'textbox' | 'textarea' | 'dropdown' | 'searchselect' | 'checkbox' | 'number' | 'year' | 'date' | 'file';
  dataType: string;
  placeholder?: string | null;
  isRequired: boolean;
  maxLength?: number | null;
  validationRegex?: string | null;
  defaultValue?: string | null;
  sequenceNo: number;
  isActive: boolean;
  isReadonly: boolean;
  bindApi?: string | null;
}

export interface PropertyPreviewRow {
  id: number;
  wardNo: string;
  propertyNo: string;
  partitionNo: string;
  [key: string]: string | number | boolean | null;
}

export interface PropertyFilterParams {
  zoneId?: string;
  wardId?: string;
  fromPropertyNo?: string;
  toPropertyNo?: string;
  wingId?: string;
  propertyTypeId?: string;
  updateCode?: string;
  page?: number;
  pageSize?: number;
}

export interface BulkUpdatePayload {
  updateCode: string;
  propertyIds: number[];
  updateData: Record<string, string | number | boolean>;
}

export interface BulkUpdateResponse {
  success: boolean;
  message: string;
  items: {
    totalRequested: number;
    successCount: number;
    failedCount: number;
    errors: string[];
  };
  errors: string[] | null;
  correlationId: string | null;
}

export interface ExcelImportResponse {
  success: boolean;
  message: string;
  errors?: string[] | null;
}

export type SelectOption = {
  label: string;
  value: string;
};

export interface WardOption {
  id: number;
  wardNo: string;
  wardName?: string;
}

export interface WingOption {
  id: number;
  wingName: string;
  wardId: number;
}

export interface PropertyFilterFormValues {
  zoneId: string;
  wardId: string;
  fromPropertyNo: string;
  toPropertyNo: string;
  wingId: string;
  propertyTypeId: string;
}

export interface CommonDetailsUpdatePageProps {
  menuItems: BulkUpdateMaster[];
  wardsData: PagedResponse<WardOption> | PagedResponse<{ id: number; wardNo: string }>;
  wingsData?: PagedResponse<{ id: number; wingNo: string; sequenceNo: number; isActive: boolean }>;
  initialField?: string;
  initialWardId?: string;
  initialFromProperty?: string;
  initialToProperty?: string;
  initialWing?: string;
  initialPage?: number;
  initialPageSize?: number;
  initialSearchTerm?: string;
  initialTab?: string;
  initialScopeId?: string;
  initialZoneId?: string;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; statusCode?: number };

export interface FieldRegistrySchema {
  schemaName: string;
}

export interface FieldRegistryTable {
  schemaName: string;
  tableName: string;
}

export interface FieldRegistryColumn {
  columnName: string;
  fieldName?: string;
  displayName?: string;
  displayNameMarathi?: string;
  controlType?: string;
  dataType?: string;
  placeholder?: string | null;
  isRequired?: boolean;
  maxLength?: number | null;
  validationRegex?: string | null;
  defaultValue?: string | null;
  bindApi?: string | null;
  isActive?: boolean;
}

export interface CreateFieldRegistryDto {
  updateCode: string;
  updateName: string;
  updateNameMarathi: string;
  iconName?: string;
  referenceTableName: string;
  displaySequence: number;
  apiRoute: string;
  description?: string | null;
  category?: string | null;
  isApprovalRequired: boolean;
  isActive: boolean;
  createdBy?: number | null;
  fieldConfigs: FieldRegistryFieldConfigDto[];
}

export interface FieldRegistryFieldConfigDto {
  fieldName: string;
  displayName: string;
  displayNameMarathi: string;
  controlType: string;
  dataType: string;
  placeholder?: string | null;
  isRequired: boolean;
  maxLength?: number | null;
  validationRegex?: string | null;
  defaultValue?: string | null;
  bindApi?: string | null;
  sequenceNo?: number;
}

