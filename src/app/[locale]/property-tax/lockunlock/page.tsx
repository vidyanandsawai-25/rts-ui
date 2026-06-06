import React from "react";
import { getTranslations } from "next-intl/server";
import LockUnlockMaster from "@/components/modules/property-tax/lockunlock/loackunlockmaster";
import { fetchWardsPagedAction } from "@/app/[locale]/property-tax/zone-master/actions";
import { getLockUnlockScreensAction, fetchLockUnlockPropertiesPagedAction } from "./action";
import { WardItem } from "@/types/wardMaster.types";
import { LockedScreen, LockUnlockPropertyItem } from "@/types/loackunlock.types";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<React.ReactElement> {
  const t = await getTranslations("lockUnlock");

  let wards: WardItem[] = [];
  let dropdownProperties: { label: string; value: string }[] = [];
  let screens: LockedScreen[] = [];
  let properties: LockUnlockPropertyItem[] = [];
  let errorMsg: string | null = null;

  try {
    const [wardsResult, screensResult] = await Promise.all([
      fetchWardsPagedAction(1, -1),
      getLockUnlockScreensAction(),
    ]);
    wards = wardsResult.items || [];
    screens = screensResult || [];

    const params = await searchParams;
    const wardId = params?.wardId;
    const fromProperty = params?.fromProperty;
    const toProperty = params?.toProperty;

    // Fetch dropdown properties when wardId is selected
    if (wardId && typeof wardId === "string") {
      const propertiesResponse = await fetchLockUnlockPropertiesPagedAction({
        WardId: Number(wardId),
        PageNumber: 1,
        PageSize: -1,
      });
      const seen = new Set<string>();
      dropdownProperties = (propertiesResponse.items || [])
        .map((p) => {
          const normalizedPartitionNo = String(p.partitionNo ?? "").trim();
          const hasPartition =
            normalizedPartitionNo !== "" &&
            normalizedPartitionNo !== "0" &&
            normalizedPartitionNo !== "-";
          const displayValue = hasPartition
            ? `${p.propertyNo}-${normalizedPartitionNo}`
            : p.propertyNo;
          return {
            label: displayValue,
            value: displayValue,
          };
        })
        .filter((option) => {
          if (seen.has(option.value)) {
            return false;
          }
          seen.add(option.value);
          return true;
        });
    }

    // Fetch filtered properties when all required params are present
    if (wardId && fromProperty && toProperty && typeof wardId === "string" && typeof fromProperty === "string" && typeof toProperty === "string") {
      const propertiesResponse = await fetchLockUnlockPropertiesPagedAction({
        WardId: Number(wardId),
        FromPropertyNo: fromProperty.split("-")[0],
        ToPropertyNo: toProperty.split("-")[0],
        PageNumber: 1,
        PageSize: 10,
      });
      properties = propertiesResponse.items || [];
    }
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : String(err);
  }

  if (errorMsg) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          <strong>{t("messages.fetchWardsError")}</strong> {errorMsg}
        </div>
      </div>
    );
  }

  return (
    <LockUnlockMaster
      wards={wards}
      dropdownProperties={dropdownProperties}
      screens={screens}
      initialProperties={properties}
      initialPagination={{
        pageNumber: 1,
        pageSize: 10,
        totalCount: properties.length,
        totalPages: Math.ceil(properties.length / 10),
      }}
    />
  );
}
