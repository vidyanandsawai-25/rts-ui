export interface ReportDefinition {
  id: number;
  reportCode: string;
  reportName: string;
  category: string;
  description: string;
  templateFile: string;
  dataProviderCode: string;
  isActive: boolean;
  sortOrder: number;
}

export type ReportParameterType = 'text' | 'number' | 'date' | 'select' | 'boolean';

export interface ReportParameterDefinition {
  id: number;
  reportDefinitionId: number;
  parameterKey: string;
  label: string;
  parameterType: ReportParameterType;
  /** For a 'select' parameter: the lookup key fetched from GET /ReportLookup/{key}. */
  optionsSource: string | null;
  /** For 'select': the parent param whose value filters options. For 'date': a min-bound (range "to"). */
  cascadeFromKey: string | null;
  isRequired: boolean;
  sortOrder: number;
}

/** One option for a 'select' parameter, returned by the generic lookup endpoint. */
export interface LookupOption {
  value: string;
  label: string;
}

export interface ZoneSummary {
  id: number;
  zoneNo: string;
  description: string;
}

export interface WardSummary {
  id: number;
  wardNo: string;
  description: string;
  zoneId: number;
}

export interface PropertySummary {
  propertyId: number;
  propertyNo: string;
  partitionNo: string;
  ownerName: string;
}

export type ReportParamValues = Record<string, string>;

export type ReportFormErrors = Partial<Record<string, string>>;

export type ReportJobStatus =
  | 'Pending'
  | 'Processing'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'
  | 'Retrying';

export interface ReportJob extends Record<string, unknown> {
  reportRequestId: string;
  reportCode: string;
  status: ReportJobStatus;
  createdDate: string;
  completedDate: string | null;
  errorMessage: string | null;
  downloadAvailable: boolean;
}

export interface ReportJobsCopy {
  title: string;
  refresh: string;
  empty: string;
  download: string;
  columns: {
    report: string;
    status: string;
    requested: string;
    completed: string;
    actions: string;
  };
  statuses: Record<ReportJobStatus, string>;
}

export interface ReportFormCopy {
  pageTitle: string;
  pageSubtitle: string;
  fields: {
    reportType: string;
  };
  buttons: {
    generate: string;
    reset: string;
  };
  placeholders: {
    selectReport: string;
    selectZone: string;
    selectWard: string;
    selectProperty: string;
    selectPartition: string;
    pendingZone: string;
    pendingWard: string;
    pendingProperty: string;
  };
  validation: {
    reportRequired: string;
    dateRangeInvalid: string;
  };
  success: {
    downloaded: string;
  };
  errors: {
    generationFailed: string;
    loadFailed: string;
  };
  proTip: {
    title: string;
    body: string;
  };
}

export interface ReportGenerationFormProps {
  copy: ReportFormCopy;
  reportDefinitions: ReportDefinition[];
  zones: ZoneSummary[];
  /** Pre-selected report code from the category grid. */
  selectedReportCode?: string;
  /** Called after a request is successfully queued, so the jobs list can refresh. */
  onQueued?: () => void;
  /** Called when the user wants to go back to the report selection grid. */
  onBack?: () => void;
}

export interface ReportsWorkspaceProps {
  copy?: ReportFormCopy;
  jobsCopy: ReportJobsCopy;
  reportDefinitions: ReportDefinition[];
  zones?: ZoneSummary[];
}

export interface ReportJobsListProps {
  jobs: ReportJob[];
  loading: boolean;
  copy: ReportJobsCopy;
  reportDefinitions: ReportDefinition[];
}
