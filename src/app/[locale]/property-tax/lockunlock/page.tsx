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

  const resolvedSearchParams = await searchParams;

  let dropdownProperties: { label: string; value: string; propertyId?: number; propertyNo?: string; partitionNo?: string }[] = [];
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

  const searchCategoryParam = Array.isArray(resolvedSearchParams?.searchCategory) ? resolvedSearchParams?.searchCategory[0] : resolvedSearchParams?.searchCategory;
  const searchCategory = searchCategoryParam ? Number(searchCategoryParam) : 1;

  const wardId = resolvedSearchParams?.wardId;
  const fromProperty = resolvedSearchParams?.fromProperty;
  const toProperty = resolvedSearchParams?.toProperty;

  // Fetch dropdown properties on the server ONLY if wardId is already in the URL and we need property selection
  if (wardId && typeof wardId === "string" && (searchCategory === 3 || searchCategory === 4)) {
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
          propertyNo: prop.propertyNo,
          partitionNo: normalizedPartitionNo,
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
  const showParam = Array.isArray(resolvedSearchParams?.show) ? resolvedSearchParams?.show[0] : resolvedSearchParams?.show;
  const show = showParam === 'true';

  const searchParam = Array.isArray(resolvedSearchParams?.search) ? resolvedSearchParams?.search[0] : resolvedSearchParams?.search;
  const pageParam = Array.isArray(resolvedSearchParams?.page) ? resolvedSearchParams?.page[0] : resolvedSearchParams?.page;
  const pageSizeParam = Array.isArray(resolvedSearchParams?.pageSize) ? resolvedSearchParams?.pageSize[0] : resolvedSearchParams?.pageSize;
  const pageSz = pageSizeParam ? Number(pageSizeParam) : 10;
  
  const zoneIdParam = Array.isArray(resolvedSearchParams?.zoneId) ? resolvedSearchParams?.zoneId[0] : resolvedSearchParams?.zoneId;
  const propertyNosParam = Array.isArray(resolvedSearchParams?.propertyNos) ? resolvedSearchParams?.propertyNos[0] : resolvedSearchParams?.propertyNos;
  const pageNum = pageParam ? Number(pageParam) : 1;

  const normalizedSearch = searchParam ? searchParam.replace(/\s*-\s*/g, "-").trim() : undefined;

  // Fetch filtered properties when show=true and valid parameters for the category exist
  if (show) {
    let isValid = false;
    const queryParams: Record<string, unknown> = {
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
      queryParams.WardId = Number(wardId);
      
      const propertyNosArr = (propertyNosParam as string).split(",");
      let basePropertyNo = "";
      const partitions: string[] = [];
      let currentValid = true;

      for (const propStr of propertyNosArr) {
        const matchedOption = dropdownProperties.find((o) => o.value === propStr);
        let propNo = "";
        let partition = "";
        
        if (matchedOption) {
          propNo = matchedOption.propertyNo || "";
          partition = matchedOption.partitionNo || "";
        } else {
          const parts = propStr.split("-");
          propNo = parts[0];
          partition = parts.length > 1 ? parts.slice(1).join("-") : "";
        }
        
        if (!basePropertyNo) {
          basePropertyNo = propNo;
        } else if (basePropertyNo !== propNo) {
          currentValid = false;
          break;
        }
        
        if (partition) {
          partitions.push(partition);
        }
      }

      if (currentValid && basePropertyNo) {
        isValid = true;
        queryParams.PropertyNo = basePropertyNo;
        if (partitions.length > 0) {
          queryParams.PartitionNo = partitions.join(",");
        }
      }
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

