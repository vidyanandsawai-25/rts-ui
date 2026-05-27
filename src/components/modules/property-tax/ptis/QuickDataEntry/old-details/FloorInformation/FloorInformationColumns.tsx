
import { FloorTableRow } from "@/types/OldDetails/property-old-details.types";
import { Column } from "@/components/common/MasterTable";

/**
 * Defines the columns for the Floor Information MasterTable.
 * 
 * @param t - Translation function from next-intl
 * @returns Array of column definitions
 */
export const getFloorInformationColumns = (t: (key: string) => string): Column<FloorTableRow>[] => [
  {
    key: 'floor',
    label: t('floor.floorLabel'),
    // width: '120px'
  },
  {
    key: 'subFloor',
    label: t('floor.subFloor'),
    // width: '120px'
  },
  {
    key: 'conYr',
    label: t('floor.conYr'),
    // width: '120px'
  },
  {
    key: 'assessmentYr',
    label: t('floor.asstYr'),
    // width: '120px'
  },
  {
    key: 'conTyp',
    label: t('floor.conTyp'),
    // width: '220px'
  },
  {
    key: 'use',
    label: t('floor.use'),
    // width: '280px'
  },
  {
    key: 'subUse',
    label: t('floor.subTyp'),
    // width: '180px'
  },
  {
    key: 'carpetAreaSqFt',
    label: t('floor.carpetArea'),
    // width: '140px',
    render: (value: unknown) => <span className="font-bold text-blue-700">{String(value)}</span>
  },
  {
    key: 'builtupAreaSqFt',
    label: t('floor.builtupArea'),
    // width: '140px',
    render: (value: unknown) => <span className="font-bold text-blue-700">{String(value)}</span>
  },
];
