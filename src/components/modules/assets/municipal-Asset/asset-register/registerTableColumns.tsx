'use client';

import { useRouter } from 'next/navigation';
import { Eye, PencilLine, Printer, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { Badge, Button, Tooltip, SortableColumnHeader, type Column } from '@/components/common';
import { IconOnlyActionButton } from '@/components/common/ActionButtons';
import type { AssetRegisterRow } from '@/types/asset/asset-register/municipal-asset-register.types';
import { formatIndianCurrencyAbbreviated } from '@/lib/utils/asset-utils/currency-format';
import { cn } from '@/lib/utils/cn';

export function renderTruncatedText(value?: string) {
  const text = value || '-';
  return (
    <span className="block max-w-full whitespace-normal break-all leading-5" title={text}>
      {text}
    </span>
  );
}



export function renderCompactBadge(value?: string) {
  const text = (value || '-').toLowerCase();
  const variant: 'success' | 'destructive' | 'default' | 'warning' | 'secondary' =
    text === 'active' || text === 'yes' || text === 'true'
      ? 'success'
      : text === 'inactive' || text === 'no' || text === 'false' || text === 'poor'
        ? 'destructive'
        : text === 'good' || text === 'owned'
          ? 'default'
          : text === 'fair' || text === 'leased out'
            ? 'warning'
            : 'secondary';

  return <Badge variant={variant} size="sm" className="!text-[9px] !px-1.5 !py-0 !h-3.5 !leading-none font-bold uppercase">{value || '-'}</Badge>;
}

export function getRegisterColumns(
  pathname: string,
  router: ReturnType<typeof useRouter>,
  t: (key: string) => string,
  onViewImage?: (row: AssetRegisterRow) => void,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  onSort?: (columnKey: keyof AssetRegisterRow) => void,
  expandedSubunitRows?: Record<number, boolean>,
  loadingSubunits?: Record<number, boolean>,
  onToggleExpand?: (row: AssetRegisterRow) => void
): Column<AssetRegisterRow>[] {
  const sortableHeader = (label: string, column: keyof AssetRegisterRow, alignCenter = true) => {
    if (!onSort) return label;

    const backendKeys: Record<string, string> = {
      assetCode: 'AssetNo',
      assetName: 'AssetName',
      assetTypeName: 'AssetTypeId',
      departmentName: 'DepartmentId',
      ownershipType: 'OwnershipType',
      capitalValue: 'CapitalValue',
      lifeYears: 'AssetLife',
    };
    const activeSortKey = backendKeys[column];
    const isCurrent = sortBy === activeSortKey;
    const sortDirection = isCurrent ? sortOrder : null;

    return (
      <SortableColumnHeader
        label={label}
        sortDirection={sortDirection}
        onSort={() => onSort(column)}
        size='md'
        className={cn(
          '!bg-transparent !border-none !p-0 w-full text-slate-100 hover:text-white font-semibold transition-colors focus:ring-0 [&_svg]:!text-slate-100/80 hover:[&_svg]:!text-white [&_svg]:transition-colors',
          alignCenter ? 'justify-center' : 'justify-start'
        )}
      />
    );
  };

  return [
    {
      key: 'assetCode',
      label: sortableHeader(t('Asset_ID') || 'Asset No', 'assetCode'),
      width: '230px',
      align: 'center',
      headerClassName: 'sticky-header-1 !bg-[#0A2647] whitespace-nowrap text-center border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[230px] max-w-[230px]',
      cellClassName: 'sticky-col-1 bg-white group-hover:bg-slate-50 whitespace-normal break-all font-semibold text-slate-900 text-left align-middle border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[230px] max-w-[230px]',
      render: (_, row) => {
        const isExpanded = row.id != null && expandedSubunitRows && expandedSubunitRows[row.id];
        const isLoading = row.id != null && loadingSubunits && loadingSubunits[row.id];

        const hasSubUnits = (row.totalSubUnits ?? 0) > 0;

        return (
          <div className="flex items-center text-left w-full pl-2 gap-1.5">
            {row.isSubUnit && (
              <span className="text-slate-400 font-normal mr-1 text-xs select-none pl-2">{'↳'}</span>
            )}
            {!row.isSubUnit && row.id && onToggleExpand && hasSubUnits ? (
              <IconOnlyActionButton
                icon={isLoading ? Loader2 : isExpanded ? ChevronDown : ChevronRight}
                aria-label={isExpanded ? "Collapse" : "Expand"}
                variant="secondary"
                size="xs"
                className={cn(
                  "!h-5 !w-5 !p-0 !rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 focus:outline-none shadow-sm flex items-center justify-center [&_svg]:!h-3.5 [&_svg]:!w-3.5 [&_svg]:!stroke-[2.5]",
                  isLoading && "[&_svg]:animate-spin [&_svg]:!text-blue-500"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(row);
                }}
              />
            ) : (
              !row.isSubUnit && <div className="w-5" />
            )}
            <span
              className={`whitespace-normal break-all ${row.isSubUnit
                ? 'font-medium text-slate-500 italic'
                : hasSubUnits
                  ? 'font-semibold text-slate-900 cursor-pointer'
                  : 'font-semibold text-slate-900'
                }`}
              title={row.assetCode}
              onClick={() => {
                if (!row.isSubUnit && row.id && onToggleExpand && hasSubUnits) {
                  onToggleExpand(row);
                }
              }}
            >
              {row.assetCode}
            </span>
            {hasSubUnits && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-full select-none ml-1 shadow-sm whitespace-nowrap break-normal leading-none">
                {row.totalSubUnits}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'assetName',
      label: sortableHeader(t('Asset_Name') || 'Asset Name', 'assetName'),
      width: '240px',
      align: 'center',
      headerClassName: 'sticky-header-2 !bg-[#0A2647] whitespace-nowrap text-center border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[240px] max-w-[240px]',
      cellClassName: 'sticky-col-2 bg-white group-hover:bg-slate-50 align-middle text-center border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[240px] max-w-[240px]',
      render: (value) => <span className="whitespace-normal break-all font-semibold text-slate-900">{typeof value === 'string' ? value : '-'}</span>,
    },
    { key: 'assetTypeName', label: sortableHeader(t('Asset_Type') || 'Asset Type', 'assetTypeName'), width: '100px', align: 'center', headerClassName: 'whitespace-nowrap text-center', cellClassName: 'align-middle text-center', render: (value) => renderTruncatedText(typeof value === 'string' ? value : undefined) },
    {
      key: 'departmentName',
      label: sortableHeader(t('Owning_Department') || 'Owning Department', 'departmentName'),
      width: '120px',
      align: 'center',
      headerClassName: 'whitespace-nowrap text-center',
      cellClassName: 'align-middle text-center',
      render: (value) => renderTruncatedText(typeof value === 'string' ? value : undefined),
    },
    {
      key: 'capitalValue',
      label: sortableHeader(t('Capital_Value'), 'capitalValue'),
      width: '100px',
      align: 'center',
      headerClassName: 'whitespace-nowrap text-center',
      cellClassName: 'align-middle text-center',
      render: (_, row) => formatIndianCurrencyAbbreviated(row.capitalValue),
    },
    {
      key: 'ownershipType',
      label: sortableHeader(t('Ownership_Type') || 'Ownership Type', 'ownershipType'),
      width: '100px',
      align: 'center',
      headerClassName: 'whitespace-nowrap text-center',
      cellClassName: 'align-middle text-center',
      render: (value) => renderTruncatedText(typeof value === 'string' ? value : undefined),
    },
    {
      key: 'lifeYears',
      label: sortableHeader(t('Life_Yrs'), 'lifeYears'),
      width: '100px',
      align: 'center',
      headerClassName: 'whitespace-nowrap text-center',
      cellClassName: 'align-middle text-center',
      render: (value) => renderTruncatedText(typeof value === 'string' ? value : undefined),
    },
    {
      key: 'assetCondition',
      label: t('Condition') || 'Condition',
      width: '110px',
      align: 'center',
      headerClassName: 'whitespace-nowrap text-center',
      cellClassName: 'align-middle text-center !py-1',
      render: (_, row) => (
        <div className="flex flex-col items-center justify-center gap-0.5 leading-none">
          {renderCompactBadge(row.assetCondition)}
        </div>
      ),
    },
    {
      key: 'address',
      label: t('Address') || 'Address',
      width: '130px',
      align: 'center',
      headerClassName: 'whitespace-nowrap text-center',
      cellClassName: 'align-middle text-center',
      render: (value) => {
        const text = typeof value === 'string' ? value : '';
        if (!text || text === '-') return <span>—</span>;
        return (
          <Tooltip content={text} placement="top">
            <span className="block w-[120px] truncate cursor-help text-xs font-semibold text-slate-700 leading-tight mx-auto">
              {text}
            </span>
          </Tooltip>
        );
      },
    },
    {
      key: 'assetCategoryId',
      label: t('Asset_Image') || 'Asset Image',
      width: '100px',
      align: 'center',
      headerClassName: 'whitespace-nowrap text-center',
      cellClassName: 'align-middle text-center',
      render: (_, row) => (
        <div className="flex items-center justify-center">
          <Button
            variant="secondary"
            size="xs"
            className="text-xs font-semibold text-emerald-700 bg-emerald-55 border border-emerald-200 rounded-md py-1 px-3 h-auto hover:bg-emerald-100 hover:text-emerald-800 transition-all !bg-emerald-50 hover:!bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              onViewImage?.(row);
            }}
          >
            {t('View') || 'View'}
          </Button>
        </div>
      ),
    },
    {
      key: 'id',
      label: t('Action') || 'Action',
      width: '120px',
      align: 'center',
      headerClassName: 'sticky-header-right !bg-[#0A2647] whitespace-nowrap text-center border-l border-slate-200 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]',
      cellClassName: 'sticky-col-right bg-white group-hover:bg-slate-50 align-middle text-center border-l border-slate-200 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]',
      render: (_, row) => {
        if (row.isSubUnit) return null;
        return (
          <div className="flex items-center justify-center gap-2">
            <IconOnlyActionButton
              icon={Eye}
              aria-label={`View ${row.assetName}`}
              variant="secondary"
              className="!h-7 !w-7 !px-0 !py-0 !rounded-full !border-blue-200 !bg-blue-50 !text-blue-600 hover:!text-blue-700 hover:!bg-blue-100 hover:!border-blue-300"
              disabled={row.id == null}
              onClick={() => {
                if (row.id == null) return;
                const segments = pathname.split('/').filter(Boolean);
                const locale = segments[0] || 'en';
                router.push(`/${locale}/assets/municipal-Asset/asset-detail/${row.id}`);
              }}
            />
            <IconOnlyActionButton
              icon={Printer}
              aria-label={`Print report for ${row.assetName}`}
              title="Open report"
              variant="secondary"
              className="!h-7 !w-7 !px-0 !py-0 !rounded-full !border-amber-200 !bg-amber-50 !text-amber-600 hover:!text-amber-700 hover:!bg-amber-100 hover:!border-amber-300"
              disabled={row.id == null}
              onClick={() => {
                if (row.id == null) return;
                const segments = pathname.split('/').filter(Boolean);
                const locale = segments[0] || 'en';
                router.push(`/${locale}/assets/municipal-Asset/asset-report/${row.id}`);
              }}
            />
            <IconOnlyActionButton
              icon={PencilLine}
              aria-label={`Edit ${row.assetName}`}
              title="Edit feature coming soon"
              variant="secondary"
              className="!h-7 !w-7 !px-0 !py-0 !rounded-full !border-emerald-200 !bg-emerald-50 !text-emerald-600 hover:!text-emerald-700 hover:!bg-emerald-100 hover:!border-emerald-300 opacity-60 cursor-not-allowed"
              disabled
            />
          </div>
        );
      },
    },
  ];
}
