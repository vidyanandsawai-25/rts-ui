export interface DataEntryStructureUnitProp {
  structure: number;
  unit: number;
}

export interface DataEntryCompletionProp {
  completedStructure: number;
  completedUnit: number;
  pendingStructure: number;
  pendingUnit: number;
}

export interface DataEntryPhotoPlanProp {
  complete: number;
  pending: number;
}

export interface DataEntryQAProp {
  completedStructure: number;
  completedUnit: number;
  pendingStructure: number;
  pendingUnit: number;
  typeWise: number;
}

export interface DataEntryPropertyTypeProp {
  residential: number;
  nonResidential: number;
  mixed: number;
  publicUtility: number;
  underConstruction: number;
}

export interface DataEntryAssessmentCount {
  structureCount: number;
  unitCount: number;
}

export interface DataEntryAssessmentStatusBreakdown {
  assessed: DataEntryAssessmentCount;
  unassessed: DataEntryAssessmentCount;
  newlyAssessedFound: DataEntryAssessmentCount;
  assessmentInProcess: DataEntryAssessmentCount;
}

export interface DataEntryGridData {
  divisionId: number | null;
  divisionName: string;
  zoneNo?: string;
  structure: number;
  unit: number;
  internalSurvey: DataEntryStructureUnitProp;
  dataEntry: DataEntryCompletionProp;
  photo: DataEntryPhotoPlanProp;
  plan: DataEntryPhotoPlanProp;
  qualityAnalyst: DataEntryQAProp;
  propertyType: DataEntryPropertyTypeProp;
  assessmentStatusBreakdown: DataEntryAssessmentStatusBreakdown;
}

export interface DataEntryGridItems {
  divisionData: DataEntryGridData[];
  totalRow: DataEntryGridData;
}

export interface DataEntryGridResponse {
  success: boolean;
  message: string;
  items: DataEntryGridItems[] | null;
  errors: unknown | null;
  correlationId: string | null;
}

export interface DataEntryWardData {
  wardId: number | null;
  wardNo: string;
  zoneNo?: string;
  structure: number;
  unit: number;
  internalSurvey: DataEntryStructureUnitProp;
  dataEntry: DataEntryCompletionProp;
  photo: DataEntryPhotoPlanProp;
  plan: DataEntryPhotoPlanProp;
  qualityAnalyst: DataEntryQAProp;
  propertyType: DataEntryPropertyTypeProp;
  assessmentStatusBreakdown: DataEntryAssessmentStatusBreakdown;
}

export interface DataEntryWardWiseSummaryItems {
  zoneId: number;
  zoneName: string;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  wardData: DataEntryWardData[];
  totalRow: DataEntryWardData;
}

export interface DataEntryWardWiseSummaryResponse {
  success: boolean;
  message: string;
  items: DataEntryWardWiseSummaryItems[] | null;
  errors: unknown | null;
  correlationId: string | null;
}
