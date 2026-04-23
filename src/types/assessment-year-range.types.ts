import { PagedResponse } from "./common.types";

/**
 * Assessment Year Range type discriminator
 * Used to differentiate between RV (Rateable Value) and CV (Capital Value)
 */
export type AssessmentYearRangeType = "RV" | "CV";

/**
 * Base interface for Assessment Year Range entities
 * Contains common fields shared by both RV and CV
 * Index signature allows compatibility with MasterTable
 */
export interface AssessmentYearRangeBase {
  [key: string]: unknown;
  fromYear: number;
  toYear: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

/**
 * Rateable Value Assessment Year Range entity
 */
export interface AssessmentYearRangeRV extends AssessmentYearRangeBase {
  yearRangeRVId: number;
}

/**
 * Capital Value Assessment Year Range entity
 */
export interface AssessmentYearRangeCV extends AssessmentYearRangeBase {
  yearRangeCVId: number;
}

/**
 * Union type for Assessment Year Range entities
 */
export type AssessmentYearRange = AssessmentYearRangeRV | AssessmentYearRangeCV;

/**
 * Form model for creating/editing Assessment Year Range
 * Works for both RV and CV
 */
export interface AssessmentYearRangeFormModel {
  id?: number; // yearRangeRVId or yearRangeCVId
  fromYear: number | string;
  toYear: number | string;
  isActive: boolean;
  updatedBy?: number;
}

/**
 * Props for Assessment Year Range Master component
 */
export interface AssessmentYearRangeMasterProps<T extends AssessmentYearRange>
  extends Omit<PagedResponse<T>, "items" | "hasPrevious" | "hasNext"> {
  data: T[];
}

/**
 * Configuration for Assessment Year Range module
 * Defines endpoint, translations, and field mappings
 */
export interface AssessmentYearRangeConfig {
  /** Type identifier (RV or CV) */
  type: AssessmentYearRangeType;
  /** API endpoint path (without base URL) */
  endpoint: string;
  /** ID field name in the entity */
  idField: "yearRangeRVId" | "yearRangeCVId";
  /** Base path for routes */
  routePath: string;
  /** Translation namespace */
  translationNamespace: string;
}

/**
 * Type guard to check if entity is RV type
 */
export function isAssessmentYearRangeRV(
  entity: AssessmentYearRange
): entity is AssessmentYearRangeRV {
  return "yearRangeRVId" in entity;
}

/**
 * Type guard to check if entity is CV type
 */
export function isAssessmentYearRangeCV(
  entity: AssessmentYearRange
): entity is AssessmentYearRangeCV {
  return "yearRangeCVId" in entity;
}

/**
 * Get the ID from an Assessment Year Range entity
 */
export function getAssessmentYearRangeId(entity: AssessmentYearRange): number {
  if (isAssessmentYearRangeRV(entity)) {
    return entity.yearRangeRVId;
  }
  return entity.yearRangeCVId;
}

/**
 * API payload for creating Assessment Year Range
 */
export interface AssessmentYearRangeCreatePayload {
  fromYear: number;
  toYear: number;
  isActive: boolean;
  createdBy?: number;
}

/**
 * API payload for updating Assessment Year Range
 */
export interface AssessmentYearRangeUpdatePayload {
  fromYear: number;
  toYear: number;
  isActive: boolean;
  updatedBy?: number;
}
