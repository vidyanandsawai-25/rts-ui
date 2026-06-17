// ─── Scope / operation enums ────────────────────────────────────────────────

export const SCOPE_TYPES = ['all', 'zone', 'ward', 'building', 'property', 'range'] as const;
export type ScopeType = (typeof SCOPE_TYPES)[number];

export const OPERATIONS = ['AddTax', 'QuarterlyAdd', 'RemoveTax', 'QuarterlyRemove'] as const;
export type OperationType = (typeof OPERATIONS)[number];

export const JOB_STATUSES = ['Pending', 'InProgress', 'Completed', 'Failed'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const DETAIL_STATUSES = ['Pending', 'Processing', 'Added', 'Failed', 'Completed', 'Paused', 'Skipped'] as const;
export type DetailStatus = (typeof DETAIL_STATUSES)[number];

// ─── API DTOs ────────────────────────────────────────────────────────────────

export interface FinanceYearOption {
  value: string;
  label: string;
}

export interface ScopeOption {
  value: string;
  label: string;
}

export interface WardScopeOption extends ScopeOption {
  zoneId: string;
}

export interface PropertySearchResult {
  id: number;
  propertyNo: string;
  ownerName: string;
  mobileNo: string;
  upicId: string;
}

export interface ScopeMasterData {
  zones: ScopeOption[];
  propertyTypes: ScopeOption[];
  wards: WardScopeOption[];
}

export interface OperationPermissions {
  addTax: boolean;
  quarterlyAdd: boolean;
  removeTax: boolean;
  quarterlyRemove: boolean;
}

export interface OperationsSummary {
  totalProperties: number;
  eligibleRecords: number;
  skippedRecords: number;
  runningJobs: number;
}

export interface AddTaxesInit {
  financeYears: FinanceYearOption[];
  permissions: OperationPermissions;
  summary: OperationsSummary;
  scopeMaster: ScopeMasterData;
}

export interface OperationScope {
  zoneId?: number;
  zoneIds?: number[];
  wardIds?: number[];
  propertyTypeId?: number;
  building?: string;
  propertyIds?: number[];
  searchText?: string;
  fromPropertyNo?: string;
  toPropertyNo?: string;
}

export interface EligibleCountRequest {
  financeYear: string;
  scopeType: string;
  scope: OperationScope;
  operation: string;
}

export interface EligibleCountResult {
  total: number;
  eligible: number;
  skipped: number;
}

export interface PreviewRecord {
  propertyId: number;
  propertyNo: string;
  owner: string;
  isEligible: boolean;
  skipReason?: string;
  [key: string]: unknown;
}

export interface SkippedReason {
  reason: string;
  count: number;
}

export interface PreviewResult {
  totalSelected: number;
  eligible: number;
  skipped: number;
  requiresApproval: number;
  records: PreviewRecord[];
  skippedReasons: SkippedReason[];
}

export interface ProcessingOptions {
  applyInterestPenalty: boolean;
  sendSms: boolean;
  sendEmail: boolean;
  previewBeforeExecute: boolean;
}

export interface ExecuteRequest {
  financeYear: string;
  scopeType: string;
  scope: OperationScope;
  operation: string;
  options: {
    applyInterestPenalty: boolean;
    sendSms: boolean;
    sendEmail: boolean;
  };
}

export interface JobSummary {
  total: number;
  processed: number;
  success: number;
  failed: number;
  skipped: number;
  truncated: boolean;
}

export interface ExecuteResult {
  jobId: string;
  status: string;
  summary: JobSummary;
}

export interface JobStatusResult {
  jobId: string;
  status: string;
  total: number;
  processed: number;
  success: number;
  failed: number;
  pending: number;
  percentage: number;
}

export interface RuntimePropertyRow {
  propertyId: number;
  propertyNo: string;
  owner: string;
  taxHead: string;
  amount: number;
  status: string;
  message: string;
  [key: string]: unknown;
}

export interface AuditJobRow {
  jobId: string;
  dateTime: string;
  operation: string;
  doneBy: string;
  scope: string;
  startTime: string;
  completeTime?: string;
  duration: string;
  records: string;
  status: string;
  remarks?: string;
  [key: string]: unknown;
}

export interface ProcessingSummary {
  totalSelected: number;
  successfullyAdded: number;
  skippedRecords: number;
  failed: number;
}

export interface AuditJobDetail {
  jobId: string;
  operation: string;
  financeYear: string;
  quarter?: string;
  startedBy: string;
  userRole?: string;
  startTime: string;
  completeTime?: string;
  duration: string;
  executionLocation?: string;
  sourceIp?: string;
  device?: string;
  summary: ProcessingSummary;
  properties: RuntimePropertyRow[];
}

export interface AuditFilters {
  search: string;
  operation: string;
  status: string;
  date: string;
}

export interface ExcelRow {
  rowNum: number;
  propertyId: string;
  operation: string;
  eligibility: string;
  reason: string;
  [key: string]: unknown;
}

export interface ExcelValidationResult {
  totalRows: number;
  eligible: number;
  ineligible: number;
  warnings: number;
  rows: ExcelRow[];
}

export interface AiParsedOperation {
  scope: string;
  operation: string;
  eligibleRecords: number;
  status: string;
}

// ─── UI / Validation ─────────────────────────────────────────────────────────

export interface ValidationState {
  financeYearOk: boolean;
  scopeOk: boolean;
  eligibleOk: boolean;
  permissionOk: boolean;
  canExecute: boolean;
}

// ─── Console API (returned from orchestrator hook) ───────────────────────────

export interface AddTaxesConsoleApi {
  // Finance year & options
  financeYear: string;
  setFinanceYear: (fy: string) => void;
  financeYears: FinanceYearOption[];
  options: ProcessingOptions;
  setOptions: (opts: ProcessingOptions) => void;
  permissions: OperationPermissions;
  summary: OperationsSummary;

  // Scope
  scopeType: ScopeType;
  setScopeType: (s: ScopeType) => void;
  scope: OperationScope;
  setScope: (s: OperationScope) => void;
  eligible: number | null;
  isLoadingEligible: boolean;
  calculateEligible: () => void;
  zones: ScopeOption[];
  propertyTypes: ScopeOption[];
  wards: WardScopeOption[];

  // Operation
  operation: OperationType | null;
  setOperation: (op: OperationType) => void;

  // Validation
  validation: ValidationState;

  // Execute
  openReview: () => void;
  closeReview: () => void;
  reviewOpen: boolean;
  executeJob: () => Promise<void>;
  isExecuting: boolean;
  jobResult: ExecuteResult | null;

  // Runtime bar
  runtimeExpanded: boolean;
  setRuntimeExpanded: (v: boolean) => void;
  runtimeProperties: RuntimePropertyRow[];
  jobStatus: JobStatusResult | null;

  // Tab
  activeTab: string;
  goToTab: (tab: string) => void;

  // Audit
  auditFilters: AuditFilters;
  setAuditFilters: (f: AuditFilters) => void;
  auditJobs: AuditJobRow[];
  auditTotalCount: number;
  auditPageNumber: number;
  auditPageSize: number;
  setAuditPage: (page: number) => void;
  isLoadingAudit: boolean;
  selectedJob: AuditJobDetail | null;
  selectJob: (jobId: string) => void;
  loadAudit: () => void;

  // AI
  aiInput: string;
  setAiInput: (v: string) => void;
  aiParsed: AiParsedOperation | null;
  isParsing: boolean;
  parseAiRequest: () => Promise<void>;

  // Excel
  excelFile: File | null;
  setExcelFile: (f: File | null) => void;
  excelValidation: ExcelValidationResult | null;
  isValidatingExcel: boolean;
  isImportingExcel: boolean;
  validateExcel: () => Promise<void>;
  importExcel: () => Promise<void>;
}

export interface AddTaxesConsoleProps {
  init: AddTaxesInit;
}
