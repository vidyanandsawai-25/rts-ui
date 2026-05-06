"use client";

import { useMemo, useCallback } from "react";
import {  CheckCircle, MapPin, Calendar, Users } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { SearchSelect, StatusBadge, MatrixGrid,AddButton} from "@/components/common";
import { MatrixGridPagination } from "@/components/common/MatrixGrid";
import { DownloadButton, EditLabelButton, DeleteLabelButton } from "@/components/common/ActionButtons";
import type { MatrixColumn } from "@/components/common";
import { GridContainerCard, GridContainerCardHeader, GridContainerCardContent } from "@/components/common/GridContainerCard";
import { toast } from "sonner";
import { getDetailedRatesAction } from "@/app/[locale]/property-tax/rate-master/rvratemaster/action";
import type { IRateValue, IRateMaster, RateMasterClientProps } from "@/types/RVRateMaster";
import { useRateMasterFilters } from "@/hooks/RVRateMaster/useRateMasterFilters";

/* ---------------- Rate Header Styles ---------------- */

// Dynamic color palette for rate categories (no border, only text color and background)
const singleColorClass = "text-blue-900";
const singleColorClassHeader = "text-blue-1000";

// This will be set inside the component to ensure rateCategories is available
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
}: RateMasterClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("ptis_RVRateMaster");
  const tCommon = useTranslations("common");

  // Pagination state from search params 
  const pageNumber = Number(searchParams?.get("page")) || 1;
  const pageSize = Number(searchParams?.get("pageSize")) || 10;

  // Create a map of zoneNo to remark (description) for tooltips
  const zoneRemarksMap = useMemo(() => {
    const map = new Map<string, string>();
    zoneDescriptions.forEach(zone => {
      map.set(zone.zoneNo, zone.description || '');
    });
    return map;
  }, [zoneDescriptions]);


  // Remove 'All Use Groups' option from dropdown
  const useGroupsFiltered = useMemo(() => {
    return useGroups.filter(opt => opt.value !== 'ALL');
  }, [useGroups]);

  // Check if pagination is enabled
  const isPaginationEnabled = totalPages !== undefined && pageNumber !== undefined;

  /* ---------------- Filters ---------------- */

  // Use custom filter hook for dropdown state management
  const {
    selectedZone,
    selectedUseGroup,
    assessmentYear: selectedYear,
    handleDropdownChange,
  } = useRateMasterFilters({
    mode: "add", // Use "add" mode to enable URL navigation
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

  /* ---------------- Header Logic ---------------- */

  /* ---------------- Navigation Handlers ---------------- */

  const handleGenerateRate = () => {
    router.push(`/${locale}/property-tax/rate-master/rvratemaster/add`);
  };

  const handleEditRate = () => {
    // Pass filter values as query parameters
    const params = new URLSearchParams();
    params.set('zone', selectedZone ?? "");
    params.set('year', selectedYear ?? "");
    params.set('useGroup', selectedUseGroup ?? "");
    router.push(`/${locale}/property-tax/rate-master/rvratemaster/EditDelete/bulk?${params.toString()}`);
  };

  const handleDeleteRate = () => {
    // Pass filter values as query parameters with mode=delete
    const params = new URLSearchParams();
    params.set('zone', selectedZone ?? "");
    params.set('year', selectedYear ?? "");
    params.set('useGroup', selectedUseGroup ?? "");
    params.set('mode', 'delete');
    router.push(`/${locale}/property-tax/rate-master/rvratemaster/EditDelete/bulk?${params.toString()}`);
  };

  const handleDownloadRates = async () => {
    if (!selectedZone || selectedZone === 'ALL') {
      toast.error(t('messages.selectRateSection'));
      return;
    }

    try {
      toast.loading(t('messages.downloadingRates'));     
      // Fetch detailed rates from backend API - only filter by Rate Section
      // Download all Use Groups and all Year Ranges for the selected Rate Section
      // Use PageSize=-1 to fetch ALL records without pagination limit
      const detailedRatesResponse = await getDetailedRatesAction(
        selectedZone,
        undefined, // Don't filter by Use Group - get all
        undefined, // Don't filter by Year Range - get all
        1,         // Page Number
        -1         // Page Size: -1 means fetch all records
      );
      const allRates = ((detailedRatesResponse as { items?: unknown[] })?.items || []) as Array<{
        rateSection?: string;
        taxZone?: string;
        typeOfUseGroup?: string;
        yearRangeRV?: string;
        constructionType?: string;
        rateSquareMeter?: number;
        rateSquareFeet?: number;
        rateRemark?: string;
      }>;

      if (!allRates || allRates.length === 0) {
        toast.dismiss();
        toast.error(t('messages.noRatesAvailable'));
        return;
      }

      // Format data as CSV directly from API fields, localized
      const headers = [
        t('downloadHeaders.rateSection'),
        t('downloadHeaders.taxZoneNo'),
        t('downloadHeaders.useGroup'),
        t('downloadHeaders.assessmentYearRange'),
        t('downloadHeaders.constructionType'),
        t('downloadHeaders.rateSqMtr'),
        t('downloadHeaders.rateSqFt'),
        t('downloadHeaders.rateRemark')
      ];

      // Helper function to escape CSV values
      const escapeCsvValue = (value: unknown): string => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };


      const rows = allRates.map((rate: { rateSection?: string; taxZone?: string; typeOfUseGroup?: string; yearRangeRV?: string; constructionType?: string; rateSquareMeter?: number; rateSquareFeet?: number; rateRemark?: string }) => [
        escapeCsvValue(rate.rateSection),
        escapeCsvValue(rate.taxZone),
        escapeCsvValue(rate.typeOfUseGroup),
        escapeCsvValue(rate.yearRangeRV), // Use yearRangeRV (e.g., "1700-1997") instead of ID
        escapeCsvValue(rate.constructionType),
        escapeCsvValue(rate.rateSquareMeter),
        escapeCsvValue(rate.rateSquareFeet),
        escapeCsvValue(rate.rateRemark)
      ]);


      const csvContent = [
        headers.map((h: string) => escapeCsvValue(h)).join(','),
        ...rows.map((row: string[]) => row.join(','))
      ].join('\r\n');

      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csvContent;

      const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Include only Rate Section in the filename since we're downloading all use groups and years
      const zoneName = zones.find(z => z.value === selectedZone)?.label || selectedZone;
      const fileName = `Rate_Master_${zoneName}_AllUseGroups_AllYears_${new Date().toISOString().split('T')[0]}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss();
      toast.success(t('messages.ratesDownloaded'));
    } catch (_error) {
      toast.dismiss();
      toast.error(t('messages.downloadFailed'));
    }
  };

  /* ---------------- Filtered Table Data ---------------- */

  // TRUE server-side pagination: data is already paginated by zones on server
  // For non-paginated mode: filter client-side
  const filteredData = useMemo(() => {
    if (isPaginationEnabled) {
      return rateMasterData;
    }

    // Client-side filtering for non-paginated views
    return rateMasterData.filter((row) => {
      if (selectedZone !== "ALL" && row.zoneSection !== selectedZone)
        return false;
      if (selectedYear !== "ALL" && row.assessmentYear !== selectedYear)
        return false;
      if (selectedUseGroup !== "ALL" && row.useGroup !== selectedUseGroup)
        return false;
      return true;
    });
  }, [rateMasterData, selectedZone, selectedYear, selectedUseGroup, isPaginationEnabled]);

  /* ---------------- Calculate Rates Configured ---------------- */

  const ratesConfiguredCount = useMemo(() => {
    return filteredData.reduce((count, row) => {
      const filledRates = row.rates?.filter((r: IRateValue) => r.ratePerSqMtr != null && r.ratePerSqMtr > 0).length || 0;
      return count + filledRates;
    }, 0);
  }, [filteredData]);

  const matrixTranslations = useMemo(() => ({
    action: tCommon('table.columns.actions'),
    currencySymbol: "₹",
    deleteRow: tCommon('buttons.delete'),
  }), [tCommon]);

  /* ---------------- Table Columns ---------------- */

  // Assign color classes to each rate category dynamically
  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    rateCategories.forEach((cat) => {
      const catCode = typeof cat === 'string' ? cat : (cat.constructionCode || cat.constructionId);
      map[catCode.toUpperCase()] = singleColorClass;
    });
    return map;
  }, [rateCategories]);

  const columns: MatrixColumn[] = useMemo(() => {
    // Build columns for ALL construction types from rateCategories
    // No filtering based on data presence - show all construction type columns
    const seenCodes = new Set<string>();
    
    const builtColumns: MatrixColumn[] = rateCategories
      .map((cat) => {
        const catCode = typeof cat === 'string' ? cat : (cat.constructionCode || cat.constructionId);
        const description = typeof cat !== 'string' ? cat.description : undefined;
        const normalizedCode = catCode.trim().toUpperCase();
        // Skip duplicates
        if (seenCodes.has(normalizedCode)) {
          return null;
        }
        seenCodes.add(normalizedCode);
        return {
          id: catCode,
          label: (
            <span className={`inline-block font-bold rounded-lg px-2 py-0.5 ${singleColorClassHeader}`}>
              {normalizedCode} <span className="text-[10px] font-normal">{tCommon('rateUnit')}</span>
            </span>
          ) as React.ReactNode,
          tooltip: description,
          headerClassName: `${singleColorClassHeader} font-bold text-xs text-center rounded-lg`
        } as MatrixColumn;
      })
      .filter((col): col is MatrixColumn => col !== null);
    

    
    return builtColumns;
  }, [rateCategories, tCommon]);


  /* ---------------- Filters UI ---------------- */
  const filtersUI = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 w-200">
      {/* Rate Section */}
      <div className="flex flex-col gap-1">
        <label htmlFor="zone-select" className="flex items-center gap-1 text-xs font-medium text-gray-700">
          <MapPin className="w-3.5 h-3.5 text-blue-500" />
          {t('filters.rateSection')}
        </label>
        <SearchSelect
          id="zone-select"
          name="zone"
          label=""
          options={zones}
          value={selectedZone}
          onChange={(_name, value) => handleZoneChange(value)}
          className="h-7 w-10 text-xs"
        />

      </div>

      {/* Assessment Year */}
      <div className="flex flex-col gap-1">
        <label htmlFor="year-select" className="flex items-center gap-1 text-xs font-medium text-gray-700">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          {t('filters.assessmentYear')}
        </label>
        <SearchSelect
          id="year-select"
          name="year"
          label=""
          options={assessmentYears}
          value={selectedYear}
          onChange={(_name, value) => handleYearChange(value)}
          className="h-7 w-20 text-xs"
        />

      </div>

      {/* Use Group */}
      <div className="flex flex-col gap-1">
        <label htmlFor="useGroup-select" className="flex items-center gap-1 text-xs font-medium text-gray-700">
          <Users className="w-3.5 h-3.5 text-blue-500" />
          {t('filters.useGroup')}
        </label>
        <SearchSelect
          id="useGroup-select"
          name="useGroup"
          label=""
          options={useGroupsFiltered}
          value={selectedUseGroup ?? ""}
          onChange={(_name, value) => handleUseGroupChange(value)}
          className="h-7 text-xs"
        />

      </div>
    </div>
  ), [
    t, 
    zones, 
    selectedZone, 
    handleZoneChange, 
    assessmentYears, 
    selectedYear, 
    handleYearChange, 
    useGroupsFiltered, 
    selectedUseGroup, 
    handleUseGroupChange
  ]);

  const renderGrid = (
    data: IRateMaster[],
    ratesConfigured: number,
    useGroupLabel: string,
    key?: string,
    emptyMessage?: string
  ) => (
    <GridContainerCard
      key={key}
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
                label={t('messages.ratesConfigured', { count: ratesConfigured })}
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
                    // Fallback: check for direct property match if not found in rates array
                    value = (row as unknown as Record<string, unknown>)[col.id] as number;
                  }
                  return [col.id, value];
                })
              );
              
              // Resolve yearRangeId to year range label (fromYear-toYear)
              const yearRangeLabel = (() => {
                const yearRangeId = row.assessmentYear;
                if (!yearRangeId) return '';
                const yearOption = assessmentYears.find(opt => opt.value === yearRangeId);
                return yearOption ? yearOption.label : yearRangeId;
              })();
              
              // Create a deterministic unique ID if row.id is missing
              // Include rowIndex as final fallback to guarantee uniqueness
              const uniqueId = row.id ?? `${row.zoneNo ?? row.zoneSection ?? 'Z'}-${row.useGroup ?? 'UG'}-${row.assessmentYear ?? 'AY'}-${rowIndex}`;
              
              // Get zone remark for tooltip
              const zoneNoValue = row.zoneNo ?? row.zoneSection ?? "";
              const zoneRemark = zoneRemarksMap.get(zoneNoValue) || "";
              
              return {
                id: uniqueId,
                cells,
                meta: {
                  zoneNo: zoneNoValue,
                  zoneNo_tooltip: zoneRemark, // Tooltip content for zone number
                  assessmentYear: yearRangeLabel,
                },
              };
            })}
            colorMap={categoryColorMap}
            getCellClassName={(value) => {
              // Highlight cells: blue for values > 0, light gray for 0
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
              onPageChange={(page) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', page.toString());
                params.set('pageSize', pageSize.toString());
                router.push(`${pathname}?${params.toString()}`);
              }}
              onPageSizeChange={(size) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', '1');
                params.set('pageSize', size.toString());
                router.push(`${pathname}?${params.toString()}`);
              }}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6 md:p-12 text-center">
            <div className="text-gray-400 text-base md:text-lg font-medium">
              {emptyMessage || tCommon('table.noData')}
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-2">
              {emptyMessage ? t('messages.noRatesMatch') : tCommon('table.noRecordsFound')}
            </p>
          </div>
        )}
      </GridContainerCardContent>
    </GridContainerCard>
  );

  /* ---------------- Render ---------------- */
  return (
    <div className="space-y-1">

      {/* Combined Filters and Action Buttons Section */}
      <div className="bg-white border border-blue-200 rounded-xl shadow-sm p-2 md:p-3 pl-6">
            <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-end">
              {/* Filters */}
              <div className="flex-1 w-full">
                {filtersUI}
              </div>

              
              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto md:shrink-0">
                {/* Download Rates Button */}
                <DownloadButton
                  label={t('buttons.downloadRates')}
                  onClick={handleDownloadRates}
                  disabled={
                    !selectedZone || selectedZone === 'ALL' ||
                    !selectedUseGroup || selectedUseGroup === 'ALL' ||
                    !selectedYear || selectedYear === 'ALL'
                  }
                  size="sm"
                  className="border border-green-400 text-green-600 bg-transparent hover:bg-green-50 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                />    
                <AddButton
                  onClick={handleGenerateRate}
                   size="sm"
                   label={t('buttons.generateRate')}
                />      
                <EditLabelButton
                  onClick={handleEditRate}
                   size="sm"
                   label={t('buttons.editRates')}
                />
                                   
                   <DeleteLabelButton
                  onClick={handleDeleteRate}
                   size="sm"
                   label={t('buttons.deleteRate')}
                />                
              </div>
            </div>
          </div>

      {/* Content based on active tab */}
      {renderGrid(
        filteredData,
        ratesConfiguredCount,
        useGroups.find(u => u.value === selectedUseGroup)?.label || selectedUseGroup || ""
      )}
    </div>
  );
}

