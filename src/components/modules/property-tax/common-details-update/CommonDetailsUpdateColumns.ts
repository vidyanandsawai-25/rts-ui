import React from "react";
import { Column } from "@/components/common/MasterTable";
import { PropertyPreviewRow, BulkUpdateFieldConfig } from "@/types/common-details-update/common-details-update.types";

export const getPreviewColumns = (
  t: (key: string) => string,
  fieldConfigs?: BulkUpdateFieldConfig[]
): Column<PropertyPreviewRow>[] => {
  const base: Column<PropertyPreviewRow>[] = [
    { key: "wardNo", label: t("columns.wardNo"), headerClassName: "p-2 text-[12px]" },
    { key: "propertyNo", label: t("columns.propertyNo"), headerClassName: "p-2 text-[12px]" },
    { key: "partitionNo", label: t("columns.partitionNo"), headerClassName: "p-2 text-[12px]" },
  ];

  if (fieldConfigs && fieldConfigs.length > 0) {
    fieldConfigs.forEach((config) => {
      // The API returns currentValues which we flatten, converting PascalCase keys to camelCase
      // Convert PascalCase fieldName to camelCase to match flattened keys
      const camelKey = config.fieldName.charAt(0).toLowerCase() + config.fieldName.slice(1);
      
      base.push({
        key: camelKey as keyof PropertyPreviewRow,
        label: `${t("columns.currentValuePrefix")} ${config.displayName}`,
        headerClassName: "p-2 text-[12px]",
        // Custom render to handle dynamic keys from flattened currentValues
        render: (
          _value: PropertyPreviewRow[keyof PropertyPreviewRow] | undefined, 
          row: PropertyPreviewRow
        ): React.ReactNode => {
          // Try multiple key formats to find the value
          const rawRow = row as Record<string, unknown>;
          const value = rawRow[camelKey] ?? rawRow[config.fieldName] ?? null;
          return value === null || value === undefined || value === '' ? '-' : String(value);
        },
      });
    });
  }

  return base;
};
