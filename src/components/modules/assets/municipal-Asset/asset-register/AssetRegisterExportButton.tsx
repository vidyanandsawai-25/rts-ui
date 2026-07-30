'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ExportButton } from '@/components/common';
import { toast } from 'sonner';
import type { AssetRegisterExportButtonProps } from '@/types/asset/asset-register/municipal-asset-register.types';

export function AssetRegisterExportButton({
  categoryId,
  search,
  searchField,
  AssetNo,
  AssetTypeId,
  ZoneId,
  WardId,
  DepartmentId,
  sortBy,
  sortOrder,
}: AssetRegisterExportButtonProps) {
  const t = useTranslations('assetRegister');
  const [isExporting, setIsExporting] = useState(false);
  const exportingRef = useRef(false);

  const resolveFileName = (contentDisposition: string | null) => {
    if (!contentDisposition) {
      return 'asset-register.xlsx';
    }

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;\n]+)/i);
    if (utf8Match?.[1]) {
      return decodeURIComponent(utf8Match[1].trim());
    }

    const basicMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
    if (basicMatch?.[1]) {
      return basicMatch[1].replace(/['"]/g, '').trim();
    }

    return 'asset-register.xlsx';
  };

  const handleExportExcel = async () => {
    if (exportingRef.current) {
      return;
    }

    exportingRef.current = true;
    setIsExporting(true);

    const queryParams = new URLSearchParams({
      AssetCategoryId: categoryId ? String(categoryId) : '',
      search: search || '',
      searchField: searchField || '',
      AssetNo: AssetNo || '',
      AssetTypeId: AssetTypeId && AssetTypeId !== 'all' ? String(AssetTypeId) : '',
      ZoneId: ZoneId && ZoneId !== 'all' ? String(ZoneId) : '',
      WardId: WardId && WardId !== 'all' ? String(WardId) : '',
      DepartmentId: DepartmentId && DepartmentId !== 'all' ? String(DepartmentId) : '',
      SortBy: sortBy || '',
      SortOrder: sortOrder || '',
    });

    const downloadUrl = `/api/assets/export-excel?${queryParams.toString()}`;
    let blobUrl: string | null = null;

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const fileName = resolveFileName(response.headers.get('content-disposition'));

      blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t('ExportSuccess') || 'Export downloaded successfully');
    } catch {
      toast.error(t('FailedToExport') || 'Failed to export asset register. Please try again.');
    } finally {
      if (blobUrl) {
        window.URL.revokeObjectURL(blobUrl);
      }
      exportingRef.current = false;
      setIsExporting(false);
    }
  };

  return (
    <ExportButton
      label={t('Export')}
      size="sm"
      onClick={() => {
        if (isExporting) return;
        void handleExportExcel();
      }}
      isLoading={isExporting}
      disabled={isExporting}
      className={`h-9 w-full rounded-md border-green-400 bg-white px-4 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:w-auto ${
        isExporting ? 'pointer-events-none' : ''
      }`}
    />
  );
}