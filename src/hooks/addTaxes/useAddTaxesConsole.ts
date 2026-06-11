'use client';

import { useState, useTransition, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  AddTaxesConsoleApi,
  AddTaxesConsoleProps,
  AiParsedOperation,
  AuditFilters,
  AuditJobDetail,
  AuditJobRow,
  EligibleCountResult,
  ExecuteResult,
  ExcelValidationResult,
  JobStatusResult,
  OperationScope,
  OperationType,
  ProcessingOptions,
  RuntimePropertyRow,
  ScopeType,
  ValidationState,
} from '@/types/add-taxes.types';
import { PagedResponse } from '@/types/common.types';
import {
  executeOperationAction,
  getAuditDetailAction,
  getAuditListAction,
  getEligibleCountAction,
  getJobPropertiesAction,
  getJobStatusAction,
} from '@/app/[locale]/property-tax/add-taxes/actions';

const DEFAULT_OPTIONS: ProcessingOptions = {
  applyInterestPenalty: true,
  sendSms: true,
  sendEmail: false,
  previewBeforeExecute: true,
};

const DEFAULT_SCOPE: OperationScope = {};

const DEFAULT_AUDIT_FILTERS: AuditFilters = {
  search: '',
  operation: '',
  status: '',
  date: '',
};

export function useAddTaxesConsole({ init }: AddTaxesConsoleProps): AddTaxesConsoleApi {
  const t = useTranslations('addTaxes');

  // Finance year & options
  const [financeYear, setFinanceYear] = useState<string>(init.financeYears[0]?.value ?? '');
  const [options, setOptions] = useState<ProcessingOptions>(DEFAULT_OPTIONS);

  // Scope
  const [scopeType, setScopeType] = useState<ScopeType>('all');
  const [scope, setScope] = useState<OperationScope>(DEFAULT_SCOPE);
  const [eligibleResult, setEligibleResult] = useState<EligibleCountResult | null>(null);
  const [isLoadingEligible, startEligibleTransition] = useTransition();

  // Operation
  const [operation, setOperation] = useState<OperationType | null>('AddTax');

  // Review modal
  const [reviewOpen, setReviewOpen] = useState(false);

  // Execute
  const [isExecuting, setIsExecuting] = useState(false);
  const [jobResult, setJobResult] = useState<ExecuteResult | null>(null);

  // Runtime bar
  const [runtimeExpanded, setRuntimeExpanded] = useState(false);
  const [runtimeProperties, setRuntimeProperties] = useState<RuntimePropertyRow[]>([]);
  const [jobStatus, setJobStatus] = useState<JobStatusResult | null>(null);

  // Tab
  const [activeTab, setActiveTab] = useState<string>('manual');

  // Audit
  const [auditFilters, setAuditFilters] = useState<AuditFilters>(DEFAULT_AUDIT_FILTERS);
  const [auditPage, setAuditPageData] = useState<PagedResponse<AuditJobRow>>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  });
  const [auditPageNumber, setAuditPageNumber] = useState(1);
  const [isLoadingAudit, startAuditTransition] = useTransition();
  const [selectedJob, setSelectedJob] = useState<AuditJobDetail | null>(null);

  // AI
  const [aiInput, setAiInput] = useState('');
  const [aiParsed, setAiParsed] = useState<AiParsedOperation | null>(null);
  const [isParsing, startParsingTransition] = useTransition();

  // Excel
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelValidation, setExcelValidation] = useState<ExcelValidationResult | null>(null);
  const [isValidatingExcel, startValidateTransition] = useTransition();
  const [isImportingExcel, setIsImportingExcel] = useState(false);

  // ─── Validation (derived) ──────────────────────────────────────────────────
  const validation: ValidationState = {
    financeYearOk: Boolean(financeYear),
    scopeOk: scopeType === 'all'
      || (scopeType === 'zone' && (scope.zoneIds?.length ?? 0) > 0)
      || (scopeType === 'ward' && (scope.wardIds?.length ?? 0) > 0)
      || (scopeType === 'building' && Boolean(scope.zoneId) && (scope.wardIds?.length ?? 0) > 0 && Boolean(scope.building))
      || (scopeType === 'property' && ((scope.propertyIds?.length ?? 0) > 0 || Boolean(scope.searchText)))
      || (scopeType === 'range' && Boolean(scope.fromPropertyNo) && Boolean(scope.toPropertyNo)),
    eligibleOk: (eligibleResult?.eligible ?? 0) > 0,
    permissionOk: init.permissions.addTax,
    get canExecute() {
      return this.financeYearOk && this.scopeOk && this.eligibleOk && this.permissionOk && operation !== null;
    },
  };

  // ─── Eligible count ────────────────────────────────────────────────────────
  const calculateEligible = useCallback(() => {
    if (!financeYear) return;
    startEligibleTransition(async () => {
      const result = await getEligibleCountAction({ financeYear, scopeType, scope });
      if (result.success) {
        setEligibleResult(result.data);
      } else {
        toast.error(result.error);
      }
    });
  }, [financeYear, scopeType, scope]);

  // ─── Review & Execute ──────────────────────────────────────────────────────
  const openReview = useCallback(() => {
    if (!validation.canExecute) return;
    setReviewOpen(true);
  }, [validation.canExecute]);

  const closeReview = useCallback(() => setReviewOpen(false), []);

  const executeJob = useCallback(async () => {
    if (!operation || !financeYear || isExecuting) return;
    setIsExecuting(true);
    closeReview();
    setRuntimeExpanded(true);

    const result = await executeOperationAction({
      financeYear,
      scopeType,
      scope,
      operation,
      options: {
        applyInterestPenalty: options.applyInterestPenalty,
        sendSms: options.sendSms,
        sendEmail: options.sendEmail,
      },
    });

    if (result.success) {
      setJobResult(result.data);
      toast.success(
        t('messages.executionCompleted', {
          success: result.data.summary.success,
          failed: result.data.summary.failed,
        }),
      );
      // Load job properties for runtime bar
      const props = await getJobPropertiesAction(result.data.jobId);
      if (props.success) setRuntimeProperties(props.data);
      const status = await getJobStatusAction(result.data.jobId);
      if (status.success) setJobStatus(status.data);
    } else {
      toast.error(result.error ?? t('messages.executeFailed'));
    }

    setIsExecuting(false);
  }, [operation, financeYear, scopeType, scope, options, isExecuting, closeReview, t]);

  // ─── Tab navigation ────────────────────────────────────────────────────────
  const goToTab = useCallback((tab: string) => setActiveTab(tab), []);

  // ─── Audit ─────────────────────────────────────────────────────────────────
  const loadAudit = useCallback(() => {
    startAuditTransition(async () => {
      const result = await getAuditListAction(
        auditPageNumber,
        10,
        auditFilters.operation || undefined,
        auditFilters.status || undefined,
      );
      if (result.success) {
        setAuditPageData(result.data);
      } else {
        toast.error(result.error);
      }
    });
  }, [auditPageNumber, auditFilters]);

  const selectJob = useCallback((jobId: string) => {
    startAuditTransition(async () => {
      const result = await getAuditDetailAction(jobId);
      if (result.success) {
        setSelectedJob(result.data);
      } else {
        toast.error(result.error);
      }
    });
  }, []);

  const setAuditPage = useCallback((page: number) => {
    setAuditPageNumber(page);
  }, []);

  // ─── AI ────────────────────────────────────────────────────────────────────
  const parseAiRequest = useCallback(async () => {
    if (!aiInput.trim()) return;
    startParsingTransition(async () => {
      // Lightweight client-side parse stub — a real AI endpoint would go here
      setAiParsed({
        scope: aiInput,
        operation: 'Add Tax',
        eligibleRecords: 0,
        status: 'Allowed',
      });
    });
  }, [aiInput]);

  // ─── Excel ─────────────────────────────────────────────────────────────────
  const validateExcel = useCallback(async () => {
    if (!excelFile) return;
    startValidateTransition(async () => {
      // Placeholder: real validation would upload file via multipart
      setExcelValidation({
        totalRows: 0,
        eligible: 0,
        ineligible: 0,
        warnings: 0,
        rows: [],
      });
    });
  }, [excelFile]);

  const importExcel = useCallback(async () => {
    if (!excelValidation) return;
    setIsImportingExcel(true);
    // Placeholder: real import would call executeOperationAction with excel scope
    setIsImportingExcel(false);
    goToTab('audit');
    loadAudit();
  }, [excelValidation, goToTab, loadAudit]);

  return {
    // Finance year & options
    financeYear,
    setFinanceYear,
    financeYears: init.financeYears,
    options,
    setOptions,
    permissions: init.permissions,
    summary: init.summary,

    // Scope
    scopeType,
    setScopeType,
    scope,
    setScope,
    eligible: eligibleResult?.eligible ?? null,
    isLoadingEligible,
    calculateEligible,
    zones: init.scopeMaster.zones,
    propertyTypes: init.scopeMaster.propertyTypes,
    wards: init.scopeMaster.wards,

    // Operation
    operation,
    setOperation,

    // Validation
    validation,

    // Review & Execute
    openReview,
    closeReview,
    reviewOpen,
    executeJob,
    isExecuting,
    jobResult,

    // Runtime bar
    runtimeExpanded,
    setRuntimeExpanded,
    runtimeProperties,
    jobStatus,

    // Tab
    activeTab,
    goToTab,

    // Audit
    auditFilters,
    setAuditFilters,
    auditJobs: auditPage.items,
    auditTotalCount: auditPage.totalCount,
    auditPageNumber,
    auditPageSize: auditPage.pageSize,
    setAuditPage,
    isLoadingAudit,
    selectedJob,
    selectJob,
    loadAudit,

    // AI
    aiInput,
    setAiInput,
    aiParsed,
    isParsing,
    parseAiRequest,

    // Excel
    excelFile,
    setExcelFile,
    excelValidation,
    isValidatingExcel,
    isImportingExcel,
    validateExcel,
    importExcel,
  };
}
