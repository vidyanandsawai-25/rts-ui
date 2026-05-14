"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Building2 } from "lucide-react";
import { Drawer } from "@/components/common/Drawer";
import RateMasterForm from "./RateMasterForm";
import { AddRateDrawerProps, ISelectOption } from "@/types/RVRateMaster";

export default function AddRateDrawer({
  zones: _zones, // Not used, server data is replaced by lazy loading
  useGroups: _useGroups, // Not used, server data is replaced by lazy loading
  assessmentYears: _assessmentYears, // Not used, server data is replaced by lazy loading
  assessmentYearRanges,
  zoneDescriptions,
  allZones,
  rateCategories,
  showCopyRateSection,
  paginatedZonesData,
  initialExistingRatesCheck,
}: AddRateDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("ptis_RVRateMaster");

  // Read filter values from URL params for persistence on reload
  const zoneParam = searchParams.get('zone');
  const useGroupParam = searchParams.get('useGroup');
  const yearParam = searchParams.get('year');
  const assessmentYearParam = searchParams.get('assessmentYear');
  const filterValues = useMemo(() => ({
    zone: zoneParam || undefined,
    useGroup: useGroupParam || undefined,
    year: yearParam || assessmentYearParam || undefined,
  }), [zoneParam, useGroupParam, yearParam, assessmentYearParam]);

  const handleClose = () => {
    router.replace(`/${locale}/property-tax/rate-master/rvratemaster`);
  };
  
  // For lazy loading, pass empty arrays initially to trigger lazy loading behavior
  const emptyOptions = [] as ISelectOption[];
  
  return (
    <Drawer
      open={true}
      onClose={handleClose}
      title={
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md text-white">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-blue-900">
              {t("messages.generateNewRateDetails")}
            </h1>
            <p className="text-xs text-slate-500">
              {t("messages.fillRateDetails")}
            </p>
          </div>
        </div>
      }
      description={t("messages.fillRateDetails")}
      width="xl"
    >
      <RateMasterForm
        id={null}
        mode="add"
        zoneOptions={emptyOptions}
        useGroupOptions={emptyOptions}
        assessmentYears={emptyOptions}
        assessmentYearRanges={assessmentYearRanges ?? []}
        zoneDescriptions={zoneDescriptions}
        allZones={allZones || zoneDescriptions} // Use all zones if provided, otherwise fallback to paginated zones
        rateCategories={rateCategories}
        filterValues={filterValues}
        showCopyRateSection={showCopyRateSection}
        onClose={handleClose}
        paginatedZonesData={paginatedZonesData}
        initialExistingRatesCheck={initialExistingRatesCheck}
      />
    </Drawer>
  );
}
