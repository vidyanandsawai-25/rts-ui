'use client';

import { useMemo, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MasterTable } from '@/components/common';
import type { AssetRegisterRow, AssetRegisterTableProps } from '@/types/asset/asset-register/municipal-asset-register.types';
import PropertyMediaPanel from './media/PropertyMediaPanel';
import { useMediaPanelVisibility } from '@/hooks/asset/asset-register/useMediaPanelVisibility';
import { useAssetRegisterQueryState, VIEW_IMAGE_QUERY_KEY, EXPAND_ASSET_QUERY_KEY } from '@/hooks/asset/asset-register/useAssetRegisterQueryState';
import { useAssetPhotoPanel, useAssetSubunitExpansion } from '@/hooks/asset/asset-register/useAssetRegisterInteractions';
import { getRegisterColumns } from './registerTableColumns';
import { useQueryTransition } from '@/hooks/useQueryTransition';
import { mapSubUnitToAssetRegisterRow } from './registerMappers';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function AssetRegisterTable({
  assets,
  totalCount,
  pageNumber,
  pageSize,
  totalPages,
  controls,
  sortBy = '',
  sortOrder = 'asc',
}: AssetRegisterTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('assetRegister');
  const { updateQueries } = useQueryTransition();

  const { isPanelVisible, togglePanel } = useMediaPanelVisibility(false);
  const {
    panelPhotos,
    isPhotosLoading,
    openImagePanelByAssetId,
    handlePanelToggle: handlePanelVisibilityToggle,
    closePanelFromQueryTransition,
  } = useAssetPhotoPanel({
    isPanelVisible,
    togglePanel,
  });

  const {
    expandedAssets,
    openSubunitRows,
    loadingSubunits,
    setOpenSubunitRows,
    handleToggleExpand: handleSubunitToggle,
  } = useAssetSubunitExpansion();

  const { updateActionQuery } = useAssetRegisterQueryState({
    searchParams,
    pathname,
    isPanelVisible,
    onClosePanelFromQuery: closePanelFromQueryTransition,
    expandedAssets,
    setOpenSubunitRows,
  });

  const handlePanelToggle = useCallback(() => {
    handlePanelVisibilityToggle(() => {
      updateActionQuery(VIEW_IMAGE_QUERY_KEY, null);
    });
  }, [handlePanelVisibilityToggle, updateActionQuery]);

  const handlePageChange = useCallback((newPage: number) => {
    updateQueries({ page: String(newPage) });
  }, [updateQueries]);

  const handlePageSizeChange = (newSize: number) => {
    updateQueries({ pageSize: String(newSize), page: '1' });
  };

  const handleViewImage = useCallback((row: AssetRegisterRow) => {
    if (row.id == null) return;
    updateActionQuery(VIEW_IMAGE_QUERY_KEY, String(row.id));
    void openImagePanelByAssetId(row.id);
  }, [updateActionQuery, openImagePanelByAssetId]);

  const handleSort = useCallback((columnKey: keyof AssetRegisterRow) => {
    const backendKeys: Record<string, string> = {
      assetCode: 'AssetNo',
      assetName: 'AssetName',
      assetTypeName: 'AssetTypeId',
      departmentName: 'DepartmentId',
      ownershipType: 'OwnershipType',
      capitalValue: 'CapitalValue',
      lifeYears: 'AssetLife',
    };
    const mappedKey = backendKeys[columnKey];
    if (!mappedKey) return;

    let nextOrder: 'asc' | 'desc' = 'asc';
    if (sortBy === mappedKey) {
      nextOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    updateQueries({ sortBy: mappedKey, sortOrder: nextOrder, page: '1' });
  }, [sortBy, sortOrder, updateQueries]);

  const handleToggleExpand = useCallback(async (parentRow: AssetRegisterRow) => {
    await handleSubunitToggle(parentRow, (parentId) => {
      updateActionQuery(EXPAND_ASSET_QUERY_KEY, parentId == null ? null : String(parentId));
    });
  }, [handleSubunitToggle, updateActionQuery]);

  const columns = useMemo(
    () => getRegisterColumns(pathname, router, t, handleViewImage, sortBy, sortOrder, handleSort, openSubunitRows, loadingSubunits, handleToggleExpand),
    [pathname, router, t, handleViewImage, sortBy, sortOrder, handleSort, openSubunitRows, loadingSubunits, handleToggleExpand]
  );

  const tableData = useMemo(() => {
    const result: AssetRegisterRow[] = [];
    for (const asset of assets) {
      result.push(asset);
      const parentId = asset.id;
      if (parentId != null && openSubunitRows[parentId] && expandedAssets[parentId]) {
        for (const subUnit of expandedAssets[parentId]) {
          result.push(mapSubUnitToAssetRegisterRow(subUnit, asset));
        }
      }
    }
    return result;
  }, [assets, expandedAssets, openSubunitRows]);


  return (
    <div className="flex flex-col gap-4 w-full">
      {controls}
      <div className="relative w-full">
        <MasterTable<AssetRegisterRow>
          columns={columns}
          data={tableData}
          loading={false}
          emptyText={t('No_asset_records') || 'No asset records found for this category'}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          paginationConfig={{ enabled: true, showPageSizeSelector: true }}
          maxBodyHeightClassName="max-h-[calc(100vh-420px)] min-h-[300px]"
          containerClassName="rounded-lg w-full overflow-x-auto"
          tableClassName="table-fixed w-max min-w-full border-collapse border border-slate-200 [&_th]:border [&_th]:border-slate-200 [&_td]:border [&_td]:border-slate-200 [&_.sticky-col-1]:!sticky [&_.sticky-col-1]:!left-0 [&_.sticky-col-1]:!z-10 [&_.sticky-col-2]:!sticky [&_.sticky-col-2]:!left-[230px] [&_.sticky-col-2]:!z-10 [&_.sticky-col-right]:!sticky [&_.sticky-col-right]:!right-0 [&_.sticky-col-right]:!z-10 [&_.sticky-header-1]:!sticky [&_.sticky-header-1]:!left-0 [&_.sticky-header-1]:!z-30 [&_.sticky-header-2]:!sticky [&_.sticky-header-2]:!left-[230px] [&_.sticky-header-2]:!z-30 [&_.sticky-header-right]:!sticky [&_.sticky-header-right]:!right-0 [&_.sticky-header-right]:!z-30"
          theadClassName="bg-none bg-[#0A2647] [&_th]:!text-white [&_th]:!font-bold [&_th]:!text-[12px] sm:[&_th]:!text-[13px]"
          rowClassName={(row, index) => {
            if (row.isSubUnit) {
              return 'font-medium text-slate-800 [&>td]:!bg-[#e0f0ff] hover:[&>td]:!bg-[#d0e6ff]';
            }
            return index % 2 === 0 ? 'bg-white' : 'bg-slate-50';
          }}
          getRowKey={(row, index) => row.isSubUnit ? `sub-${row.parentId}-${row.id}-${index}` : (row.id ?? `${row.assetCode}-${index}`)}
        />

        {/* Sidebar Container with smooth width & opacity transition */}
        <div
          className={`transition-all duration-500 ease-in-out z-30 lg:absolute lg:right-0 lg:top-0 lg:bg-white lg:rounded-l-xl ${isPanelVisible
            ? 'w-full lg:w-[232px] opacity-100 translate-x-0 lg:p-3 lg:border lg:border-slate-200 lg:shadow-2xl'
            : 'w-0 lg:w-0 opacity-0 lg:translate-x-full pointer-events-none overflow-hidden lg:p-0 lg:border-none lg:shadow-none'
            }`}
        >
          <div className="w-full lg:w-[208px] lg:h-full">
            <PropertyMediaPanel
              initialPhotos={panelPhotos}
              loading={isPhotosLoading}
              togglePanel={handlePanelToggle}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
