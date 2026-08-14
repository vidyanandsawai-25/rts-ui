import React from "react";
import { Column } from "@/components/common/MasterTable";
import { PropertyPreviewRow, BulkUpdateFieldConfig } from "@/types/common-details-update/common-details-update.types";

export const getPreviewColumns = (
  t: (key: string) => string,
  fieldConfigs?: BulkUpdateFieldConfig[]
): Column<PropertyPreviewRow>[] => {
  const base: Column<PropertyPreviewRow>[] = [
    {
      key: "propertyNo" as keyof PropertyPreviewRow,
      label: t("columns.propertyNo") || "Property No.",
      headerClassName: "p-2 text-[12px] whitespace-nowrap text-center",
      cellClassName: "whitespace-nowrap text-center",
      render: (_, row) => {
        const ward = String(row.wardNo || "").trim();
        const prop = String(row.propertyNo || "").trim();
        const part = String(row.partitionNo || "").trim();
        
        const parts: string[] = [];
        if (ward) parts.push(ward);
        if (prop) parts.push(prop);
        if (part && part !== "0") parts.push(part);
        
        return parts.join("-");
      }
    }
  ];

  if (fieldConfigs && fieldConfigs.length > 0) {
    const seenKeys = new Set<string>();

    fieldConfigs.forEach((config) => {
      // The API returns currentValues which we flatten, converting PascalCase keys to camelCase
      // Convert PascalCase fieldName to camelCase to match flattened keys
      const camelKey = config.fieldName.charAt(0).toLowerCase() + config.fieldName.slice(1);
      
      if (seenKeys.has(camelKey)) return;
      seenKeys.add(camelKey);
      
      base.push({
        key: camelKey as keyof PropertyPreviewRow,
        label: config.displayName,
        headerClassName: "p-2 text-[12px] whitespace-nowrap text-center",
        cellClassName: "whitespace-nowrap text-center",
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
