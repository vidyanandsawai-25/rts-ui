// Server Component — fetches dropdown data only when requested via URL params
import { getFloorPaged } from "@/lib/api/floor.service";

import type { Floor } from "@/types/floor.types";
import type { ConstructionType } from "@/types/construction.types";
import type { UseType, UseSubType } from "@/types/typeOfUse.types";
import type { ApartmentQCDetail } from "@/types/apartmentQC.types";
import AmenitiesEditScreen from "@/components/modules/property-tax/ptis/appartmentQC/PropertyDetailsEditScreen";
import { getConstructionPaged } from "@/lib/api/construction-crud.service";
import { getUseTypesPagedServer } from "@/lib/api/typeofuse.service";
import { getSubTypesPagedServer } from "@/lib/api/typeofusesubtype.service";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ 
    loadFloors?: string; 
    loadConTypes?: string; 
    loadUseTypes?: string; 
    loadSubTypes?: string; 
  }>;
}

/** Fetches ALL floors across all pages */
async function fetchAllFloors(): Promise<Floor[]> {
  const pageSize = 1000;
  let page = 1;
  let all: Floor[] = [];
  let hasMore = true;
  while (hasMore) {
    const res = await getFloorPaged(page, pageSize);
    const items = res.items ?? [];
    all = [...all, ...items];
    if (items.length === 0 || all.length >= res.totalCount) hasMore = false;
    else page++;
  }
  return all;
}

/** Fetches ALL construction types across all pages */
async function fetchAllConstructionTypes(): Promise<ConstructionType[]> {
  const pageSize = -1;
  let page = 1;
  let all: ConstructionType[] = [];
  let hasMore = true;
  while (hasMore) {
    const res = await getConstructionPaged(page, pageSize);
    const items = res.items ?? [];
    all = [...all, ...items];
    if (items.length === 0 || all.length >= res.totalCount) hasMore = false;
    else page++;
  }
  return all;
}

/** Fetches ALL use types across all pages */
async function fetchAllUseTypes(): Promise<UseType[]> {
  const pageSize = -1;
  let page = 1;
  let all: UseType[] = [];
  let hasMore = true;
  while (hasMore) {
    const res = await getUseTypesPagedServer({ pageNumber: page, pageSize });
    const items = res.items ?? [];
    all = [...all, ...items];
    if (items.length === 0 || all.length >= res.totalCount) hasMore = false;
    else page++;
  }
  return all;
}

/** Fetches ALL sub-types across all pages (client will filter by selected typeOfUseId) */
async function fetchAllSubTypes(): Promise<UseSubType[]> {
  const pageSize = -1;
  let page = 1;
  let all: UseSubType[] = [];
  let hasMore = true;
  while (hasMore) {
    const res = await getSubTypesPagedServer({ pageNumber: page, pageSize });
    const items = res.items ?? [];
    all = [...all, ...items];
    if (items.length === 0 || all.length >= res.totalCount) hasMore = false;
    else page++;
  }
  return all;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { loadFloors, loadConTypes, loadUseTypes, loadSubTypes } = await searchParams;

  // Fetch dropdown data only when requested via URL params (on-click loading)
  const [floors, constructionTypes, useTypes, allSubTypes] = await Promise.all([
    loadFloors === "true" ? fetchAllFloors() : Promise.resolve([]),
    loadConTypes === "true" ? fetchAllConstructionTypes() : Promise.resolve([]),
    loadUseTypes === "true" ? fetchAllUseTypes() : Promise.resolve([]),
    loadSubTypes === "true" ? fetchAllSubTypes() : Promise.resolve([]),
  ]);

  // TODO: Replace mock data below with an actual property API call using `id`
  const propertyData = {
    id: Number(id),
    pdnId: 1,
    taxZoneId: 1,
    zoneNo: "1",
    propertyNo: id,
    wardId: 13,
    buildingNo: "N/A",
    society: "N/A",
    oldPropertyNo: `OLD-${id}`,
    wingName: "A",
    flatOrShopNo: "N/A",
    flatOrShopName: "Clubhouse",
    ownerName: "Society Admin",
    occupierName: "Society Admin",
    rentMonthly: 0,
    renterName: "-",
    typeOfUse: "Clubhouse",
    type: "Amenity",
    floor: "0",
    assessmentYear: "2023",
    constructionYear: "2018",
    constructionType: "RCC",
    bhk: "0",
    toiletCount: "4",
    carpetASqFt: 2000,
    builtupASqMtr: 2200,
    oldConstArea: 1800,
    oldRV: 0,
    rateableValue: 0,
    oldTotalTax: 0,
    newTaxTotal: 0,
    mobileNo: "9876543212",
    emailId: "amenities@example.com",
    ocDate: "2018-08-10",
    remark: "N/A",
  } as unknown as ApartmentQCDetail;

  return (
    <AmenitiesEditScreen
      open={true}
      propertyData={propertyData}
      returnTo="amenities"
      floors={floors}
      constructionTypes={constructionTypes}
      useTypes={useTypes}
      allSubTypes={allSubTypes}
    />
  );
}