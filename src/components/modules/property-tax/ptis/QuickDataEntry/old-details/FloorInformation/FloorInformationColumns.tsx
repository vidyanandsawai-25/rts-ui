
import { FloorTableRow } from "@/types/property-old-details.types";
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
    label: t('floor.floorLabel')
  },
  {
    key: 'subFloor',
    label: t('floor.subFloor')
  },
  {
    key: 'conYr',
    label: t('floor.conYr')
  },
  {
    key: 'conTyp',
    label: t('floor.conTyp')
  },
  {
    key: 'use',
    label: t('floor.use')
  },
  {
    key: 'subUse',
    label: t('floor.subTyp')
  },
  {
    key: 'areaSqFt',
    label: t('floor.carpetArea'),
    render: (value: unknown) => <span className="font-bold text-blue-700">{String(value)}</span>
  },
];
