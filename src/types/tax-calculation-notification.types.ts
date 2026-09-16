export interface TaxCalculationProgressDto {
  jobId: string;
  entityType: string;
  societyDetailId: number | null;
  wingDetailId: number | null;
  processedUnits: number;
  totalUnits: number;
  percentComplete: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  message: string;
}

export interface TaxCalculationCompletedDto {
  jobId: string;
  entityType: string;
  societyDetailId: number | null;
  wingDetailId: number | null;
  totalUnits: number;
  succeededCount: number;
  failedCount: number;
  isSuccess?: boolean;
  success?: boolean;
  durationMs?: number;
  completedAt?: string;
  message?: string;
  summaryMessage?: string;
  failureDetails?: string[];
}

export interface ActiveTaxCalculationJob {
  jobId: string;
  entityType: string;
  societyDetailId: number | null;
  wingDetailId: number | null;
  processedUnits: number;
  totalUnits: number;
  percentComplete: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  message: string;
  isCompleted?: boolean;
  isSuccess?: boolean;
  succeededCount?: number;
  failedCount?: number;
  durationMs?: number;
  lastUpdated: number;
}
