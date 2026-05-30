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
    headerClassName: 'text-xs uppercase border-r border-white/30 font-semibold text-white text-center whitespace-nowrap',
  },
  {
    key: 'subFloor',
    label: t('floor.subFloor'),
    headerClassName: 'text-xs uppercase border-r border-white/30 font-semibold text-white text-center whitespace-nowrap',
  },
  {
    key: 'conYr',
    label: t('floor.conYr'),
    headerClassName: 'text-xs uppercase border-r border-white/30 font-semibold text-white text-center whitespace-nowrap',
  },
  {
    key: 'assessmentYr',
    label: t('floor.asstYr'),
    headerClassName: 'text-xs uppercase border-r border-white/30 font-semibold text-white text-center whitespace-nowrap',
  },
  {
    key: 'conTyp',
    label: t('floor.conTyp'),
    headerClassName: 'text-xs uppercase border-r border-white/30 font-semibold text-white text-center whitespace-nowrap',
  },
  {
    key: 'use',
    label: t('floor.use'),
    headerClassName: 'text-xs uppercase border-r border-white/30 font-semibold text-white text-center whitespace-nowrap',
  },
  {
    key: 'subUse',
    label: t('floor.subTyp'),
    headerClassName: 'text-xs uppercase border-r border-white/30 font-semibold text-white text-center whitespace-nowrap',
  },
  {
    key: 'carpetAreaCombined',
    label: t('oldDetails.carpetformheaderArea'),
    headerClassName: 'text-xs uppercase border-r border-white/30 font-semibold text-white text-center whitespace-nowrap',
    render: (value: unknown) => <span className="font-bold text-blue-800 flex w-full justify-center items-center">{String(value)}</span>
  },
  {
    key: 'builtupAreaCombined',
    label: t('oldDetails.builtupformheaderArea'),
    headerClassName: 'text-xs uppercase border-r border-white/30 font-semibold text-white text-center whitespace-nowrap',
    render: (value: unknown) => <span className="font-bold text-blue-800 flex w-full justify-center items-center">{String(value)}</span>
  },
];