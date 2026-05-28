
import { FloorTableRow } from "@/types/OldDetails/property-old-details.types";
import { FloorDetailsTableColumn } from "@/components/common/FloorDetailsTable";

/**
 * Defines the columns for the Floor Information FloorDetailsTable.
 * 
 * @param t - Translation function from next-intl
 * @returns Array of column definitions
 */
export const getFloorInformationColumns = (t: (key: string) => string): FloorDetailsTableColumn<FloorTableRow>[] => [
  {
    key: 'floor',
    label: t('floor.floorLabel'),
    render: (row) => <span className="text-xs text-gray-800">{row.floor}</span>,
  },
  {
    key: 'subFloor',
    label: t('floor.subFloor'),
    render: (row) => <span className="text-xs text-gray-800">{row.subFloor}</span>,
  },
  {
    key: 'conYr',
    label: t('floor.conYr'),
    render: (row) => <span className="text-xs text-gray-800">{row.conYr}</span>,
  },
  {
    key: 'assessmentYr',
    label: t('floor.asstYr'),
    render: (row) => <span className="text-xs text-gray-800">{row.assessmentYr}</span>,
  },
  {
    key: 'conTyp',
    label: t('floor.conTyp'),
    render: (row) => <span className="text-xs text-gray-800">{row.conTyp}</span>,
  },
  {
    key: 'use',
    label: t('floor.use'),
    render: (row) => <span className="text-xs text-gray-800">{row.use}</span>,
  },
  {
    key: 'subUse',
    label: t('floor.subTyp'),
    render: (row) => <span className="text-xs text-gray-800">{row.subUse}</span>,
  },
  {
    key: 'carpetAreaCombined',
    label: t('oldDetails.carpetformheaderArea'),
    render: (row) => <span className="text-xs font-bold text-blue-800">{row.carpetAreaCombined}</span>,
  },
  {
    key: 'builtupAreaCombined',
    label: t('oldDetails.builtupformheaderArea'),
    render: (row) => <span className="text-xs font-bold text-blue-800">{row.builtupAreaCombined}</span>,
  },
  {
    key: 'actions',
    // label: 'ACTIONS',
     label: t('commonbuttonmessages.actions'),
    sortable: false,
    render: () => <></>,
    headerClassName: 'bg-[#1e3a8a] text-white border-l border-white/30',
  },
];
