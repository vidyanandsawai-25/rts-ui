import { AssessmentYearRangeConfig } from "@/types/asset-masters/assessment-year-range.types";

/**
 * Configuration for Capital Value (CV) Assessment Year Range
 */
export const capitalValueConfig: AssessmentYearRangeConfig = {
  type: "CV",
  endpoint: "AssessmentYearRange",
  idField: "id",
  routePath: "/assets/configuration/master-data/assessment-year-range/capitalvalue",
  translationNamespace: "assessmentYearRange.capitalValue",
};
