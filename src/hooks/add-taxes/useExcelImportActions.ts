import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
  getImportTemplateAction,
  getEligibleCountAction,
  executeOperationAction,
  previewOperationAction
} from '@/app/[locale]/property-tax/add-taxes/actions';
import { ScopeOptionItem } from '@/types/addTaxes.types';
import { autoDetectScopeType, mapExcelDataToPayload } from '@/components/modules/property-tax/add-taxes/excelImportTab/ExcelImportUtils';
import { ExcelImportState } from './useExcelImportState';
import { logger } from '@/lib/utils/logger';
import { useTranslations } from 'next-intl';

interface UseExcelImportActionsProps {
  state: ExcelImportState;
  onStartExecution: (jobId: string, totalCount: number, scheduledTime?: string) => void;
  financeYearId: string;
  zoneOptions: { value: string; label: string }[];
  scopeOptions: ScopeOptionItem[];
}

export function useExcelImportActions({
  state,
  onStartExecution,
  financeYearId,
  zoneOptions,
  scopeOptions
}: UseExcelImportActionsProps) {
  const searchParams = useSearchParams();
  const t = useTranslations('addTaxes');

  const pageNumber = Number(searchParams.get('excelPage') || '1');
  const pageSize = Number(searchParams.get('excelPageSize') || '10');
  const previewPage = Number(searchParams.get('previewPage') || '1');
  const previewPageSize = Number(searchParams.get('previewPageSize') || '5');

  const handleDownloadTemplate = async () => {
    state.setIsDownloading(true);
    try {
      const data = state.templateConfig || await getImportTemplateAction();
      const columns = data?.columns || [
        { key: "Zone", header: "Zone", dataType: "string", required: false },
        { key: "Ward", header: "Ward", dataType: "string", required: false },
        { key: "PropertyNo", header: "Property No", dataType: "string", required: false },
        { key: "UpicId", header: "UPIC Id", dataType: "string", required: false },
        { key: "MobileNo", header: "Mobile No", dataType: "string", required: false }
      ];
      const headers = (columns as { header: string }[]).map((col) => col.header);
      const worksheet = XLSX.utils.aoa_to_sheet([headers]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
      XLSX.writeFile(workbook, "property_tax_import_template.xlsx");
      toast.success(t('messages.templateDownloaded'));
    } catch (error) {
      logger.error("Failed to download Excel template", { error: error as Error });
      toast.error(t('messages.failedTemplateDownload'));
    } finally {
      state.setIsDownloading(false);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      toast.error(t('messages.invalidFileFormat'));
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error(t('messages.fileTooLarge'));
      return;
    }
    state.setFile(selectedFile);
    state.setCalculatedStats(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        if (json.length === 0) {
          toast.warning(t('messages.emptyExcelSheet'));
          state.setRows([]);
          return;
        }
        state.setRows(json as Record<string, unknown>[]);
        const detected = autoDetectScopeType(json as Record<string, unknown>[]);
        state.setSelectedScopeType(detected);
        toast.success(t('messages.uploadSuccess', {
          scope: detected === 'building'
            ? t('scopeSelection.scopes.buildingWise')
            : t('scopeSelection.scopes.propertyWise')
        }));
      } catch (err) {
        logger.error("Failed to parse excel file", { error: err as Error });
        toast.error(t('messages.failedParseExcel'));
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleCalculateEligible = async () => {
    if (state.rows.length === 0) return;
    state.setIsCalculating(true);
    try {
      const scopeData = mapExcelDataToPayload(state.rows, state.selectedScopeType, zoneOptions, state.fetchedWards);
      const payload = {
        financeYearId: String(financeYearId),
        scopeType: state.selectedScopeType,
        scope: scopeData,
        operation: 'addTax'
      };
      const result = await getEligibleCountAction(payload);
      if (result && !result.error) {
        state.setCalculatedStats(result);
        toast.success(t('messages.eligibleCalculated'));
      } else {
        state.setCalculatedStats({ eligible: 0, total: state.rows.length, skipped: state.rows.length });
        toast.error(result?.error || t('messages.failedFetchCalculation'));
      }
    } catch (error) {
      logger.error("Calculation failed", { error: error as Error });
      toast.error(t('messages.errorCalculating'));
    } finally {
      state.setIsCalculating(false);
    }
  };

  const executeJob = async (isScheduled: boolean, scheduledDateTime?: string) => {
    state.setIsValidating(true);
    try {
      const scopeData = mapExcelDataToPayload(state.rows, state.selectedScopeType, zoneOptions, state.fetchedWards);
      const payload = {
        financeYearId: Number(financeYearId),
        operation: 'addTax',
        scopeType: state.selectedScopeType,
        scope: scopeData,
        options: {
          previewBeforeExecute: true,
          isScheduled,
          ...(scheduledDateTime ? { scheduledDateTime } : {})
        }
      };
      const response = await executeOperationAction(payload);
      if (response && response.items && response.items.jobId) {
        state.setIsReviewModalOpen(false);
        if (isScheduled) {
          toast.success(t('messages.jobScheduled', { jobId: response.items.jobId }));
          onStartExecution(response.items.jobId, response.items.summary.total, scheduledDateTime);
        } else {
          toast.success(t('messages.executionStarted', { jobId: response.items.jobId }));
          onStartExecution(response.items.jobId, response.items.summary.total);
        }
      } else {
        toast.error(response?.error || t('messages.failedExecute'));
      }
    } catch (e) {
      logger.error('Failed to execute operation', { error: e as Error });
      toast.error(t('messages.errorExecution'));
    } finally {
      state.setIsValidating(false);
    }
  };

  const handlePreview = async (targetPage?: number, targetPageSize?: number) => {
    state.setIsPreviewLoading(true);
    try {
      const p = targetPage ?? previewPage;
      const size = targetPageSize ?? previewPageSize;
      const scopeData = mapExcelDataToPayload(state.rows, state.selectedScopeType, zoneOptions, state.fetchedWards);
      const payload = {
        pageNumber: p,
        pageSize: size,
        searchTerm: '',
        sortBy: '',
        sortOrder: '',
        filterLogic: 0,
        financeYearId: Number(financeYearId),
        scopeType: state.selectedScopeType,
        scope: scopeData,
        operation: 'addTax'
      };
      const result = await previewOperationAction(payload);
      if (result && !result.error) {
        state.setPreviewData(result);
        state.setIsPreviewModalOpen(true);
      } else {
        toast.error(result?.error || t('messages.failedPreview'));
      }
    } catch (e) {
      logger.error('Failed to preview operation', { error: e as Error });
      toast.error(t('messages.errorPreview'));
    } finally {
      state.setIsPreviewLoading(false);
    }
  };

  const mockCurrentScopeData = useMemo(() => {
    const match = scopeOptions.find(s => s.scopeType === state.selectedScopeType);
    if (match) return match;
    return {
      id: state.selectedScopeType === 'building' ? 3 : 4,
      name: state.selectedScopeType === 'building' ? 'BuildingWise' : 'PropertyWise',
      scopeType: state.selectedScopeType,
      displayName: state.selectedScopeType === 'building' ? 'Building Wise' : 'Property Wise',
      description: 'Excel Import Selection',
      options: []
    };
  }, [scopeOptions, state.selectedScopeType]);

  const tableColumns = useMemo(() => {
    if (state.rows.length === 0) return [];
    const keys = Object.keys(state.rows[0]);
    return keys.map(k => ({
      key: k,
      label: k,
      width: `${100 / Math.max(1, keys.length)}%`
    }));
  }, [state.rows]);

  const paginatedRows = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return state.rows.slice(start, start + pageSize);
  }, [state.rows, pageNumber, pageSize]);

  return {
    pageNumber,
    pageSize,
    previewPage,
    previewPageSize,
    handleDownloadTemplate,
    processFile,
    handleCalculateEligible,
    executeJob,
    handlePreview,
    mockCurrentScopeData,
    tableColumns,
    paginatedRows
  };
}
