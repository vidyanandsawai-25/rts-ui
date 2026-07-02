"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { MasterTable } from "@/components/common";
import { UpicLinkCell } from "./UpicLinkCell";
import { CopyCell } from "./CopyCell";
import { OwnerOccupierCell } from "./columns";
import type { SearchResult } from "@/types/property-search";
import type { Column } from "@/components/common";

function buildApartmentUnitColumns(
  t: (key: string, values?: Record<string, string | number>) => string,
  locale: string
): Column<SearchResult>[] {
  return [
    {
      key: "upicId",
      label: t("columns.upicId"),
      width: "130px",
      render: (value, row) => (
        <UpicLinkCell
          upicId={String(value ?? "")}
          propertyId={row.propertyId}
          locale={locale}
          copyLabel={t("columns.upicId")}
        />
      ),
    },
    {
      key: "propertyPartition",
      label: t("columns.propertyPartition"),
      width: "130px",
      align: "center",
      render: (_, row) => {
        const propNo = row.propertyNo?.trim() || "";
        const partNo = row.partitionNo?.trim() || "";
        const display = partNo ? `${propNo}-${partNo}` : propNo;
        return <CopyCell value={display} label={t("columns.propertyNo")} />;
      },
    },
    {
      key: "wingFlatNo",
      label: t("columns.wingFlatNoShort"),
      width: "110px",
      align: "center",
    },
    {
      key: "category",
      label: t("columns.category"),
      width: "120px",
      align: "center",
    },
    {
      key: "description",
      label: t("columns.descriptionShort"),
      width: "120px",
      align: "center",
    },
    {
      key: "ownerOccupier",
      label: t("columns.ownerOccupier"),
      width: "220px",
      align: "center",
      render: (_, row) => <OwnerOccupierCell row={row} />,
    },
    {
      key: "mobile",
      label: t("columns.mobile"),
      width: "130px",
      align: "center",
      render: (value) =>
        value ? (
          <CopyCell value={String(value)} label={t("columns.mobile")} />
        ) : (
          <span className="text-xs text-gray-400">-</span>
        ),
    },
    {
      key: "totalTax",
      label: t("columns.totalTax"),
      width: "130px",
      align: "center",
      render: (value) => <span>{t("format.currency", { amount: Number(value ?? 0).toLocaleString("en-IN") })}</span>,
    },
    {
      key: "address",
      label: t("columns.address"),
      width: "250px",
    },
  ];
}

interface ApartmentUnitsSubTableProps {
  units: SearchResult[];
  loading: boolean;
  error: string | null;
}

export function ApartmentUnitsSubTable({
  units,
  loading,
  error,
}: ApartmentUnitsSubTableProps) {
  const t = useTranslations("propertySearch.results");
  const locale = useLocale();

  const columns = React.useMemo(() => {
    return buildApartmentUnitColumns(t, locale);
  }, [t, locale]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 px-4 bg-slate-50/50 rounded-xl border border-slate-150">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-600">{t("loadingUnits")}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100">
        {error}
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="p-4 text-center text-sm font-medium text-slate-500 bg-slate-50/50 rounded-xl border border-slate-150">
        {t("noUnits")}
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 shadow-inner text-[11px] [&_td]:!text-[11px] [&_th]:!text-[11px] [&_span]:!text-[11px] [&_button]:!text-[11px] [&_h4]:!text-[11px]">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          {t("apartmentUnits", { count: units.length })}
        </h4>
      </div>
      <MasterTable<SearchResult>
        columns={columns}
        data={units}
        loading={false}
        containerClassName="w-full min-w-0 !shadow-none !border-0 bg-transparent text-[11px] [&_td]:!text-[11px] [&_th]:!text-[11px] [&_span]:!text-[11px] [&_button]:!text-[11px]"
        tableClassName="w-full !text-[11px]"
        getRowKey={(row) => row.id}
      />
    </div>
  );
}
