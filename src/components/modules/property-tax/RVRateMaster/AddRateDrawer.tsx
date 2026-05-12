"use client";

import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Building2 } from "lucide-react";
import { Drawer } from "@/components/common/Drawer";
import RateMasterForm from "./RateMasterForm";
import { AddRateDrawerProps } from "@/types/RVRateMaster";

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
}: AddRateDrawerProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("ptis_RVRateMaster");

  const handleClose = () => {
    router.replace(`/${locale}/property-tax/rate-master/rvratemaster`);
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
        showCopyRateSection={showCopyRateSection}
        onClose={handleClose}
        paginatedZonesData={paginatedZonesData}
        initialExistingRatesCheck={initialExistingRatesCheck}
      />
    </Drawer>
  );
}
