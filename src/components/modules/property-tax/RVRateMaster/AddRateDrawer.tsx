"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Building2 } from "lucide-react";
import { Drawer } from "@/components/common/Drawer";
import RateMasterForm from "./RateMasterForm";
import { AddRateDrawerProps } from "@/types/RVRateMaster";
import { useConfirm } from "@/components/common/ConfirmProvider";

export default function AddRateDrawer({
  zones,
  useGroups,
  assessmentYears,
  assessmentYearRanges,
  zoneDescriptions,
  allZones,
  rateCategories,
  showCopyRateSection,
  paginatedZonesData,
  initialExistingRatesCheck,
  rateFrequencyPolicy,
  rateUnitPolicy,
  isOpenPlot = false,
}: AddRateDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("ptis_RVRateMaster");
  const { confirm } = useConfirm();
  const [isFormDirty, setIsFormDirty] = useState(false);

  // Read filter values from URL params for persistence on reload
  const zoneParam = searchParams.get('zone');
  const useGroupParam = searchParams.get('useGroup');
  const yearParam = searchParams.get('year');
  const assessmentYearParam = searchParams.get('assessmentYear');
  const filterValues = useMemo(() => ({
    zone: zoneParam || undefined,
    useGroup: isOpenPlot ? "ALL" : (useGroupParam || undefined),
    year: yearParam || assessmentYearParam || undefined,
  }), [zoneParam, useGroupParam, yearParam, assessmentYearParam, isOpenPlot]);

  const handleClose = () => {
    if (isFormDirty) {
      confirm({
        title: t("messages.confirmCloseTitle"),
        confirmText: t("messages.confirmCloseConfirm"),
        cancelText: t("messages.confirmCloseCancel"),
        variant: "warning",
        onConfirm: () => {
          // Keep drawer open - do nothing
        },
        onCancel: () => {
          const routePrefix = isOpenPlot ? 'openplot' : 'rvratemaster';
          router.replace(`/${locale}/property-tax/rate-master/${routePrefix}`);
        }
      });
    } else {
      const routePrefix = isOpenPlot ? 'openplot' : 'rvratemaster';
      router.replace(`/${locale}/property-tax/rate-master/${routePrefix}`);
    }
  };

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
        zoneOptions={zones}
        useGroupOptions={useGroups}
        assessmentYears={assessmentYears}
        assessmentYearRanges={assessmentYearRanges ?? []}
        zoneDescriptions={zoneDescriptions}
        allZones={allZones || zoneDescriptions} // Use all zones if provided, otherwise fallback to paginated zones
        rateCategories={rateCategories}
        filterValues={filterValues}
        showCopyRateSection={showCopyRateSection}
        onClose={handleClose}
        paginatedZonesData={paginatedZonesData}
        initialExistingRatesCheck={initialExistingRatesCheck}
        rateFrequencyPolicy={rateFrequencyPolicy}
        rateUnitPolicy={rateUnitPolicy}
        isOpenPlot={isOpenPlot}
        onDirtyChange={setIsFormDirty}
      />
    </Drawer>
  );
}
