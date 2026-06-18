"use client";

import type { Column } from "@/components/common";
import { Tooltip } from "@/components/common";
import type { SearchResult, ZoneOption, WardOption } from "@/types/property-search.types";
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
  column: Column<SearchResult> & { tooltip?: string },
  width: string
): Column<SearchResult> {
  const { tooltip, ...rest } = column;
  const label = tooltip ? (
    <Tooltip content={tooltip} placement="top">
      <span className="cursor-help">{column.label}</span>
    </Tooltip>
  ) : (
    column.label
  );

  return {
    ...rest,
    label,
    width,
    headerClassName: column.headerClassName ?? WRAP_HEADER,
    cellClassName: column.cellClassName ?? WRAP_CELL,
    render:
      column.render ??
      ((value) => {
        const displayVal = formatDisplayText(String(value ?? ""));
        if (displayVal === "-") return <span>-</span>;
        return <span title={displayVal}>{displayVal}</span>;
      }),
  };
}

function ZoneWardCell({
  row,
  zoneOptions,
  allWardOptions,
}: {
  row: SearchResult;
  zoneOptions: ZoneOption[];
  allWardOptions: WardOption[];
}) {
  const displayZone = row.zone?.trim() || "";
  const displayWard = row.ward?.trim() || "";

  const zoneOpt = zoneOptions.find(
    (opt) => opt.label.startsWith(`${displayZone} - `) || opt.label === displayZone
  );
  const zoneLabel = zoneOpt ? zoneOpt.label : displayZone;

  const wardOpt = allWardOptions.find(
    (opt) => opt.label.startsWith(`${displayWard} - `) || opt.label === displayWard
  );
  const wardLabel = wardOpt ? wardOpt.label : displayWard;

  const tooltipText = [zoneLabel, wardLabel].filter(Boolean).join(" / ");

  return (
    <div className="flex flex-col gap-0.5 break-words whitespace-normal text-left" title={tooltipText}>
      <span className="font-semibold text-gray-800 text-[11px]">{formatDisplayText(zoneLabel)}</span>
      {wardLabel ? (
        <span className="text-[10px] text-gray-500 leading-tight">{wardLabel}</span>
      ) : null}
    </div>
  );
}

function PropertyNoPartitionCell({ row, t }: { row: SearchResult; t: Translator }) {
  const propNo = row.propertyNo?.trim() || "";
  const partNo = row.partitionNo?.trim() || "";
  const oldProp = row.oldPropertyNo?.trim() || "";

  const primary = partNo ? `${propNo}-${partNo}` : propNo;
  const tooltipText = oldProp ? `${primary} (${t("columns.oldPropertyNoShort")}: ${oldProp})` : primary;

  return (
    <div className="flex flex-col gap-0.5 break-words whitespace-normal text-left" title={tooltipText}>
      {primary ? (
        <CopyCell value={primary} label={t("columns.propertyNo")} />
      ) : (
        <span>-</span>
      )}
      {oldProp ? (
        <span className="text-xs text-gray-500">
          {t("columns.oldPropertyNoShort")}: {oldProp}
        </span>
      ) : null}
    </div>
  );
}

