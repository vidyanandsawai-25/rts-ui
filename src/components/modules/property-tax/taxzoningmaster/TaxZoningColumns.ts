import { Column } from "@/components/common/MasterTable";
import { ZoningRecord, PreviewRow } from "@/types/taxzoning.types";

/**
 * Get column definitions for the tax zoning records table
 */
export const getTaxZoningColumns = (
  t: (key: string) => string
): Column<ZoningRecord>[] => [
  { key: "wardNo", label: t('columns.wardNo') },
  { key: "fromProperty", label: t('columns.fromProperty') },
  { key: "toProperty", label: t('columns.toProperty') },
  { key: "taxZoneNo", label: t('columns.taxZoneNo') },
];

/**
 * Get column definitions for the preview table
 */
export const getPreviewColumns = (
  t: (key: string) => string
): Column<PreviewRow>[] => [
  { key: "taxZoneNo", label: t('columns.taxZoneNo'), headerClassName: "p-2 text-[12px]" },
  { key: "wardNo", label: t('columns.wardNo'), headerClassName: "p-2 text-[12px]" },
  { key: "propertyNo", label: t('columns.propertyNo'), headerClassName: "p-2 text-[12px]" },
];
