import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { fetchAllWardsAction, getImportTemplateAction } from '@/app/[locale]/property-tax/add-taxes/actions';
import { ScopeOptionItem } from '@/types/addTaxes.types';
import { useExcelImportState } from './useExcelImportState';
import { useExcelImportActions } from './useExcelImportActions';

interface UseExcelImportProps {
  onStartExecution: (jobId: string, totalCount: number, scheduledTime?: string) => void;
  financeYearId: string;
  zoneOptions: { value: string; label: string }[];
  scopeOptions: ScopeOptionItem[];
}

export function useExcelImport({
  onStartExecution,
  financeYearId,
  zoneOptions,
  scopeOptions
}: UseExcelImportProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useExcelImportState();
  const actions = useExcelImportActions({
    state,
    onStartExecution,
    financeYearId,
    zoneOptions,
    scopeOptions
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
        const template = await getImportTemplateAction();
        if (template) state.setTemplateConfig(template);
        const wardsRes = await fetchAllWardsAction();
        if (wardsRes?.data) state.setFetchedWards(wardsRes.data);
      } catch (err) {
        console.error('Failed to initialize Excel import tab configurations', err);
      }
    };
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.isPreviewModalOpen) {
      const timer = setTimeout(() => {
        actions.handlePreview(actions.previewPage, actions.previewPageSize);
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions.previewPage, actions.previewPageSize, state.isPreviewModalOpen]);

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
      actions.processFile(e.dataTransfer.files[0]);
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
    pageNumber: actions.pageNumber,
    pageSize: actions.pageSize,
    previewPage: actions.previewPage,
    previewPageSize: actions.previewPageSize,
    setPageNumber,
    setPageSize,
    setPreviewPage,
    setPreviewPageSize,
    handleDownloadTemplate: actions.handleDownloadTemplate,
    processFile: actions.processFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRemoveFile,
    handleCalculateEligible: actions.handleCalculateEligible,
    executeJob: actions.executeJob,
    handlePreview: actions.handlePreview,
    mockCurrentScopeData: actions.mockCurrentScopeData,
    tableColumns: actions.tableColumns,
    paginatedRows: actions.paginatedRows
  };
}
