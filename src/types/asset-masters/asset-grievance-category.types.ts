import { PagedResponse } from "../common.types";

export interface AssetGrievanceCategoryFormModel {
  id?: number;
  categoryName: string;
  description: string;
  resolutionSlaDays: number;
  isActive: boolean;
}

export interface AssetGrievanceCategory {
  [key: string]: unknown;
  id: number;
  categoryName: string;
  description: string | null;
  resolutionSlaDays: number;
  isActive: boolean;
  markedForDeletion: boolean;
  createdDate: string;
  updatedDate: string | null;
}

export interface AssetGrievanceCategoryProps extends Omit<PagedResponse<AssetGrievanceCategory>, "items" | "hasPrevious" | "hasNext"> {
  data: AssetGrievanceCategory[];
  sortBy?: string;
  sortOrder?: string;
}