function OwnerOccupierCell({ row }: { row: SearchResult }) {
  const rawHolder = row.holderName?.trim() || "";
  const isPlaceholderHolder = rawHolder.toLowerCase() === "the holder";
  const holder = isPlaceholderHolder ? "" : rawHolder;
  const holderMr = isPlaceholderHolder ? "" : (row.holderNameMarathi?.trim() || "");
  const occupier = row.occupierName?.trim() || "";
  const occupierMr = row.occupierNameMarathi?.trim() || "";

  if (!holder && !occupier && !occupierMr) {
    return <span>-</span>;
  }

  const tooltipParts: string[] = [];
  if (holder) {
    tooltipParts.push(holderMr ? `${holder} (${holderMr})` : holder);
  }
  if (occupier || occupierMr) {
    tooltipParts.push(occupierMr ? `${occupier} (${occupierMr})` : occupier);
  }
  const tooltipText = tooltipParts.join(" / ");

  return (
    <div className="flex flex-col gap-1.5 break-words whitespace-normal text-left" title={tooltipText}>
      {holder ? (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-gray-900">{holder}</span>
          {holderMr ? (
            <span className="text-xs text-gray-500 font-normal">{holderMr}</span>
          ) : null}
        </div>
      ) : null}
      {occupier || occupierMr ? (
        <div className={`flex flex-col gap-0.5 pt-1 ${holder ? "border-t border-slate-100" : ""}`}>
          <span className="text-xs font-medium text-slate-700">{formatDisplayText(occupier)}</span>
          {occupierMr ? (
            <span className="text-[10px] text-gray-400 font-normal">{occupierMr}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MobileAlternateCell({ row, t }: { row: SearchResult; t: Translator }) {
  const primary = row.mobile?.trim() || "";
  const alt = row.alternateMobile?.trim() || "";
  const tooltipText = alt ? `${primary} (${t("columns.alt")}: ${alt})` : primary;

  return (
    <div className="flex flex-col gap-0.5 break-words whitespace-normal text-left" title={tooltipText}>
      {primary ? (
        <CopyCell value={primary} label={t("columns.mobile")} />
      ) : (
        <span>-</span>
      )}
      {alt ? (
        <span className="text-xs text-gray-500">
          {t("columns.alt")}: {alt}
        </span>
      ) : null}
    </div>
  );
}

export function buildPropertySearchColumns(
  t: Translator,
  locale: string,
  zoneOptions: ZoneOption[],
  allWardOptions: WardOption[]
): Column<SearchResult>[] {
  return [
    withFixedWidth(
      {
        key: "upicId",
        label: t("columns.upicId"),
        tooltip: t("columns.upicId"),
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
    withFixedWidth(
      {
        key: "zoneWard",
        label: t("columns.zoneWard"),
        tooltip: t("columns.zoneWard"),
        render: (_, row) => <ZoneWardCell row={row} zoneOptions={zoneOptions} allWardOptions={allWardOptions} />,
      },
      COLUMN_WIDTHS.zoneWard
    ),
    withFixedWidth(
      {
        key: "propertyPartition",
        label: t("columns.propertyPartition"),
        tooltip: t("columns.propertyPartitionTooltip"),
        render: (_, row) => <PropertyNoPartitionCell row={row} t={t} />,
      },
      COLUMN_WIDTHS.propertyPartition
    ),
    withFixedWidth(
      {
        key: "category",
        label: t("columns.categoryShort"),
        tooltip: t("columns.category"),
      },
      COLUMN_WIDTHS.category
    ),
    withFixedWidth(
      {
        key: "societyName",
        label: t("columns.societyNameShort"),
        tooltip: t("columns.societyName"),
      },
      COLUMN_WIDTHS.societyName
    ),
    withFixedWidth(
      {
        key: "description",
        label: t("columns.descriptionShort"),
        tooltip: t("columns.description"),
      },
      COLUMN_WIDTHS.description
    ),
    withFixedWidth(
      {
        key: "ownerOccupier",
        label: t("columns.ownerOccupier"),
        tooltip: t("columns.ownerOccupier"),
        render: (_, row) => <OwnerOccupierCell row={row} />,
      },
      COLUMN_WIDTHS.ownerOccupier
    ),
    withFixedWidth(
      {
        key: "mobileAlternate",
        label: t("columns.mobileAlternate"),
        tooltip: t("columns.mobileAlternateTooltip"),
        render: (_, row) => <MobileAlternateCell row={row} t={t} />,
      },
      COLUMN_WIDTHS.mobileAlternate
    ),
    withFixedWidth(
      {
        key: "rv",
        label: t("columns.rvCv"),
        tooltip: t("columns.rvCvTooltip"),
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
        tooltip: t("columns.totalTax"),
        render: (value) => (
          <span className="font-medium text-gray-800 whitespace-nowrap tabular-nums">
            {formatInr(Number(value ?? 0))}
          </span>
        ),
      },
      COLUMN_WIDTHS.totalTax
    ),
    withFixedWidth(
      {
        key: "address",
        label: t("columns.address"),
        tooltip: t("columns.address"),
      },
      COLUMN_WIDTHS.address
    ),
    withFixedWidth(
      {
        key: "scrollbarSpacer",
        label: "",
        render: () => null,
      },
      COLUMN_WIDTHS.scrollbarSpacer
    ),
  ];
}
