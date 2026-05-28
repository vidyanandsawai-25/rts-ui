"use client";

import type { Column } from "@/components/common";
import type { SearchResult } from "@/types/property-search.types";
import {
  COLUMN_WIDTHS,
  formatDisplayText,
  formatInr,
  NUMERIC_CELL,
  WRAP_CELL,
  WRAP_HEADER,
} from "./result-styles";
import { UpicLinkCell } from "./UpicLinkCell";
import { CopyCell } from "./CopyCell";
import { RvCvCell } from "./RvCvCell";

type Translator = (key: string) => string;

function withFixedWidth(
  column: Column<SearchResult>,
  width: string
): Column<SearchResult> {
  return {
    ...column,
    width,
    headerClassName: column.headerClassName ?? WRAP_HEADER,
    cellClassName: column.cellClassName ?? WRAP_CELL,
    render:
      column.render ??
      ((value) => formatDisplayText(String(value ?? ""))),
  };
}

function HolderNameCell({ row }: { row: SearchResult }) {
  return (
    <div className="flex flex-col gap-0.5 break-words whitespace-normal">
      <span>{formatDisplayText(row.holderName)}</span>
      {row.holderNameMarathi.trim() ? (
        <span className="text-xs text-gray-500">{row.holderNameMarathi}</span>
      ) : null}
    </div>
  );
}

function OccupierNameCell({ row }: { row: SearchResult }) {
  return (
    <div className="flex flex-col gap-0.5 break-words whitespace-normal">
      <span>{formatDisplayText(row.occupierName)}</span>
      {row.occupierNameMarathi.trim() ? (
        <span className="text-xs text-gray-500">{row.occupierNameMarathi}</span>
      ) : null}
    </div>
  );
}

export function buildPropertySearchColumns(
  t: Translator,
  locale: string
): Column<SearchResult>[] {
  return [
    withFixedWidth(
      {
        key: "id",
        label: t("columns.upicId"),
        render: (value, row) => (
          <UpicLinkCell
            upicId={String(value ?? "")}
            propertyId={row.propertyId}
            locale={locale}
            copyLabel={t("columns.upicId")}
          />
        ),
      },
      COLUMN_WIDTHS.upicId
    ),
    withFixedWidth({ key: "zone", label: t("columns.zone") }, COLUMN_WIDTHS.zone),
    withFixedWidth({ key: "ward", label: t("columns.ward") }, COLUMN_WIDTHS.ward),
    withFixedWidth(
      {
        key: "propertyNo",
        label: t("columns.propertyNo"),
        render: (value) => {
          const raw = String(value ?? "").trim();
          if (!raw) {
            return formatDisplayText("");
          }
          return <CopyCell value={raw} label={t("columns.propertyNo")} />;
        },
      },
      COLUMN_WIDTHS.propertyNo
    ),
    withFixedWidth(
      { key: "partitionNo", label: t("columns.partitionNo") },
      COLUMN_WIDTHS.partitionNo
    ),
    withFixedWidth(
      { key: "oldPropertyNo", label: t("columns.oldPropertyNo") },
      COLUMN_WIDTHS.oldPropertyNo
    ),
    withFixedWidth(
      { key: "citySurveyNo", label: t("columns.citySurveyNo") },
      COLUMN_WIDTHS.citySurveyNo
    ),
    withFixedWidth(
      { key: "plotNo", label: t("columns.plotNo") },
      COLUMN_WIDTHS.plotNo
    ),
    withFixedWidth(
      { key: "wingFlatNo", label: t("columns.wingFlatNo") },
      COLUMN_WIDTHS.wingFlatNo
    ),
    withFixedWidth(
      {
        key: "propertyCount",
        label: t("columns.propertyCount"),
        align: "right",
        headerClassName: `${WRAP_HEADER} whitespace-nowrap pr-4`,
        cellClassName: `${WRAP_CELL} whitespace-nowrap pr-4`,
      },
      COLUMN_WIDTHS.propertyCount
    ),
    withFixedWidth(
      {
        key: "category",
        label: t("columns.category"),
        headerClassName: `${WRAP_HEADER} pl-3`,
        cellClassName: `${WRAP_CELL} pl-3`,
      },
      COLUMN_WIDTHS.category
    ),
    withFixedWidth(
      { key: "description", label: t("columns.description") },
      COLUMN_WIDTHS.description
    ),
    withFixedWidth(
      { key: "mobile", label: t("columns.mobile") },
      COLUMN_WIDTHS.mobile
    ),
    withFixedWidth(
      {
        key: "holderName",
        label: t("columns.holderName"),
        render: (_, row) => <HolderNameCell row={row} />,
      },
      COLUMN_WIDTHS.holderName
    ),
    withFixedWidth(
      {
        key: "occupierName",
        label: t("columns.occupierName"),
        render: (_, row) => <OccupierNameCell row={row} />,
      },
      COLUMN_WIDTHS.occupierName
    ),
    withFixedWidth(
      { key: "shopBuildingName", label: t("columns.shopBuildingName") },
      COLUMN_WIDTHS.shopBuildingName
    ),
    withFixedWidth(
      { key: "societyName", label: t("columns.societyName") },
      COLUMN_WIDTHS.societyName
    ),
    withFixedWidth(
      { key: "address", label: t("columns.address") },
      COLUMN_WIDTHS.address
    ),
    withFixedWidth(
      {
        key: "rv",
        label: t("columns.rvCv"),
        align: "left",
        cellClassName: NUMERIC_CELL,
        render: (_, row) => <RvCvCell rv={row.rv} cv={row.cv} />,
      },
      COLUMN_WIDTHS.rvCv
    ),
    withFixedWidth(
      {
        key: "totalTax",
        label: t("columns.totalTax"),
        align: "right",
        render: (value) => (
          <span className="font-medium text-gray-800 whitespace-normal break-words tabular-nums">
            {formatInr(Number(value ?? 0))}
          </span>
        ),
      },
      COLUMN_WIDTHS.totalTax
    ),
  ];
}
