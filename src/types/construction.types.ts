import { ApiResponse } from "./common.types";

/** 
 * Form model for creating and editing construction types
 * Used in UI forms to capture user input
 */
export interface ConstructionTypeFormModel {
  constructionTypeId?: number; // Optional for create, required for update
  constructionCode: string;
  description: string;
  searchSequence: number;
  isActive: boolean;
  updatedBy?: number;
}

/**
 * Server response model for construction type data
 * Represents the complete construction type record from the database
 */
export interface ConstructionType {
  [key: string]: unknown;
  constructionTypeId: number;
  constructionCode: string;
  description: string;
  searchSequence: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
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

/**
 * API payload for creating a new construction type
 */
export interface ConstructionTypeCreatePayload {
  constructionCode: string;
  description: string;
  searchSequence: number;
  isActive: boolean;
  createdBy?: number;
  createdDate?: string;
}

/**
 * Paginated response wrapper for list endpoints
 */
export type PaginatedApiResponse<T> = ApiResponse<PagedResponse<T>>;