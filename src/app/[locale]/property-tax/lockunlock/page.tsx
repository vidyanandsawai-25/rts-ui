import React from "react";
import { getTranslations } from "next-intl/server";
import LockUnlockMaster from "@/components/modules/property-tax/lockunlock/loackunlockmaster";
import { fetchWardsPagedAction } from "@/app/[locale]/property-tax/zone-master/actions";
import { fetchLockUnlockPropertiesPagedAction, getLockUnlockScreensAction } from "./action";
import { WardItem } from "@/types/wardMaster.types";
import { LockedScreen } from "@/types/loackunlock.types";

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
    />
  );
}