"use client";

import { Column } from "@/components/common/MasterTable";
import { StatusBadge } from "@/components/common";
import { WardItem } from "@/types/wardMaster.types";

interface PropertyCategoryMap {
  [key: number]: string;
}

interface PropertyTypeMap {
  [key: number]: string;
}

interface GetPropertyColumnsParams {
  t: (key: string) => string;
  pageNumber: number;
  pageSize: number;
  wards: WardItem[];
  categoryMap: PropertyCategoryMap;
  propertyTypeMap: PropertyTypeMap;
}

export function getPropertyColumns({
  t,
  pageNumber,
  pageSize,
  wards,
  categoryMap,
  propertyTypeMap,
}: GetPropertyColumnsParams): Column<Record<string, unknown>>[] {
  return [
    {
      key: "srNo",
      label: t("propertyList.columns.srNo"),
      width: "60px",
      render: (_: unknown, __: Record<string, unknown>, rowIndex: number) =>
        (pageNumber - 1) * pageSize + rowIndex + 1,
    },
    {
      key: "wardNo",
      label: t("propertyList.columns.wardNo"),
      width: "100px",
      render: (_: unknown, row: Record<string, unknown>) => {
        const ward = wards.find((w) => w.id === row.wardId);
        return ward?.wardNo || "-";
      },
    },
    {
      key: "propertyNo",
      label: t("propertyList.columns.propertyNo"),
      width: "120px",
      render: (value: unknown) => (value as string) || "-",
    },
    {
      key: "partitionNo",
      label: t("propertyList.columns.partitionNo"),
      width: "120px",
      render: (value: unknown) => (value as string) || "-",
    },
    {
      key: "categoryId",
      label: t("propertyList.columns.category"),
      width: "180px",
      render: (value: unknown) => {
        const categoryId = value as number | null;
        if (!categoryId) return "-";
        const categoryName = categoryMap[categoryId];
        return categoryName ? (
          <StatusBadge label={categoryName} variant="info" />
        ) : (
          "-"
        );
      },
    },
    {
      key: "propertyTypeId",
      label: t("propertyList.columns.type"),
      width: "150px",
      render: (value: unknown, row: Record<string, unknown>) => {
        // First check if type field has value
        const typeValue = row.type as string | null;
        if (typeValue) {
          return <StatusBadge label={typeValue} variant="pending" />;
        }
        // Otherwise use propertyTypeId
        const propertyTypeId = value as number | null;
        if (!propertyTypeId) return "-";
        const typeName = propertyTypeMap[propertyTypeId];
        return typeName ? (
          <StatusBadge label={typeName} variant="pending" />
        ) : (
          "-"
        );
      },
    },
  ];
}
