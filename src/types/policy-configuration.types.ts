import { PagedResponse } from "./common.types";

export interface PolicyConfiguration extends Record<string, unknown> {
  id: number;
  policyCode: string;
  category: string;
  displayName: string;
  description: string;
  dataType: string;
  policyValue: string;
  defaultValue: string;
  unit: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
  createdBy?: number;
  createdDate?: string;
  updatedDate?: string | null;
}

export interface PolicyConfigurationFormModel {
  id?: number;
  policyCode: string;
  category: string;
  displayName: string;
  description: string;
  dataType: string;
  policyValue: string;
  defaultValue: string;
  unit: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
  createdBy?: number;
}

export interface PolicyConfigurationMasterProps {
  data: PolicyConfiguration[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  search?: string;
}

export type { PagedResponse };
