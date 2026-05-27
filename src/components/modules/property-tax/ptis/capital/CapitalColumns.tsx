import type {
  CapitalRow,
  CapitalValueItem,
  CapitalValueResponse,
} from '@/types/capitalValue.types';
import type { FloorDetailsTableColumn } from '@/components/common';
import { formatIndianNumber, formatNumberPair } from '@/lib/utils/format';
import { buildExpandedRowsHref } from '@/lib/utils/ptis';
import { renderCellBox } from '@/lib/utils/table-renderers';

const CELL_CLASS =
  'bg-white rounded border border-gray-300 px-1.5 py-1 text-[12px] text-center cursor-pointer hover:border-blue-400 font-bold whitespace-nowrap';

const FACTOR_CELL_CLASS =
  'bg-emerald-50 rounded border border-emerald-300 px-1.5 py-1 text-[12px] text-right font-bold italic whitespace-nowrap';

const TOTAL_CELL_CLASS =
  'bg-emerald-100 rounded border border-emerald-300 px-1.5 py-1 text-[12px] text-right font-bold whitespace-nowrap';

export function getCapitalItems(capitalData: CapitalValueResponse | null): CapitalValueItem[] {
  if (!capitalData) return [];
  if (Array.isArray(capitalData)) return capitalData;
  return capitalData.items ?? capitalData.details ?? [];
}

export function mapCapitalRow(item: CapitalValueItem): CapitalRow {
  return {
    id: item.propertyDetailsId,
    floor: item.floorDescription || '-',
    subFloor: item.subFloorDescription || '-',
    constructionYear: item.constructionYear || '-',
    assessmentYear: item.assessmentYear || '-',
    constructionType: item.constructionTypeDescription || '-',
    natureTypeBuilding: item.typeOfUseDescription || '-',
    subType: item.subTypeOfUseDescription || '-',
    noOfRooms: item.noOfRooms?.toString() || '-',
    carpetArea: formatNumberPair(item.carpetAreaSqFeet, item.carpetAreaSqMeter),
    builtUpArea: formatNumberPair(item.builtupAreaSqFeet, item.builtupAreaSqMeter),
    sdrrRate: formatIndianNumber(item.sdrr, 0, 2),
    baseValue: formatIndianNumber(item.baseValue, 0, 0),
    floorFactor: formatIndianNumber(item.floorFactor, 2, 2),
    ageFactor: formatIndianNumber(item.ageFactor, 2, 2),
    ntbFactor: formatIndianNumber(item.ntbFactor, 2, 2),
    useFactor: formatIndianNumber(item.useFactor, 2, 2),
    finalCapitalValue: formatIndianNumber(item.capitalValue, 0, 0),
    taxes: item.taxes ?? [],
  };
}

export function getCapitalColumns(
  t: (key: string) => string
): FloorDetailsTableColumn<CapitalRow>[] {
  const column = (key: keyof CapitalRow, labelKey: string, className: string) => ({
    key,
    label: t(`floorTable.columns.${labelKey}`),
    tooltip: t(`floorTable.tooltips.${labelKey}`),
    render: (row: CapitalRow) => renderCellBox(String(row[key]), className),
  });

  const columns: FloorDetailsTableColumn<CapitalRow>[] = [
    column('floor', 'floor', CELL_CLASS),
    column('subFloor', 'subFloor', CELL_CLASS),
    column('constructionYear', 'constYear', CELL_CLASS),
    column('assessmentYear', 'asstYear', CELL_CLASS),
    column('constructionType', 'constType', CELL_CLASS),
    column('natureTypeBuilding', 'use', CELL_CLASS),
    column('subType', 'subType', CELL_CLASS),
    column('noOfRooms', 'noOfRooms', CELL_CLASS),
    column('carpetArea', 'carpetArea', CELL_CLASS),
    column('builtUpArea', 'builtupArea', CELL_CLASS),
    column('sdrrRate', 'sdrr', CELL_CLASS),
    {
      key: 'baseValue',
      label: t('floorTable.columns.baseValue'),
      tooltip: t('floorTable.tooltips.baseValue'),
      render: (row) => renderCellBox(row.baseValue, FACTOR_CELL_CLASS),
    },
    {
      key: 'floorFactor',
      label: t('floorTable.columns.floorFactor'),
      tooltip: t('floorTable.tooltips.floorFactor'),
      render: (row) => renderCellBox(row.floorFactor, FACTOR_CELL_CLASS),
    },
    {
      key: 'ageFactor',
      label: t('floorTable.columns.ageFactor'),
      tooltip: t('floorTable.tooltips.ageFactor'),
      render: (row) => renderCellBox(row.ageFactor, FACTOR_CELL_CLASS),
    },
    {
      key: 'ntbFactor',
      label: t('floorTable.columns.ntbFactor'),
      tooltip: t('floorTable.tooltips.ntbFactor'),
      render: (row) => renderCellBox(row.ntbFactor, FACTOR_CELL_CLASS),
    },
    {
      key: 'useFactor',
      label: t('floorTable.columns.useFactor'),
      tooltip: t('floorTable.tooltips.useFactor'),
      render: (row) => renderCellBox(row.useFactor, FACTOR_CELL_CLASS),
    },
    {
      key: 'finalCapitalValue',
      label: t('floorTable.columns.capitalValue'),
      tooltip: t('floorTable.tooltips.capitalValue'),
      render: (row) => renderCellBox(row.finalCapitalValue, TOTAL_CELL_CLASS),
    },
  ];

  return columns;
}

export function buildExpandHref(
  searchParams: Record<string, string | string[] | undefined>,
  rowId: number,
  expandedRowIds: number[]
) {
  return buildExpandedRowsHref(searchParams, rowId, expandedRowIds, 'capitalExpand');
}
