import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { logger } from '@/lib/utils/logger';
import { ScopeOptionItem } from '@/types/addTaxes.types';
import type {
  ImportTemplateResponse,
  EligibleCountPayload,
  ExecuteOperationPayload,
  OperationPreviewPayload,
  OperationPreviewResponse,
} from '@/types/addTaxes.types';
import type { WardItem } from '@/types/wardMaster.types';
import { useExcelImportState } from './useExcelImportState';
import { useExcelImportActions } from './useExcelImportActions';

interface ExcelImportActionResponses {
  fetchAllWardsAction: () => Promise<{ data?: WardItem[] } | null>;
  getImportTemplateAction: () => Promise<ImportTemplateResponse | null>;
  getEligibleCountAction: (payload: EligibleCountPayload) => Promise<{ eligible?: number; total?: number; skipped?: number; error?: string } | null>;
  executeOperationAction: (payload: ExecuteOperationPayload) => Promise<{ items?: { jobId: string; summary: { total: number } }; error?: string } | null>;
  previewOperationAction: (payload: OperationPreviewPayload) => Promise<(OperationPreviewResponse & { error?: string }) | { error: string } | null>;
}

interface UseExcelImportProps {
  onStartExecution: (jobId: string, totalCount: number, scheduledTime?: string) => void;
  financeYearId: string;
  zoneOptions: { value: string; label: string }[];
  scopeOptions: ScopeOptionItem[];
  actions: ExcelImportActionResponses;
}

export function useExcelImport({
  onStartExecution,
  financeYearId,
  zoneOptions,
  scopeOptions,
  actions
}: UseExcelImportProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useExcelImportState();
  const excelActions = useExcelImportActions({
    state,
    onStartExecution,
    financeYearId,
    zoneOptions,
    scopeOptions,
    actions
  });

  const setPageNumber = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('excelPage', String(page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setPageSize = (size: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('excelPage', '1');
    params.set('excelPageSize', String(size));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setPreviewPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('previewPage', String(page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setPreviewPageSize = (size: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('previewPage', '1');
    params.set('previewPageSize', String(size));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const template = await actions.getImportTemplateAction();
        if (template) state.setTemplateConfig(template);
        const wardsRes = await actions.fetchAllWardsAction();
        if (wardsRes?.data) state.setFetchedWards(wardsRes.data);
      } catch (err) {
        logger.error('Failed to initialize Excel import tab configurations', { error: err as Error });
      }
    };
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);

  useEffect(() => {
    if (state.isPreviewModalOpen) {
      const timer = setTimeout(() => {
        excelActions.handlePreview(excelActions.previewPage, excelActions.previewPageSize);
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excelActions.previewPage, excelActions.previewPageSize, state.isPreviewModalOpen]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    state.setIsDragging(true);
  };

  const handleDragLeave = () => {
    state.setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    state.setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      excelActions.processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    state.setFile(null);
    state.setRows([]);
    state.setCalculatedStats(null);
  };

  return {
    file: state.file,
    rows: state.rows,
    selectedScopeType: state.selectedScopeType,
    setSelectedScopeType: state.setSelectedScopeType,
    isDragging: state.isDragging,
    isDownloading: state.isDownloading,
    isCalculating: state.isCalculating,
    isValidating: state.isValidating,
    calculatedStats: state.calculatedStats,
    isReviewModalOpen: state.isReviewModalOpen,
    setIsReviewModalOpen: state.setIsReviewModalOpen,
    isPreviewModalOpen: state.isPreviewModalOpen,
    setIsPreviewModalOpen: state.setIsPreviewModalOpen,
    previewData: state.previewData,
    isPreviewLoading: state.isPreviewLoading,
    pageNumber: excelActions.pageNumber,
    pageSize: excelActions.pageSize,
    previewPage: excelActions.previewPage,
    previewPageSize: excelActions.previewPageSize,
    setPageNumber,
    setPageSize,
    setPreviewPage,
    setPreviewPageSize,
    handleDownloadTemplate: excelActions.handleDownloadTemplate,
    processFile: excelActions.processFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRemoveFile,
    handleCalculateEligible: excelActions.handleCalculateEligible,
    executeJob: excelActions.executeJob,
    handlePreview: excelActions.handlePreview,
    mockCurrentScopeData: excelActions.mockCurrentScopeData,
    tableColumns: excelActions.tableColumns,
    paginatedRows: excelActions.paginatedRows
  };
}
