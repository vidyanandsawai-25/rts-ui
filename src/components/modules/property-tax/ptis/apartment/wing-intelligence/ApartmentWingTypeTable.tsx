'use client';
import React, { useMemo } from 'react';
import { ApartmentPropertyTypeIcon } from '../tables/ApartmentPropertyTypeIcon';
import { useTranslations } from 'next-intl';
import { Tooltip } from '@/components/common/Tooltip';
import { formatCompactCurrency, formatCompactCurrencyWithSign, formatFullCurrency } from '@/lib/utils/format';
import { MasterTable, Column } from '@/components/common/MasterTable';
import { WingType, WingTypeTableProps } from '@/types/property-tax/apartment';

const COMMON_HEADER_CLASS = '!py-1 text-[9px] font-bold uppercase tracking-wider';
const COMMON_CELL_CLASS = '!py-1 !px-1';

export const ApartmentWingTypeTable: React.FC<WingTypeTableProps> = ({ types }) => {
  const t = useTranslations('ptisRedesign.wingIntelligence');

  const columns = useMemo<Column<WingType>[]>(() => [
    {
      key: 'type',
      label: t('type') || 'Type',
      align: 'left',
      headerClassName: `${COMMON_HEADER_CLASS} !pr-1 !pl-3 text-slate-500`,
      cellClassName: '!py-1 !pr-0 !pl-0',
      render: (_val, row) => (
        <div className="flex items-center gap-1.5">
          <ApartmentPropertyTypeIcon type={row.type} />
          <span className="font-extrabold text-[10px] text-slate-700">{row.type}</span>
        </div>
      ),
    },
    {
      key: 'units',
      label: t('units') || 'Units',
      align: 'center',
      headerClassName: `${COMMON_HEADER_CLASS} !px-1 text-slate-500`,
      cellClassName: COMMON_CELL_CLASS,
      render: (_val, row) => (
        <span className="font-bold text-[10px] text-slate-800">{row.units}</span>
      ),
    },
    {
      key: 'area',
      label: t('areaSqFt') || 'Area ft²',
      align: 'center',
      headerClassName: `${COMMON_HEADER_CLASS} !px-1 text-slate-500`,
      cellClassName: COMMON_CELL_CLASS,
      render: (_val, row) => (
        <span className="font-bold text-[10px] text-slate-800">{row.area.toLocaleString()}</span>
      ),
    },
    {
      key: 'old',
      label: t('old') || 'Old',
      align: 'center',
      headerClassName: `${COMMON_HEADER_CLASS} !px-1 text-slate-400`,
      cellClassName: COMMON_CELL_CLASS,
      render: (_val, row) => (
        <Tooltip content={formatFullCurrency(row.old)}>
          <div className="font-semibold text-[10px] text-slate-500 cursor-help">{formatCompactCurrency(row.old)}</div>
        </Tooltip>
      ),
    },
    {
      key: 'cur',
      label: t('cur') || 'Cur',
      align: 'center',
      headerClassName: `${COMMON_HEADER_CLASS} !px-1 text-blue-500`,
      cellClassName: COMMON_CELL_CLASS,
      render: (_val, row) => (
        <Tooltip content={formatFullCurrency(row.cur)}>
          <div className="font-bold text-[10px] text-blue-600 cursor-help">{formatCompactCurrency(row.cur)}</div>
        </Tooltip>
      ),
    },
    {
      key: 'retro',
      label: t('retro') || 'Retro',
      align: 'center',
      headerClassName: `${COMMON_HEADER_CLASS} !px-1 text-purple-500`,
      cellClassName: COMMON_CELL_CLASS,
      render: (_val, row) => (
        <Tooltip content={formatFullCurrency(row.retro)}>
          <div className="font-bold text-[10px] text-purple-600 cursor-help">{formatCompactCurrency(row.retro)}</div>
        </Tooltip>
      ),
    },
    {
      key: 'total',
      label: t('total') || 'Total',
      align: 'center',
      headerClassName: `${COMMON_HEADER_CLASS} !px-1 text-slate-500`,
      cellClassName: COMMON_CELL_CLASS,
      render: (_val, row) => (
        <Tooltip content={formatFullCurrency(row.total)}>
          <div className="font-bold text-[10px] text-slate-900 cursor-help">{formatCompactCurrency(row.total)}</div>
        </Tooltip>
      ),
    },
    {
      key: 'rev',
      label: t('deltaRev') || 'Δ Rev',
      align: 'center',
      headerClassName: `${COMMON_HEADER_CLASS} !px-1 text-emerald-500`,
      cellClassName: COMMON_CELL_CLASS,
      render: (_val, row) => (
        <Tooltip content={formatFullCurrency(row.rev)}>
          <span className={`font-bold text-[9px] px-1 py-0.5 rounded cursor-help inline-block ${row.rev < 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
            {formatCompactCurrencyWithSign(row.rev)}
          </span>
        </Tooltip>
      ),
    },
  ], [t]);

  return (
    <div className="w-full text-[10px]">
      <MasterTable<WingType>
        columns={columns}
        data={types}
        tableClassName="w-full !text-[10px]"
        theadClassName="!bg-white bg-none [&_th]:!text-[9px] [&_th]:!py-1"
        containerClassName="!gap-0 [&>div]:!border-none [&>div]:!shadow-none [&>div]:!rounded-none [&>div]:!bg-transparent"
        maxBodyHeightClassName="max-h-[140px]"
      />
    </div>
  );
};

export default ApartmentWingTypeTable;
