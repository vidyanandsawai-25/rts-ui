"use client";

import { CheckCircle, MapPin, Calendar, Users } from "lucide-react";
import { StatusBadge, MatrixGrid } from "@/components/common";
import { MatrixGridPagination } from "@/components/common/MatrixGrid";
import { GridContainerCard, GridContainerCardHeader, GridContainerCardContent } from "@/components/common/GridContainerCard";
import type { IRateMaster, IRateValue, ISelectOption, MatrixColumn } from "@/types/RVRateMaster";

interface RateViewGridProps {
  // Data
  data: IRateMaster[];
  ratesConfiguredCount: number;
  // Columns
  columns: MatrixColumn[];
  categoryColorMap: Record<string, string>;
  // Filter labels
  selectedZone: string;
  selectedYear: string;
  selectedUseGroup: string;
  zones: ISelectOption[];
  assessmentYears: ISelectOption[];
  useGroups: ISelectOption[];
  // Zone remarks
  zoneRemarksMap: Map<string, string>;
  // Pagination
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  // Translations
  t: ReturnType<typeof import("next-intl").useTranslations>;
  tCommon: ReturnType<typeof import("next-intl").useTranslations>;
}

export function RateViewGrid({
  data,
  ratesConfiguredCount,
  columns,
  categoryColorMap,
  selectedZone,
  selectedYear,
  selectedUseGroup,
  zones,
  assessmentYears,
  useGroups,
  zoneRemarksMap,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  t,
  tCommon,
}: RateViewGridProps) {
  const useGroupLabel = useGroups.find(u => u.value === selectedUseGroup)?.label || selectedUseGroup || "";
  const matrixTranslations = {
    action: tCommon('table.columns.actions'),
    currencySymbol: "₹",
    deleteRow: tCommon('buttons.delete'),
  };

  return (
    <GridContainerCard
      variant="elevated"
      padding="none"
      className="border-2 border-blue-200 bg-blue-50"
    >
      <GridContainerCardHeader className="mb-0">
        <div className="bg-linear-to-r from-blue-100/70 via-blue-50/60 to-blue-200/40 border-b border-blue-200 px-3 md:px-4 py-1.5 md:py-2 backdrop-blur-[2px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 text-blue-900">
              <CheckCircle className="w-3.5 h-3.5 text-blue-700" />
              <span className="font-semibold text-xs md:text-sm">{t('messages.rateConfiguration')}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedZone && selectedZone !== 'ALL' && (
                <StatusBadge
                  variant="info"
                  icon={<MapPin className="w-3 h-3" />}
                  label={zones.find(z => z.value === selectedZone)?.label ?? selectedZone}
                />
              )}
              {selectedYear && selectedYear !== 'ALL' && (
                <StatusBadge
                  variant="info"
                  icon={<Calendar className="w-3 h-3" />}
                  label={assessmentYears.find(ay => String(ay.value) === String(selectedYear))?.label || String(selectedYear)}
                />
              )}
              {useGroupLabel && useGroupLabel !== 'ALL' && (
                <StatusBadge
                  variant="info"
                  icon={<Users className="w-3 h-3" />}
                  label={useGroupLabel}
                />
              )}
              <StatusBadge
                variant="info"
                icon={<CheckCircle className="w-3 h-3" />}
                label={t('messages.ratesConfigured', { count: ratesConfiguredCount })}
              />
            </div>
          </div>
        </div>
      </GridContainerCardHeader>
      <GridContainerCardContent className="bg-white p-1 md:p-2">
        {data.length > 0 ? (
          <>
            <div className="w-full overflow-x-auto">
              <MatrixGrid
                columns={columns}
                metaColumns={[
                  {
                    id: "zoneNo",
                    label: (
                      <span className="flex items-center gap-0.5 text-[13px] font-bold text-blue-700">
                        <MapPin size={12} />
                        {t("columns.taxZoneNo")}
                      </span>
                    ),
                    width: "70px"
                  },
                ]}
                rows={data.map((row, rowIndex) => {
                  const cells = Object.fromEntries(
                    columns.map((col) => {
                      let value = 0.00;
                      if (row.rates && Array.isArray(row.rates)) {
                        const rateObj = row.rates.find((r: IRateValue) =>
                          r.rateCategory?.trim().toLowerCase() === col.id.trim().toLowerCase()
                        );
                        value = (rateObj && rateObj.ratePerSqMtr != null) ? rateObj.ratePerSqMtr : 0.00;
                      } else if ((row as unknown as Record<string, unknown>)[col.id] != null) {
                        value = (row as unknown as Record<string, unknown>)[col.id] as number;
                      }
                      return [col.id, value];
                    })
                  );

                  const yearRangeLabel = (() => {
                    const yearRangeId = row.assessmentYear;
                    if (!yearRangeId) return '';
                    const yearOption = assessmentYears.find(opt => opt.value === yearRangeId);
                    return yearOption ? yearOption.label : yearRangeId;
                  })();

                  const uniqueId = row.id ?? `${row.zoneNo ?? row.zoneSection ?? 'Z'}-${row.useGroup ?? 'UG'}-${row.assessmentYear ?? 'AY'}-${rowIndex}`;
                  const zoneNoValue = row.zoneNo ?? row.zoneSection ?? "";
                  const zoneRemark = zoneRemarksMap.get(zoneNoValue) || "";

                  return {
                    id: uniqueId,
                    cells,
                    meta: {
                      zoneNo: zoneNoValue,
                      zoneNo_tooltip: zoneRemark,
                      assessmentYear: yearRangeLabel,
                    },
                  };
                })}
                colorMap={categoryColorMap}
                getCellClassName={(value) => {
                  return value > 0
                    ? "bg-blue-50 text-blue-800 border-blue-300"
                    : "bg-gray-50 text-gray-500 border-gray-200";
                }}
                translations={matrixTranslations}
              />
            </div>
            {/* Pagination outside scrollable area */}
            <div className="mt-4">
              <MatrixGridPagination
                pageNumber={pageNumber}
                pageSize={pageSize}
                totalCount={totalCount}
                totalPages={totalPages}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6 md:p-12 text-center">
            <div className="text-gray-400 text-base md:text-lg font-medium">
              {tCommon('table.noData')}
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-2">
              {t('messages.noRatesMatch')}
            </p>
          </div>
        )}
      </GridContainerCardContent>
    </GridContainerCard>
  );
}
