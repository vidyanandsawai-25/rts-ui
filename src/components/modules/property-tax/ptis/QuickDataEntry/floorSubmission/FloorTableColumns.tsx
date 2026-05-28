import React from 'react';
import { DeleteButton, Tooltip } from '@/components/common';
import { FloorData } from '@/types/room-details.types';
import {
  getFloorDescription,
  getSubFloorDescription,
  getConstructionDescription,
  getUseDescription,
  getSubTypeDescription,
  LookupData,
} from '@/lib/utils/floorSubmission/floor-mappers';

interface UseFloorTableColumnsProps {
  t: (key: string, values?: Record<string, string | number | Date>) => string;
  floorLookup: LookupData[];
  subFloorLookup: LookupData[];
  constructionLookup: LookupData[];
  useLookup: LookupData[];
  subTypeData: LookupData[];
}

export const useFloorTableColumns = ({
  t,
  floorLookup,
  subFloorLookup,
  constructionLookup,
  useLookup,
  subTypeData,
}: UseFloorTableColumnsProps) => {
  return React.useMemo(() => [
    {
      key: 'isTaxable',
      label: t('floor.taxable'),
      tooltip: t('floor.taxable'),
      cellClassName: 'whitespace-nowrap',
      headerClassName: 'whitespace-nowrap',
      render: (value: unknown) => {
        const isYes = value === 'Yes' || value === true || value === 'true';
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${isYes ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            {isYes ? t('floor.yes') : t('floor.no')}
          </span>
        );
      },
    },
    {
      key: 'floor',
      label: t('floor.floorLabel'),
      tooltip: t('floor.floorLabel'),
      cellClassName: 'max-w-[100px]',
      headerClassName: 'whitespace-nowrap',
      render: (val: unknown) => {
        const text = getFloorDescription(String(val ?? ''), floorLookup) || String(val ?? '');
        return (
          <Tooltip placement="bottom" content={text}>
            <span className="block truncate cursor-default">{text}</span>
          </Tooltip>
        );
      },
    },
    {
      key: 'subFloor',
      label: t('floor.subFloor'),
      tooltip: t('floor.subFloor'),
      cellClassName: 'max-w-[150px]',
      headerClassName: 'whitespace-nowrap',
      render: (val: unknown) => {
        const text = getSubFloorDescription(String(val ?? ''), subFloorLookup) || String(val ?? '');
        return (
          <Tooltip placement="bottom" content={text}>
            <span className="block truncate cursor-default">{text}</span>
          </Tooltip>
        );
      },
    },
    {
      key: 'conYr',
      label: t('floor.conYr'),
      tooltip: t('floor.conYr'),
      cellClassName: 'whitespace-nowrap',
      headerClassName: 'whitespace-nowrap',
    },
    {
      key: 'asstYr',
      label: t('floor.asstYr'),
      tooltip: t('floor.asstYr'),
      cellClassName: 'whitespace-nowrap',
      headerClassName: 'whitespace-nowrap',
    },
    {
      key: 'conTyp',
      label: t('floor.conTyp'),
      tooltip: t('floor.conTyp'),
      cellClassName: 'max-w-[150px]',
      headerClassName: 'whitespace-nowrap',
      render: (val: unknown) => {
        const text = getConstructionDescription(String(val ?? ''), constructionLookup) || String(val ?? '');
        return (
          <Tooltip placement="bottom" content={text}>
            <span className="block truncate cursor-default">{text}</span>
          </Tooltip>
        );
      },
    },
    {
      key: 'use',
      label: t('floor.use'),
      tooltip: t('floor.use'),
      cellClassName: 'max-w-[100px]',
      headerClassName: 'whitespace-nowrap',
      render: (val: unknown) => {
        const text = getUseDescription(String(val ?? ''), useLookup) || String(val ?? '');
        return (
          <Tooltip placement="bottom" content={text}>
            <span className="block truncate cursor-default">{text}</span>
          </Tooltip>
        );
      },
    },
    {
      key: 'subTyp',
      label: t('floor.subTyp'),
      tooltip: t('floor.subTyp'),
      cellClassName: 'max-w-[100px]',
      headerClassName: 'whitespace-nowrap',
      render: (val: unknown) => {
        const text = getSubTypeDescription(String(val ?? ''), subTypeData) || String(val ?? '');
        return (
          <Tooltip placement="bottom" content={text}>
            <span className="block truncate cursor-default">{text}</span>
          </Tooltip>
        );
      },
    },
    {
      key: 'renter',
      label: t('floor.renter'),
      tooltip: t('floor.renter'),
      cellClassName: 'whitespace-nowrap',
      headerClassName: 'whitespace-nowrap',
      render: (value: unknown) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${value === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
        >
          {value === 'Yes' ? t('floor.yes') : t('floor.no')}
        </span>
      ),
    },
    {
      key: 'rooms',
      label: t('floor.rooms'),
      tooltip: t('floor.rooms'),
      cellClassName: 'whitespace-nowrap',
      headerClassName: 'whitespace-nowrap',
    },
    {
      key: 'areaSqFt',
      label: `${t('floor.carpetArea')} ${t('floor.sqFtSqM')}`,
      tooltip: t('floor.carpetArea'),
      cellClassName: 'whitespace-nowrap font-medium',
      headerClassName: 'whitespace-normal min-w-[120px] max-w-[150px] leading-tight',
      render: (_value: unknown, row: FloorData) => (
        <div className="flex items-center gap-1.5">
          <span className="text-blue-700 font-semibold">{row.areaSqFt || '0.00'}</span>
          <span className="text-[10px] text-gray-400 italic font-normal">
            ({row.areaSqM || '0.00'} {t('floor.sqM')})
          </span>
        </div>
      ),
    },
    {
      key: 'builtupAreaSqFt',
      label: `${t('floor.builtupArea')} ${t('floor.sqFtSqM')}`,
      tooltip: t('floor.builtupArea'),
      cellClassName: 'whitespace-nowrap font-medium',
      headerClassName: 'whitespace-normal min-w-[120px] max-w-[150px] leading-tight',
      render: (_value: unknown, row: FloorData) => (
        <div className="flex items-center gap-1.5">
          <span className="text-slate-700 font-semibold">{row.builtupAreaSqFt || '0.00'}</span>
          <span className="text-[10px] text-gray-400 italic font-normal">
            ({row.builtupAreaSqM || '0.00'} {t('floor.sqM')})
          </span>
        </div>
      ),
    },
  ], [t, floorLookup, subFloorLookup, constructionLookup, useLookup, subTypeData]);
};

export const renderFloorActions = (t: (key: string) => string, handleDeleteFloor: (floor: FloorData) => void) => {
  const FloorActionsCell = (row: FloorData) => {
    return (
      <DeleteButton
        aria-label={t('common.delete')}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          handleDeleteFloor(row);
        }}
      />
    );
  };

  FloorActionsCell.displayName = 'FloorActionsCell';

  return FloorActionsCell;
};
