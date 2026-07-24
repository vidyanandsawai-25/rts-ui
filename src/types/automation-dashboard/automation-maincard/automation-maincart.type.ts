
export interface PropertyStats {
  propertyCount: number;
  structureCount: number;
  unitCount: number;
  demand: number;
}

export interface AssessmentApprovedStats {
  assessed: PropertyStats;
  unassessed: PropertyStats;
}

export interface MainCardsData {
  previouslyRegistered: PropertyStats;
  assessmentApproved: AssessmentApprovedStats;
  additionalRevenueGenerated: PropertyStats;
}

export interface MainCardsResponse {
  success: boolean;
  message: string;
  items: MainCardsData;
  errors: unknown | null;
}

export interface WorkflowCardData {
  id:string,
  stageName: string;
  propertyCount: number;
  structureCount: number;
  unitCount: number;
}

export interface WorkflowCardsResponse {
  success: boolean;
  message: string;
  items: WorkflowCardData[];
  errors: unknown | null;
  correlationId?: string | null;
}
