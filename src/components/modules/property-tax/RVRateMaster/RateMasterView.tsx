"use client";

import { useMemo, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { RateMasterClientProps } from "@/types/RVRateMaster";
import { useRateMasterFilters } from "@/hooks/RVRateMaster/useRateMasterFilters";
import { RateViewFilters, RateViewActions, RateViewGrid } from "./view";
import { downloadDetailedRates } from "./view/rateDownloadHelpers";
import { filterTableData, countConfiguredRates, buildCategoryColorMap, buildRateColumns } from "./view/rateViewHelpers";

const singleColorClass = "text-blue-900";
const singleColorClassHeader = "text-blue-1000";

export default function RateMasterView({
  rateMasterData = [],
  totalPages = 0,
  totalCount = 0,
  zones = [],
  useGroups = [],
  assessmentYears = [],
  rateCategories = [],
  zoneDescriptions = [],
  initialZone = "ALL",
  initialUseGroup,
  initialYear = "ALL",
  rateUnitPolicy,
}: RateMasterClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("ptis_RVRateMaster");
  const tCommon = useTranslations("common");
  const pageNumber = Number(searchParams?.get("page")) || 1;
  const pageSize = Number(searchParams?.get("pageSize")) || 10;
  const zoneRemarksMap = useMemo(() => {
    const map = new Map<string, string>();
    zoneDescriptions.forEach(zone => {
      map.set(zone.zoneNo, zone.description || '');
    });
    return map;
  }, [zoneDescriptions]);
  const useGroupsFiltered = useMemo(() => {
    return useGroups.filter(opt => opt.value !== 'ALL');
  }, [useGroups]);

  const isPaginationEnabled = totalPages !== undefined && pageNumber !== undefined;
  const {
    selectedZone,
    selectedUseGroup,
    assessmentYear: selectedYear,
    handleDropdownChange,
  } = useRateMasterFilters({
    mode: "add",
    filterValues: {
      zone: initialZone,
      useGroup: initialUseGroup || (useGroupsFiltered.length > 0 ? useGroupsFiltered[0].value : ""),
      year: initialYear,
    },
    useGroupOptions: useGroupsFiltered,
  });

  const handleZoneChange = useCallback((value: string) => {
    handleDropdownChange('zone', value);
  }, [handleDropdownChange]);

  const handleYearChange = useCallback((value: string) => {
    handleDropdownChange('assessmentYear', value);
  }, [handleDropdownChange]);

  const handleUseGroupChange = useCallback((value: string) => {
    handleDropdownChange('useGroup', value);
  }, [handleDropdownChange]);
  const handleGenerateRate = () => {
    router.push(`/${locale}/property-tax/rate-master/rvratemaster/add`);
  };

  const handleEditRate = () => {
    const params = new URLSearchParams();
    params.set('zone', selectedZone ?? "");
    params.set('year', selectedYear ?? "");
    params.set('useGroup', selectedUseGroup ?? "");
    router.push(`/${locale}/property-tax/rate-master/rvratemaster/EditDelete/bulk?${params.toString()}`);
  };

  const handleDeleteRate = () => {
    const params = new URLSearchParams();
    params.set('zone', selectedZone ?? "");
    params.set('year', selectedYear ?? "");
    params.set('useGroup', selectedUseGroup ?? "");
    params.set('mode', 'delete');
    router.push(`/${locale}/property-tax/rate-master/rvratemaster/EditDelete/bulk?${params.toString()}`);
  };

  const handleDownloadRates = async () => {
    await downloadDetailedRates(selectedZone, zones, rateUnitPolicy?.value ?? "SqMeter", t, rateCategories);
  };
  const filteredData = useMemo(() =>
    filterTableData(rateMasterData, selectedZone, selectedYear, selectedUseGroup, isPaginationEnabled),
    [rateMasterData, selectedZone, selectedYear, selectedUseGroup, isPaginationEnabled]
  );
  const ratesConfiguredCount = useMemo(() =>
    countConfiguredRates(filteredData),
    [filteredData]
  );
  const categoryColorMap = useMemo(() =>
    buildCategoryColorMap(rateCategories, singleColorClass),
    [rateCategories]
  );

  const columns = useMemo(() =>
    buildRateColumns(rateCategories, singleColorClassHeader, tCommon, rateUnitPolicy?.value ?? "SqMeter"),
    [rateCategories, tCommon, rateUnitPolicy]
  );

  const isDownloadDisabled = !selectedZone || selectedZone === 'ALL' ||
    !selectedUseGroup || selectedUseGroup === 'ALL' ||
    !selectedYear || selectedYear === 'ALL';

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageSizeChange = (size: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    params.set('pageSize', size.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-1">
      {/* Combined Filters and Action Buttons Section */}
      <div className="bg-white border border-blue-200 rounded-xl shadow-sm p-2 md:p-3 pl-6">
        <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-end">
          {/* Filters */}
          <div className="flex-1 w-full">
            <RateViewFilters
              zones={zones}
              assessmentYears={assessmentYears}
              useGroupsFiltered={useGroupsFiltered}
              selectedZone={selectedZone}
              selectedYear={selectedYear}
              selectedUseGroup={selectedUseGroup ?? ""}
              onZoneChange={handleZoneChange}
              onYearChange={handleYearChange}
              onUseGroupChange={handleUseGroupChange}
              t={t}
            />
          </div>

          {/* Action Buttons */}
          <RateViewActions
            onGenerateRate={handleGenerateRate}
            onEditRate={handleEditRate}
            onDeleteRate={handleDeleteRate}
            onDownloadRates={handleDownloadRates}
            isDownloadDisabled={isDownloadDisabled}
            t={t}
          />
        </div>
      </div>

      {/* Grid Content */}
      <RateViewGrid
        data={filteredData}
        ratesConfiguredCount={ratesConfiguredCount}
        columns={columns}
        categoryColorMap={categoryColorMap}
        selectedZone={selectedZone}
        selectedYear={selectedYear}
        selectedUseGroup={selectedUseGroup ?? ""}
        zones={zones}
        assessmentYears={assessmentYears}
        useGroups={useGroups}
        zoneRemarksMap={zoneRemarksMap}
        rateUnit={rateUnitPolicy?.value ?? "SqMeter"}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        t={t}
        tCommon={tCommon}
      />
    </div>
  );
}
