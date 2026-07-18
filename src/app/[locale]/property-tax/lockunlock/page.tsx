import React from "react";
import LockUnlockMaster from "@/components/modules/property-tax/lockunlock/LockUnlockMaster";
import { fetchWardsPagedAction, fetchZonesPagedAction } from "@/app/[locale]/property-tax/zone-master/actions";
import { getLockUnlockScreensAction, fetchLockUnlockPropertiesPagedAction, fetchLockUnlockPropertiesByCategoryAction } from "./action";
import { LockUnlockPropertyItem } from "@/types/lockunlock.types";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<React.ReactElement> {

  let dropdownProperties: { label: string; value: string; propertyId?: number }[] = [];
  let properties: LockUnlockPropertyItem[] = [];
  let initialPagination:
    | {
      pageNumber: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    }
    | undefined;

  const [zonesResult, wardsResult, screensResult] = await Promise.all([
    fetchZonesPagedAction(1, 100),
    fetchWardsPagedAction(1, -1),
    getLockUnlockScreensAction(),
  ]);
  const zones = zonesResult.items || [];
  const wards = wardsResult.items || [];
  const screens = screensResult || [];

  const params = await searchParams;
  const wardId = params?.wardId;
  const fromProperty = params?.fromProperty;
  const toProperty = params?.toProperty;

  // Fetch dropdown properties on the server ONLY if wardId is already in the URL
  if (wardId && typeof wardId === "string") {
    const dropdownResponse = await fetchLockUnlockPropertiesPagedAction({
      WardId: Number(wardId),
      PageNumber: 1,
      PageSize: -1,
    });
    const seen = new Set<string>();
    dropdownProperties = (dropdownResponse.items || [])
      .map((prop) => {
        const normalizedPartitionNo = String(prop.partitionNo ?? "").trim();
        const hasPartition =
          normalizedPartitionNo !== "" &&
          normalizedPartitionNo !== "0" &&
          normalizedPartitionNo !== "-";
        const displayValue = hasPartition
          ? `${prop.propertyNo}-${normalizedPartitionNo}`
          : prop.propertyNo;

        return {
          label: displayValue,
          value: displayValue,
          propertyId: prop.propertyId,
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
  const showParam = Array.isArray(params?.show) ? params?.show[0] : params?.show;
  const show = showParam === 'true';

  const searchParam = Array.isArray(params?.search) ? params?.search[0] : params?.search;
  const pageParam = Array.isArray(params?.page) ? params?.page[0] : params?.page;
  const pageSizeParam = Array.isArray(params?.pageSize) ? params?.pageSize[0] : params?.pageSize;
  const searchCategoryParam = Array.isArray(params?.searchCategory) ? params?.searchCategory[0] : params?.searchCategory;
  const zoneIdParam = Array.isArray(params?.zoneId) ? params?.zoneId[0] : params?.zoneId;
  const propertyNosParam = Array.isArray(params?.propertyNos) ? params?.propertyNos[0] : params?.propertyNos;

  const pageNum = pageParam ? Number(pageParam) : 1;
  const pageSz = pageSizeParam ? Number(pageSizeParam) : 10;
  const searchCategory = searchCategoryParam ? Number(searchCategoryParam) : 4;

  const normalizedSearch = searchParam ? searchParam.replace(/\s*-\s*/g, "-").trim() : undefined;

  // Fetch filtered properties when show=true and valid parameters for the category exist
  if (show) {
    let isValid = false;
    let queryParams: any = {
      SearchCategory: searchCategory,
      SearchTerm: normalizedSearch,
      PageNumber: pageNum,
      PageSize: pageSz,
    };

    if (searchCategory === 1 && zoneIdParam) {
      isValid = true;
      queryParams.ZoneId = Number(zoneIdParam);
    } else if (searchCategory === 2 && wardId) {
      isValid = true;
      queryParams.WardId = Number(wardId);
    } else if (searchCategory === 3 && wardId && propertyNosParam) {
      isValid = true;
      queryParams.WardId = Number(wardId);
      queryParams.Search = propertyNosParam;
    } else if (searchCategory === 4 && wardId && fromProperty && toProperty) {
      isValid = true;
      queryParams.WardId = Number(wardId);
      queryParams.PropertyFrom = fromProperty as string;
      queryParams.PropertyTo = toProperty as string;
    }

    if (isValid) {
      const propertiesResponse = await fetchLockUnlockPropertiesByCategoryAction(queryParams);
      properties = propertiesResponse.items || [];
      initialPagination = {
        pageNumber: propertiesResponse.pageNumber,
        pageSize: propertiesResponse.pageSize,
        totalCount: propertiesResponse.totalCount,
        totalPages: propertiesResponse.totalPages,
      };
    }
  }

  return (
    <main className="w-full flex-1  bg-[#F4F7F9]">
      <div className="">
        <LockUnlockMaster
          zones={zones}
          wards={wards}
          dropdownProperties={dropdownProperties}
          screens={screens}
          initialProperties={properties}
          initialPagination={initialPagination}
        />
      </div>
    </main>
  );
}

