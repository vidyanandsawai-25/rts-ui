import React from "react";
import LockUnlockMaster from "@/components/modules/property-tax/lockunlock/LockUnlockMaster";
import { fetchWardsPagedAction } from "@/app/[locale]/property-tax/zone-master/actions";
import { getLockUnlockScreensAction, fetchLockUnlockPropertiesPagedAction } from "./action";
import { LockUnlockPropertyItem } from "@/types/lockunlock.types";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<React.ReactElement> {

  let dropdownProperties: { label: string; value: string }[] = [];
  let properties: LockUnlockPropertyItem[] = [];
  let initialPagination:
    | {
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
      }
    | undefined;

  const [wardsResult, screensResult] = await Promise.all([
    fetchWardsPagedAction(1, -1),
    getLockUnlockScreensAction(),
  ]);
  const wards = wardsResult.items || [];
  const screens = screensResult || [];

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
      .map((p: LockUnlockPropertyItem) => {
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
      .filter((option: { label: string; value: string }) => {
        if (seen.has(option.value)) {
          return false;
        }
        seen.add(option.value);
        return true;
      });
  }

  // Fetch filtered properties when all required params are present
  if (wardId && fromProperty && toProperty && typeof wardId === "string" && typeof fromProperty === "string" && typeof toProperty === "string") {
    let partitionNoStr: string | undefined = undefined;
    if (dropdownProperties.length > 0) {
      const fromIdx = dropdownProperties.findIndex((p) => p.value === fromProperty);
      const toIdx = dropdownProperties.findIndex((p) => p.value === toProperty);
      if (fromIdx !== -1 && toIdx !== -1 && fromIdx <= toIdx) {
        const range = dropdownProperties.slice(fromIdx, toIdx + 1);
        const partitions = range
          .map((p) => p.value.includes("-") ? p.value.substring(p.value.indexOf("-") + 1) : "0");
        if (partitions.length > 0) {
          partitionNoStr = partitions.join(",");
        }
      }
    }

    const propertiesResponse = await fetchLockUnlockPropertiesPagedAction({
      WardId: Number(wardId),
      FromPropertyNo: fromProperty.split("-")[0],
      ToPropertyNo: toProperty.split("-")[0],
      PartitionNo: partitionNoStr,
      PageNumber: 1,
      PageSize: 10,
    });
    properties = propertiesResponse.items || [];
    initialPagination = {
      pageNumber: propertiesResponse.pageNumber,
      pageSize: propertiesResponse.pageSize,
      totalCount: propertiesResponse.totalCount,
      totalPages: propertiesResponse.totalPages,
    };
  }

  return (
    <LockUnlockMaster
      wards={wards}
      dropdownProperties={dropdownProperties}
      screens={screens}
      initialProperties={properties}
      initialPagination={initialPagination}
    />
  );
}
