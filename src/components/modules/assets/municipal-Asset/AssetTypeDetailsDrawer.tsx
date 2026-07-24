'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Drawer } from '@/components/common/Drawer';
import { MasterTable } from '@/components/common';
import type { Column } from '@/components/common/MasterTable';
import { formatIndianCurrencyAbbreviated } from '@/lib/utils/asset-utils/currency-format';
import { Layers } from 'lucide-react';
import type { AssetTypeDetailsDrawerProps, AssetType, AssetTypeAssetItemDto } from '@/types/asset/municipal-Asset/municipal-asset.types';

export function AssetTypeDetailsDrawer({
  isOpen,
  onClose,
  assetType,
  data = null,
  loading = false,
  pageNumber = 1,
  onPageChange,
}: AssetTypeDetailsDrawerProps) {
  const t = useTranslations('municipalAsset.drawer');

  // `name` is an explicit field on `AssetType`
  const typeName =
    assetType?.assetTypeName ?? assetType?.typeName ?? (assetType as AssetType)?.name ?? 'Unknown';

  const drawerTitle = (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xl font-black text-[#1a1a2e]">
        <Layers className="w-5 h-5 text-indigo-600" />
        {typeName}
      </div>
      <p className="text-[11px] font-medium text-slate-500">
        {t('subtitle')}
      </p>
    </div>
  );

  /**
   * Column definitions for the asset detail table.
   * Memoized to avoid creating a new array reference on every render.
   */
  const columns = useMemo<Column<AssetTypeAssetItemDto>[]>(
    () => [
      {
        key: 'assetName',
        label: t('assetName'),
        align: 'left',
        render: (_val, row) => (
          <div className="flex items-center justify-start gap-1">
            <span className="font-medium text-[#003366]">
              {row.assetName || t('unnamedAsset')}
            </span>
          </div>
        ),
      },
      {
        key: 'capitalValue',
        label: t('capitalValue'),
        align: 'center',
        render: (_val, row) => (
          <span className="font-semibold text-green-700">
            {formatIndianCurrencyAbbreviated(row.capitalValue || 0)}
          </span>
        ),
      },
    ],
    [t]
  );

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={drawerTitle}
      width="md"
    >
      <div className="p-5 flex flex-col gap-5">
        {data && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1">{t('totalAssets')}</div>
              <div className="text-2xl font-black text-indigo-900">{data.totalCount.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">{t('totalCv')}</div>
              <div className="text-xl font-black text-emerald-900">{formatIndianCurrencyAbbreviated(data.totalValuation || 0)}</div>
            </div>
          </div>
        )}

        <div className="mt-2">
          <MasterTable
            columns={columns}
            data={data?.items ?? []}
            loading={loading}
            pageNumber={pageNumber}
            pageSize={10}
            totalCount={data?.totalCount ?? 0}
            totalPages={data?.totalPages ?? 0}
            onPageChange={onPageChange || (() => {})}
            paginationConfig={{ enabled: true, showPageSizeSelector: false }}
          />
        </div>
      </div>
    </Drawer>
  );
}
