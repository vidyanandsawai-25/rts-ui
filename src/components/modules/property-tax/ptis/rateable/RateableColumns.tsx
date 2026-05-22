import { cn } from '@/lib/utils/cn';
import type {
  RateableValueDetail,
  RateableValueResponse,
  RateableValueTaxes,
  RateableRow,
} from '@/types/rateableValue.types';
import { formatIndianNumber, formatNumberPair, formatNumericDate } from '@/lib/utils/format';
import type { FloorDetailsTableColumn } from '@/components/common';
import { buildExpandedRowsHref } from '@/lib/utils/ptis';
import { renderCellBox, renderCellBoxWithTooltip } from '@/lib/utils/table-renderers';

const CELL_CLASS =
  'bg-white rounded border border-gray-300 px-1.5 py-1 text-[12px] text-center cursor-pointer hover:border-blue-400 font-bold whitespace-nowrap';
const VALUE_CLASS =
  'text-[11px] text-center truncate max-w-[100px] outline-none focus-visible:ring-1 focus-visible:ring-blue-400 whitespace-nowrap';

const EMERALD_CELL_CLASS =
  'bg-emerald-50 rounded border border-emerald-300 px-1.5 py-1 text-[12px] text-center font-bold whitespace-nowrap';

const AMBER_CELL_CLASS =
  'bg-amber-50 rounded border border-amber-300 px-1.5 py-1 text-[12px] text-center font-bold italic whitespace-nowrap';

export function getRateableDetails(
  rateableData: RateableValueResponse | null
): RateableValueDetail[] {
  if (!rateableData) return [];
  return rateableData.details ?? rateableData.items ?? [];
}

export function mapRateableRow(item: RateableValueDetail): RateableRow {
  const taxes = (Array.isArray(item.taxes) ? item.taxes : []) as RateableValueTaxes;
  return {
    id: item.propertyDetailsId,
    floor: item.floor || '-',
    constructionYear: item.constructionYear || '-',
    assessmentYear: item.assessmentYear || '-',
    constructionType: item.constructionType || '-',
    natureTypeBuilding: item.use || '-',
    subType: item.subTypeOfUse || '-',
    noOfRooms: item.noOfRooms?.toString() || '-',
    carpetArea: formatNumberPair(item.carpetAreaSqFeet, item.carpetAreaSqMeter, 2, 2),
    builtUpArea: formatNumberPair(item.builtupAreaSqFeet, item.builtupAreaSqMeter, 2, 2),
    ocNumber: item.occupancyNumber || '-',
    ocDate: formatNumericDate(item.occupancyDate),
    renterName: item.renterName || '-',
    annualRent: formatNumberPair(item.rentMonthly, item.rentYearly, 0, 0),
    appliedOn: formatNumericDate(item.occupancyDate),
    rate: formatNumberPair(item.monthlyRate, item.yearlyRate, 0, 0),
    yearlyRentalValue: formatIndianNumber(item.yearlyRent, 0, 0),
    depreciation: formatIndianNumber(item.depreciation, 0, 2),
    maintenance: formatIndianNumber(item.maintenance, 0, 0),
    alv: formatIndianNumber(item.annualRentalValue, 0, 0),
    rv: formatIndianNumber(item.rateableValue, 0, 0),
    taxes,
  };
}

export function getRateableColumns(
  t: (key: string) => string
): FloorDetailsTableColumn<RateableRow>[] {
  const column = (
    key: keyof RateableRow,
    labelKey: string,
    renderClass: string,
    fallback = '-'
  ) => ({
    key,
    label: t(`floorTable.columns.${labelKey}`),
    render: (row: RateableRow) => renderCellBox(String(row[key]), renderClass, fallback),
  });

  const columns: FloorDetailsTableColumn<RateableRow>[] = [
    column('floor', 'floor', CELL_CLASS),
    column('constructionYear', 'constYear', CELL_CLASS),
    column('assessmentYear', 'asstYear', CELL_CLASS),
    column('constructionType', 'constType', CELL_CLASS),
    column('natureTypeBuilding', 'use', CELL_CLASS),
    column('subType', 'subType', CELL_CLASS), // Using 'subType' as key from i18n json
    column('noOfRooms', 'noOfRooms', CELL_CLASS),
    column('carpetArea', 'carpetArea', CELL_CLASS),
    column('builtUpArea', 'builtupArea', CELL_CLASS),
    column('ocNumber', 'ocNumber', CELL_CLASS),
    column('ocDate', 'ocDate', CELL_CLASS),
    {
      key: 'renterName',
      label: t('floorTable.columns.renterName'),
      render: (row) => renderCellBoxWithTooltip(row.renterName, cn(CELL_CLASS, VALUE_CLASS)),
    },
    column('annualRent', 'rentMY', CELL_CLASS),
    column('appliedOn', 'appliedOn', CELL_CLASS),
    column('rate', 'rateMY', CELL_CLASS),
    {
      key: 'yearlyRentalValue',
      label: t('floorTable.columns.rentalValue'),
      render: (row) => renderCellBox(row.yearlyRentalValue, EMERALD_CELL_CLASS),
    },
    column('depreciation', 'depreciation', CELL_CLASS),
    {
      key: 'alv',
      label: t('floorTable.columns.alv'),
      render: (row) => renderCellBox(row.alv, EMERALD_CELL_CLASS),
    },
    column('maintenance', 'mr', CELL_CLASS),
    {
      key: 'rv',
      label: t('floorTable.columns.rv'),
      render: (row) => renderCellBox(row.rv, AMBER_CELL_CLASS),
    },
  ];

  return columns;
}

export function buildExpandHref(
  searchParams: Record<string, string | string[] | undefined>,
  rowId: number,
  expandedRowIds: number[]
) {
  return buildExpandedRowsHref(searchParams, rowId, expandedRowIds, 'rateableExpand');
}